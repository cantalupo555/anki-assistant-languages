// Import necessary dependencies and utility functions
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import { handleExport } from './utils/languageCardExporter';
import { stripMarkdown } from './utils/markdownStripper';
import { voiceOptions, VoiceOption } from './utils/voiceOptions';
import LanguageSelector from './components/languageSelector';
import Notifications from './components/Notifications';

const ankiNoteTypeFile = process.env.PUBLIC_URL + '/assets/AnkiAssistantLanguages.apkg';

// Define the backend API URLs, using environment variables
const API_URL_DEFINITIONS = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/definitions';
const API_URL_SENTENCES = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/sentences';
const TTS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/tts';
const TRANSLATION_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/translate';

// Interface to define the format of the result
interface Result {
  word: string;
  definitions: { text: string; tokenCount: TokenCount };
  sentences: { text: string[]; tokenCount: TokenCount; totalPages: number };
  totalTokenCount: TokenCount;
}

// Interface to define the format of the TokenCount
interface TokenCount {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// Interface for saved items
interface SavedItem {
  sentence: string;
  definition: string;
  audioKey?: string;
  translation?: string;
}

// Interface for TTS options
interface TTSOption {
  name: string;
  value: string;
}

// Array of available TTS options
const ttsOptions: TTSOption[] = [
  { name: 'Google TTS', value: 'google' },
  { name: 'Azure TTS', value: 'azure' },
];

// Define state variables and initialize them with default or persisted values
export default function App() {
  const [word, setWord] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState(() => {
    return localStorage.getItem('nativeLanguage') || '';
  });
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || '';
  });
  const [definitions, setDefinitions] = useState<{ text: string; tokenCount: TokenCount } | null>(null);
  const [sentences, setSentences] = useState<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>(null);
  const [totalTokenCount, setTotalTokenCount] = useState<TokenCount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [showRemoveNotification, setShowRemoveNotification] = useState(false);
  const [showClearAllNotification, setShowClearAllNotification] = useState(false);
  const [showGenerateNotification, setShowGenerateNotification] = useState(false);
  const [audioData, setAudioData] = useState<{ [key: string]: string }>({});
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationTokenCount, setTranslationTokenCount] = useState<TokenCount | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedTTS, setSelectedTTS] = useState<TTSOption>(ttsOptions[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voiceOptions[0]);

  // Effect to load saved items from localStorage on component mount
  useEffect(() => {
    const savedItemsFromStorage = localStorage.getItem('savedItems');
    const audioDataFromStorage = localStorage.getItem('audioData');
    if (savedItemsFromStorage) {
      setSavedItems(JSON.parse(savedItemsFromStorage));
    }
    if (audioDataFromStorage) {
      setAudioData(JSON.parse(audioDataFromStorage));
    }
  }, []);

  // Save language selection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nativeLanguage', nativeLanguage);
    localStorage.setItem('selectedLanguage', targetLanguage);
  }, [nativeLanguage, targetLanguage]);

  // Sets the default voice option based on the selected language
  useEffect(() => {
    const defaultVoice = voiceOptions.find(voice => voice.language === targetLanguage) || voiceOptions[0];
    setSelectedVoice(defaultVoice);
  }, [targetLanguage]);

  // Effect to fetch Azure voices when Azure TTS is selected
  useEffect(() => {
    const defaultVoice = voiceOptions.find(
        voice => voice.language === targetLanguage && voice.ttsService === selectedTTS.value
    ) || voiceOptions[0];
    setSelectedVoice(defaultVoice);
  }, [targetLanguage, selectedTTS]);

  // Set up a timer to automatically hide notification messages after 3 seconds
  useEffect(() => {
    if (showSaveNotification || showExportNotification || showRemoveNotification || showClearAllNotification || showGenerateNotification) {
      const timer = setTimeout(() => {
        // Hide the corresponding notification messages after 3 seconds
        setShowSaveNotification(false);
        setShowExportNotification(false);
        setShowRemoveNotification(false);
        setShowClearAllNotification(false);
        setShowGenerateNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSaveNotification, showExportNotification, showRemoveNotification, showClearAllNotification, showGenerateNotification]);

  // Hook to handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nativeLanguage || !targetLanguage) {
      setError('Please select both your native language and the target language.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      // Fetch definitions
      const definitionsResponse = await fetch(API_URL_DEFINITIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: targetLanguage }),
      });

      if (!definitionsResponse.ok) {
        throw new Error(`HTTP error! status: ${definitionsResponse.status}`);
      }

      const definitionsData = await definitionsResponse.json();
      setDefinitions(definitionsData.definitions);

      // Fetch sentences
      const sentencesResponse = await fetch(API_URL_SENTENCES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: targetLanguage }),
      });

      if (!sentencesResponse.ok) {
        throw new Error(`HTTP error! status: ${sentencesResponse.status}`);
      }

      const sentencesData = await sentencesResponse.json();
      setSentences(sentencesData.sentences);

      // Calculate total token count
      const totalTokenCount = {
        inputTokens: definitionsData.definitions.tokenCount.inputTokens + sentencesData.sentences.tokenCount.inputTokens,
        outputTokens: definitionsData.definitions.tokenCount.outputTokens + sentencesData.sentences.tokenCount.outputTokens,
        totalTokens: definitionsData.definitions.tokenCount.totalTokens + sentencesData.sentences.tokenCount.totalTokens
      };
      setTotalTokenCount(totalTokenCount);

      setShowGenerateNotification(true);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle clicking on a sentence
  const handleSentenceClick = (sentence: string) => {
    setSelectedSentence(sentence);
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to get current page sentences
  const getCurrentPageSentences = () => {
    if (!sentences) return [];
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    return sentences.text.slice(startIndex, endIndex);
  };

  // Function to handle the translation of a given sentence
  const handleTranslation = async (sentence: string): Promise<string> => {
    try {
      // Send a POST request to the translation API endpoint
      const response = await fetch(TRANSLATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sentence,
          nativeLanguage: nativeLanguage,
          targetLanguage: targetLanguage
        }),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the response JSON data
      const data = await response.json();
      setTranslation(data.translation); // Set the state
      setTranslationTokenCount(data.tokenCount); // Set the token count state
      return data.translation; // Return the translation
    } catch (error) {
      console.error('Error translating sentence:', error);
      setError('An error occurred while translating the sentence. Please try again.');
      return ''; // Return an empty string or some default value in case of error
    }
  };

  // Function to save the selected phrase with its definition, TTS and translation
  const handleSaveItem = async () => {
    if (selectedSentence && definitions && sentences) {
      try {
        // Always generate new TTS for the selected sentence
        const audioBlob = await generateTTS(selectedSentence);
        const translation = await handleTranslation(selectedSentence);

        const audioKey = `audio_${Date.now()}`; // Generate a unique key for the audio
        const newItem: SavedItem = {
          sentence: selectedSentence,
          definition: definitions.text,
          audioKey: audioKey,
          translation: translation
        };

        if (!savedItems.some(item => item.sentence === newItem.sentence)) {
          const newSavedItems = [...savedItems, newItem];
          setSavedItems(newSavedItems);
          localStorage.setItem('savedItems', JSON.stringify(newSavedItems));

          // Convert Blob to base64 string
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const newAudioData = { ...audioData, [audioKey]: reader.result };
              setAudioData(newAudioData);
              localStorage.setItem('audioData', JSON.stringify(newAudioData));
            }
          };
          reader.readAsDataURL(audioBlob);

          setShowSaveNotification(true);
        }
      } catch (error) {
        console.error('Error generating TTS:', error);
        setError('An error occurred while generating audio. The item will be saved without audio.');
      }
    }
  };

  // Function to generate TTS
  const generateTTS = async (sentence: string): Promise<Blob> => {
    const strippedSentence = stripMarkdown(sentence);
    const response = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: strippedSentence,
        voice: selectedVoice.value,
        languageCode: selectedVoice.languageCode,
        ttsService: selectedTTS.value // Include the selected TTS service
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  };

  // Function to remove a saved item
  const handleRemoveSavedItem = (itemToRemove: SavedItem) => {
    const newSavedItems = savedItems.filter(item => item.sentence !== itemToRemove.sentence);
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify(newSavedItems));

    if (itemToRemove.audioKey) {
      const newAudioData = { ...audioData };
      delete newAudioData[itemToRemove.audioKey];
      setAudioData(newAudioData);
      localStorage.setItem('audioData', JSON.stringify(newAudioData));
    }

    setShowRemoveNotification(true);
  };

  // Function to clear all saved items
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved items? This action cannot be undone.')) {
      setSavedItems([]);
      setAudioData({});
      localStorage.removeItem('savedItems');
      localStorage.removeItem('audioData');
      setShowClearAllNotification(true);
    }
  };

  // Function to handle exporting saved items
  const handleExportClick = () => {
    if (savedItems.length === 0) {
      alert('No items to export.');
      return;
    }

    handleExport(savedItems, audioData);
    setShowExportNotification(true);
  };

  // Function to handle TTS request
  const handleTTS = async (sentence: string) => {
    try {
      const audioBlob = await generateTTS(sentence);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setError('An error occurred while playing the audio. Please try again.');
    }
  };

  // Function to play saved audio
  const playSavedAudio = (audioKey: string) => {
    const audioDataUrl = audioData[audioKey];
    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audio.play();
    }
  };

  // Function to handle smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Render the main application components
  return (
      <div className="app-container">
        <header className="app-header">
          <h1>📚📖🔖 Anki Assistant Languages</h1>
          <nav>
            <ul>
              <li><a href="#card-generator">Card Generator</a></li>
              <li><a href="#saved-items">Saved Items</a></li>
            </ul>
          </nav>
        </header>

        <main>
          {/* Render the card generator section */}
          <section id="card-generator">
            <h2>Card Generator</h2>
            <form onSubmit={handleSubmit}>
              {/* Render the LanguageSelector component */}
              <LanguageSelector
                  nativeLanguage={nativeLanguage}
                  setNativeLanguage={setNativeLanguage}
                  targetLanguage={targetLanguage}
                  setTargetLanguage={setTargetLanguage}
              />

              {/* TTS service selection dropdown */}
              <label htmlFor="tts-select">Select TTS Service:</label>
              <select
                  id="tts-select"
                  value={selectedTTS.value}
                  onChange={(e) => setSelectedTTS(ttsOptions.find(option => option.value === e.target.value) || ttsOptions[0])}
              >
                {ttsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                ))}
              </select>

              {/* Voice selection dropdown */}
              {(targetLanguage === 'english' || targetLanguage === 'italian' || targetLanguage === 'german' || targetLanguage === 'french' || targetLanguage === 'spanish' || targetLanguage === 'portuguese' || targetLanguage === 'dutch' || targetLanguage === 'polish' || targetLanguage === 'russian' || targetLanguage === 'mandarin' || targetLanguage === 'japanese' || targetLanguage === 'korean') && (
                  <>
                    <label htmlFor="voice-select">Select Voice:</label>
                    <select
                        id="voice-select"
                        value={selectedVoice.value}
                        onChange={(e) => setSelectedVoice(
                            voiceOptions.find(voice => voice.value === e.target.value) || voiceOptions[0]
                        )}
                    >
                      {voiceOptions
                          .filter((voice) => voice.language === targetLanguage && voice.ttsService === selectedTTS.value)
                          .map((voice) => (
                              <option key={voice.value} value={voice.value}>
                                {voice.name}
                              </option>
                          ))}
                    </select>
                  </>
              )}

              <label htmlFor="word-input">Enter a word:</label>
              <input
                  id="word-input"
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={`Enter a ${targetLanguage} word`}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </form>

            {error && <div className="error" role="alert">{error}</div>}

            {definitions && sentences && (
                <div className="result-container">
                  <h3>Results for: {word}</h3>
                  <div className="result-section">
                    <h4>Definitions:</h4>
                    <ReactMarkdown>{definitions.text}</ReactMarkdown>
                  </div>
                  <div className="result-section">
                    <h4>Select 1 Sentence:</h4>
                    <ul className="sentence-list">
                      {getCurrentPageSentences().map((sentence, index) => (
                          <li
                              key={index}
                              onClick={() => handleSentenceClick(sentence)}
                              className={selectedSentence === sentence ? 'selected' : ''}
                          >
                            <ReactMarkdown>{sentence}</ReactMarkdown>
                            {/* TTS listen button */}
                            {(targetLanguage === 'english' || targetLanguage === 'italian' || targetLanguage === 'german' || targetLanguage === 'french' || targetLanguage === 'spanish' || targetLanguage === 'portuguese' || targetLanguage === 'dutch' || targetLanguage === 'polish' || targetLanguage === 'russian' || targetLanguage === 'mandarin' || targetLanguage === 'japanese' || targetLanguage === 'korean') && (
                                <button onClick={() => handleTTS(sentence)} className="listen-button">
                                  Listen
                                </button>
                            )}
                          </li>
                      ))}
                    </ul>

                    <div className="pagination">
                      <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span>Page {currentPage} of {sentences.totalPages}</span>
                      <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === sentences.totalPages}
                      >
                        Next
                      </button>
                    </div>

                    {selectedSentence && (
                        <div className="selected-sentence">
                          <h4>Selected Sentence:</h4>
                          <ReactMarkdown>{selectedSentence}</ReactMarkdown>
                          <button onClick={handleSaveItem}>Save Sentence</button>
                          <button onClick={() => handleTranslation(selectedSentence)}>Translate this sentence</button>
                          {translation && (
                              <div className="translation">
                                <h4>Translation:</h4>
                                <ReactMarkdown>{translation}</ReactMarkdown>
                                {translationTokenCount && (
                                    <div className="token-info">
                                      <h4>Token Information:</h4>
                                      <p>
                                        Input: {translationTokenCount.inputTokens}<br/>
                                        Output: {translationTokenCount.outputTokens}<br/>
                                        Total: {translationTokenCount.totalTokens}
                                      </p>
                                    </div>
                                )}
                              </div>
                          )}
                        </div>
                    )}
                  </div>

                  <div className="token-info">
                    <h4>Token Information:</h4>
                    <p>
                      Input: {totalTokenCount?.inputTokens}<br/>
                      Output: {totalTokenCount?.outputTokens}<br/>
                      Total: {totalTokenCount?.totalTokens}
                    </p>
                  </div>
                </div>
            )}
          </section>

          {/* Render the saved items section */}
          <section id="saved-items">
            <h2>Saved Items</h2>
            {savedItems.length > 0 ? (
                <>
                  <ul className="saved-items-list">
                    {savedItems.map((item, index) => (
                        <li key={index}>
                          <div className="saved-item-content">
                            <ReactMarkdown>{item.sentence}</ReactMarkdown>
                            <ReactMarkdown>{item.definition}</ReactMarkdown>
                            {item.translation && (
                                <div className="translation">
                                  <ReactMarkdown>{item.translation}</ReactMarkdown>
                                </div>
                            )}
                            {item.audioKey && audioData[item.audioKey] && (
                                <button onClick={() => playSavedAudio(item.audioKey!)}>
                                  Play Audio
                                </button>
                            )}
                          </div>
                          <button onClick={() => handleRemoveSavedItem(item)}>Remove</button>
                        </li>
                    ))}
                  </ul>
                  <div className="action-buttons">
                    <button onClick={handleExportClick} className="export-button">Export</button>
                    <button onClick={handleClearAll} className="clear-all-button">Clear All</button>
                  </div>
                </>
            ) : (
                <p>No saved items yet. Generate some words and save sentences to see them here!</p>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>📚📖🔖 Anki Assistant Languages</h3>
              <p>Enhance your language learning with AI-powered flashcards</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#card-generator">Card Generator</a></li>
                <li><a href="#saved-items">Saved Items</a></li>
                <li><a href={ankiNoteTypeFile} download>Download Anki Note Type</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Connect</h3>
              <ul>
                <li><a href="https://github.com/cantalupo555/anki-assistant-languages" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
                <li><a href="https://ankiweb.net/" target="_blank" rel="noopener noreferrer">Anki Website</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Anki Assistant Languages. This project is open source under the MIT License.</p>
          </div>
        </footer>

        {/* Scroll-to-top button */}
        {showScrollTop && (
            <button onClick={scrollToTop} className="scroll-to-top">
              ↑
            </button>
        )}

        {/* Render the notification messages */}
        <Notifications
            showSaveNotification={showSaveNotification}
            showExportNotification={showExportNotification}
            showRemoveNotification={showRemoveNotification}
            showClearAllNotification={showClearAllNotification}
            showGenerateNotification={showGenerateNotification}
        />
      </div>
  );
}
