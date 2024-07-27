// Import necessary dependencies and utility functions
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import { handleExport } from './languageCardExporter';
import { stripMarkdown } from './markdownStripper';

// Define the backend API URLs, using environment variables
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate';
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

// Interface for voice options
interface VoiceOption {
  name: string;
  value: string;
  language: string;
  languageCode: string;
}

// Array of available voice options for TTS
const voiceOptions: VoiceOption[] = [
  // Add English voice options
  { name: 'en-US-Journey-D', value: 'en-US-Journey-D', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Journey-F', value: 'en-US-Journey-F', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Journey-O', value: 'en-US-Journey-O', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-A', value: 'en-US-Wavenet-A', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-B', value: 'en-US-Wavenet-B', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-C', value: 'en-US-Wavenet-C', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-D', value: 'en-US-Wavenet-D', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-E', value: 'en-US-Wavenet-E', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-F', value: 'en-US-Wavenet-F', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-G', value: 'en-US-Wavenet-G', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-H', value: 'en-US-Wavenet-H', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-I', value: 'en-US-Wavenet-I', language: 'english', languageCode: 'en-US' },
  { name: 'en-US-Wavenet-J', value: 'en-US-Wavenet-J', language: 'english', languageCode: 'en-US' },
  // Add Italian voice options
  { name: 'it-IT-Wavenet-A', value: 'it-IT-Wavenet-A', language: 'italian', languageCode: 'it-IT' },
  { name: 'it-IT-Wavenet-B', value: 'it-IT-Wavenet-B', language: 'italian', languageCode: 'it-IT' },
  { name: 'it-IT-Wavenet-C', value: 'it-IT-Wavenet-C', language: 'italian', languageCode: 'it-IT' },
  { name: 'it-IT-Wavenet-D', value: 'it-IT-Wavenet-D', language: 'italian', languageCode: 'it-IT' },
  // Add German voice options
  { name: 'de-DE-Wavenet-A', value: 'de-DE-Wavenet-A', language: 'german', languageCode: 'de-DE' },
  { name: 'de-DE-Wavenet-B', value: 'de-DE-Wavenet-B', language: 'german', languageCode: 'de-DE' },
  { name: 'de-DE-Wavenet-C', value: 'de-DE-Wavenet-C', language: 'german', languageCode: 'de-DE' },
  { name: 'de-DE-Wavenet-D', value: 'de-DE-Wavenet-D', language: 'german', languageCode: 'de-DE' },
  { name: 'de-DE-Wavenet-E', value: 'de-DE-Wavenet-E', language: 'german', languageCode: 'de-DE' },
  { name: 'de-DE-Wavenet-F', value: 'de-DE-Wavenet-F', language: 'german', languageCode: 'de-DE' },
  // Add French voice options
  { name: 'fr-FR-Wavenet-A', value: 'fr-FR-Wavenet-A', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-B', value: 'fr-FR-Wavenet-B', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-C', value: 'fr-FR-Wavenet-C', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-D', value: 'fr-FR-Wavenet-D', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-E', value: 'fr-FR-Wavenet-E', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-F', value: 'fr-FR-Wavenet-F', language: 'french', languageCode: 'fr-FR' },
  { name: 'fr-FR-Wavenet-G', value: 'fr-FR-Wavenet-G', language: 'french', languageCode: 'fr-FR' },
  // Add Spanish voice options
  { name: 'es-ES-Wavenet-B', value: 'es-ES-Wavenet-B', language: 'spanish', languageCode: 'es-ES' },
  { name: 'es-ES-Wavenet-C', value: 'es-ES-Wavenet-C', language: 'spanish', languageCode: 'es-ES' },
  { name: 'es-ES-Wavenet-D', value: 'es-ES-Wavenet-D', language: 'spanish', languageCode: 'es-ES' },
  // Add Portuguese voice options
  { name: 'pt-BR-Wavenet-A', value: 'pt-BR-Wavenet-A', language: 'portuguese', languageCode: 'pt-BR' },
  { name: 'pt-BR-Wavenet-B', value: 'pt-BR-Wavenet-B', language: 'portuguese', languageCode: 'pt-BR' },
  { name: 'pt-BR-Wavenet-C', value: 'pt-BR-Wavenet-C', language: 'portuguese', languageCode: 'pt-BR' },
  { name: 'pt-BR-Wavenet-D', value: 'pt-BR-Wavenet-D', language: 'portuguese', languageCode: 'pt-BR' },
  { name: 'pt-BR-Wavenet-E', value: 'pt-BR-Wavenet-E', language: 'portuguese', languageCode: 'pt-BR' },
  // Add Dutch voice options
  { name: 'nl-NL-Wavenet-A', value: 'nl-NL-Wavenet-A', language: 'dutch', languageCode: 'nl-NL' },
  { name: 'nl-NL-Wavenet-B', value: 'nl-NL-Wavenet-B', language: 'dutch', languageCode: 'nl-NL' },
  { name: 'nl-NL-Wavenet-C', value: 'nl-NL-Wavenet-C', language: 'dutch', languageCode: 'nl-NL' },
  { name: 'nl-NL-Wavenet-D', value: 'nl-NL-Wavenet-D', language: 'dutch', languageCode: 'nl-NL' },
  { name: 'nl-NL-Wavenet-E', value: 'nl-NL-Wavenet-E', language: 'dutch', languageCode: 'nl-NL' },
  // Add Polish voice options
  { name: 'pl-PL-Wavenet-A', value: 'pl-PL-Wavenet-A', language: 'polish', languageCode: 'pl-PL' },
  { name: 'pl-PL-Wavenet-B', value: 'pl-PL-Wavenet-B', language: 'polish', languageCode: 'pl-PL' },
  { name: 'pl-PL-Wavenet-C', value: 'pl-PL-Wavenet-C', language: 'polish', languageCode: 'pl-PL' },
  { name: 'pl-PL-Wavenet-D', value: 'pl-PL-Wavenet-D', language: 'polish', languageCode: 'pl-PL' },
  { name: 'pl-PL-Wavenet-E', value: 'pl-PL-Wavenet-E', language: 'polish', languageCode: 'pl-PL' },
  // Add Russian voice options
  { name: 'ru-RU-Wavenet-A', value: 'ru-RU-Wavenet-A', language: 'russian', languageCode: 'ru-RU' },
  { name: 'ru-RU-Wavenet-B', value: 'ru-RU-Wavenet-B', language: 'russian', languageCode: 'ru-RU' },
  { name: 'ru-RU-Wavenet-C', value: 'ru-RU-Wavenet-C', language: 'russian', languageCode: 'ru-RU' },
  { name: 'ru-RU-Wavenet-D', value: 'ru-RU-Wavenet-D', language: 'russian', languageCode: 'ru-RU' },
  { name: 'ru-RU-Wavenet-E', value: 'ru-RU-Wavenet-E', language: 'russian', languageCode: 'ru-RU' },
  // Add Mandarin voice options
  { name: 'cmn-CN-Wavenet-A', value: 'cmn-CN-Wavenet-A', language: 'mandarin', languageCode: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-B', value: 'cmn-CN-Wavenet-B', language: 'mandarin', languageCode: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-C', value: 'cmn-CN-Wavenet-C', language: 'mandarin', languageCode: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-D', value: 'cmn-CN-Wavenet-D', language: 'mandarin', languageCode: 'cmn-CN' },
  // Add Japanese voice options
  { name: 'ja-JP-Wavenet-A', value: 'ja-JP-Wavenet-A', language: 'japanese', languageCode: 'ja-JP' },
  { name: 'ja-JP-Wavenet-B', value: 'ja-JP-Wavenet-B', language: 'japanese', languageCode: 'ja-JP' },
  { name: 'ja-JP-Wavenet-C', value: 'ja-JP-Wavenet-C', language: 'japanese', languageCode: 'ja-JP' },
  { name: 'ja-JP-Wavenet-D', value: 'ja-JP-Wavenet-D', language: 'japanese', languageCode: 'ja-JP' },
  // Add Korean voice options
  { name: 'ko-KR-Wavenet-A', value: 'ko-KR-Wavenet-A', language: 'korean', languageCode: 'ko-KR' },
  { name: 'ko-KR-Wavenet-B', value: 'ko-KR-Wavenet-B', language: 'korean', languageCode: 'ko-KR' },
  { name: 'ko-KR-Wavenet-C', value: 'ko-KR-Wavenet-C', language: 'korean', languageCode: 'ko-KR' },
  { name: 'ko-KR-Wavenet-D', value: 'ko-KR-Wavenet-D', language: 'korean', languageCode: 'ko-KR' },
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
  const [result, setResult] = useState<Result | null>(null);
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
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voiceOptions[0]);
  const [audioData, setAudioData] = useState<{ [key: string]: string }>({});
  const [translation, setTranslation] = useState<string | null>(null);

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
      // Send the request to the API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: targetLanguage }),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the data from the API response
      const data = await response.json();
      setResult(data);
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
    if (!result) return [];
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    return result.sentences.text.slice(startIndex, endIndex);
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
      return data.translation; // Return the translation
    } catch (error) {
      console.error('Error translating sentence:', error);
      setError('An error occurred while translating the sentence. Please try again.');
      return ''; // Return an empty string or some default value in case of error
    }
  };

  // Function to save the selected phrase with its definition, TTS and translation
  const handleSaveItem = async () => {
    if (selectedSentence && result) {
      try {
        // Always generate new TTS for the selected sentence
        const audioBlob = await generateTTS(selectedSentence);
        const translation = await handleTranslation(selectedSentence);

        const audioKey = `audio_${Date.now()}`; // Generate a unique key for the audio
        const newItem: SavedItem = {
          sentence: selectedSentence,
          definition: result.definitions.text,
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
        languageCode: selectedVoice.languageCode
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
              <label htmlFor="native-language-select">Your native language:</label>
              <select
                  id="native-language-select"
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  required
              >
                <option value="">Select your native language</option>
                <option value="english">English (US)</option>
                <option value="italian">Italiano (IT)</option>
                <option value="german">Deutsch (DE)</option>
                <option value="french">Français (FR)</option>
                <option value="spanish">Español (ES)</option>
                <option value="portuguese">Português (BR)</option>
                <option value="dutch">Nederlands (NL)</option>
                <option value="polish">Polski (PL)</option>
                <option value="russian">Pусский (RU)</option>
                <option value="mandarin">普通话（CN)</option>
                <option value="japanese">日本語（JP)</option>
                <option value="korean">한국어（KR)</option>
              </select>

              <label htmlFor="target-language-select">You are learning:</label>
              <select
                  id="target-language-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  required
              >
                <option value="">Select target language</option>
                <option value="english">English (US)</option>
                <option value="italian">Italiano (IT)</option>
                <option value="german">Deutsch (DE)</option>
                <option value="french">Français (FR)</option>
                <option value="spanish">Español (ES)</option>
                <option value="portuguese">Português (BR)</option>
                <option value="dutch">Nederlands (NL)</option>
                <option value="polish">Polski (PL)</option>
                <option value="russian">Pусский (RU)</option>
                <option value="mandarin">普通话（CN)</option>
                <option value="japanese">日本語（JP)</option>
                <option value="korean">한국어（KR)</option>
              </select>

              {/* Voice selection dropdown */}
              {(targetLanguage === 'english' || targetLanguage === 'italian' || targetLanguage === 'german' || targetLanguage === 'french' || targetLanguage === 'spanish' || targetLanguage === 'portuguese' || targetLanguage === 'dutch' || targetLanguage === 'polish' || targetLanguage === 'russian' || targetLanguage === 'mandarin' || targetLanguage === 'japanese' || targetLanguage === 'korean') && (
                  <>
                    <label htmlFor="voice-select">Select Voice:</label>
                    <select
                        id="voice-select"
                        value={selectedVoice.value}
                        onChange={(e) => setSelectedVoice(voiceOptions.find(voice => voice.value === e.target.value) || voiceOptions[0])}
                    >
                      {voiceOptions
                          .filter((voice) => voice.language === targetLanguage)
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

            {result && (
                <div className="result-container">
                  <h3>Results for: {result.word}</h3>
                  <div className="result-section">
                    <h4>Definitions:</h4>
                    <ReactMarkdown>{result.definitions.text}</ReactMarkdown>
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
                      <span>Page {currentPage} of {result.sentences.totalPages}</span>
                      <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === result.sentences.totalPages}
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
                              </div>
                          )}
                        </div>
                    )}
                  </div>

                  <div className="token-info">
                    <h4>Token Information:</h4>
                    <p>
                      Input: {result.totalTokenCount.inputTokens}<br/>
                      Output: {result.totalTokenCount.outputTokens}<br/>
                      Total: {result.totalTokenCount.totalTokens}
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
        <footer>
          <p>
            📚📖🔖 Anki Assistant Languages |{' '}
            <a href="https://github.com/cantalupo555/anki-assistant-languages" target="_blank"
               rel="noopener noreferrer">
              GitHub Repository
            </a>
          </p>
        </footer>

        {/* Render the notification messages */}
        {showSaveNotification && (
            <div className="notification save-notification">
              Sentence and definition saved successfully!
            </div>
        )}

        {showExportNotification && (
            <div className="notification export-notification">
              Items exported successfully!
            </div>
        )}

        {showRemoveNotification && (
            <div className="notification remove-notification">
              Item removed successfully!
            </div>
        )}

        {showClearAllNotification && (
            <div className="notification clear-all-notification">
              All items cleared successfully!
            </div>
        )}

        {showGenerateNotification && (
            <div className="notification generate-notification">
              Word generated successfully!
            </div>
        )}
      </div>
  );
}
