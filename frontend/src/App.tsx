// Import necessary dependencies and utility functions
// React: Core library for building user interfaces
// useState, useEffect: React hooks for managing state and side effects
// ReactMarkdown: Component to render Markdown as React components
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './styles/App.css';
import LanguageSelector from './components/languageSelector';
import Modal from './components/Modal';
import Notifications from './components/Notifications';
import Login from './components/Login';
import { AppProvider, useAppContext } from './context/selectionContext';
import { handleExport } from './utils/languageCardExporter';
import { stripMarkdown } from './utils/markdownStripper';
import { TokenCount, SavedItem, TTSOption, APIServiceOption, FrequencyAnalysis, LLMOption } from './utils/Types';
import { voiceOptions } from './utils/voiceOptions';
import useAuth from './utils/useAuth';

// Path to the Anki note type file
const ankiNoteTypeFile = process.env.PUBLIC_URL + '/assets/AnkiAssistantLanguages.apkg';

// Define the backend API URLs, using environment variables
const ANALYZE_FREQUENCY_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/analyze/frequency';
const DEFINITIONS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/definitions';
const SENTENCES_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/sentences';
const DIALOGUE_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/dialogue';
const TRANSLATION_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/translate';
const TOKEN_SUM_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/token/sum';
const TTS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/tts';

// Array of available API service options
const apiServiceOptions: APIServiceOption[] = [
  { name: 'Select your AI Provider', value: '' },
  { name: 'OpenRouter', value: 'openrouter' },
  { name: 'Anthropic', value: 'anthropic' },
];

// Array of available LLM options for each API service
const llmOptions: { [key: string]: LLMOption[] } = {
  openrouter: [
    { name: 'Select AI', value: '' },
    { name: 'Llama-3.1 70B Instruct (Free)', value: 'meta-llama/llama-3.1-70b-instruct:free' },
    { name: 'Qwen-2.5 72B Instruct', value: 'qwen/qwen-2.5-72b-instruct' },
    { name: 'Claude-3 Haiku', value: 'anthropic/claude-3-haiku' },
    { name: 'Gemini-1.5 Flash', value: 'google/gemini-flash-1.5' },
  ],
  anthropic: [
    { name: 'Select AI', value: '' },
    { name: 'Claude-3 Haiku', value: 'claude-3-haiku-20240307' },
  ]
};

// Array of available TTS options
const ttsOptions: TTSOption[] = [
  { name: 'Select your TTS Service', value: '' },
  { name: 'Google TTS', value: 'google' },
  { name: 'Azure TTS', value: 'azure' },
];

const AppInner: React.FC = () => {
  // Use the useAuth hook
  const { isAuthenticated, isCheckingAuth, handleLogin, handleLogout } = useAuth();

  const { nativeLanguage, targetLanguage, selectedAPIService, setSelectedAPIService, selectedTTS, setSelectedTTS, selectedVoice, setSelectedVoice, selectedLLM, setSelectedLLM } = useAppContext();
  const [word, setWord] = useState('');
  const [definitions, setDefinitions] = useState<{ text: string; tokenCount: TokenCount } | null>(null);
  const [sentences, setSentences] = useState<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>(null);
  const [totalTokenCount, setTotalTokenCount] = useState<TokenCount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const [isTranslateLoading, setIsTranslateLoading] = useState(false); // State for translation loading
  const [isDialogueLoading, setIsDialogueLoading] = useState(false); // State for dialogue loading
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<FrequencyAnalysis | null>(null);
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false); // State to control the frequency analysis modal
  const [dialogue, setDialogue] = useState<{ text: string; tokenCount: TokenCount } | null>(null);
  const [isDialogueModalOpen, setIsDialogueModalOpen] = useState(false); // State to control the dialogue modal

  // Effect to load saved items and authentication state from localStorage on component mount
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

  // Effect to set the default voice option based on the selected language
  useEffect(() => {
    const defaultVoice = voiceOptions.find(voice => voice.language === targetLanguage) || voiceOptions[0];
    setSelectedVoice(defaultVoice);
  }, [targetLanguage, setSelectedVoice]);

  // Effect to fetch Azure voices when Azure TTS is selected
  useEffect(() => {
    const defaultVoice = voiceOptions.find(
        voice => voice.language === targetLanguage && voice.ttsService === selectedTTS.value
    ) || voiceOptions[0];
    setSelectedVoice(defaultVoice);
  }, [targetLanguage, selectedTTS, setSelectedVoice]);

  // Effect to set the default LLM option based on the selected API service
  useEffect(() => {
    const defaultLLM = llmOptions[selectedAPIService.value]?.[0] || { name: 'Select AI', value: '' };
    setSelectedLLM(defaultLLM);
  }, [selectedAPIService, setSelectedLLM]);

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
    if (!nativeLanguage || !targetLanguage || !selectedAPIService || !selectedTTS || !word || !selectedLLM) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setIsGenerateLoading(true);
    setCurrentPage(1);

    try {
      // Log request details for debugging
      console.log('Submitting form...');
      console.log('Request payload for definitions:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

      // Fetch definitions
      const definitionsResponse = await fetch(DEFINITIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
      });

      // Log response status for debugging
      console.log('Response status for definitions:', definitionsResponse.status);

      // Check if response is successful
      if (!definitionsResponse.ok) {
        const errorText = await definitionsResponse.text();
        console.error('Error response for definitions:', errorText);
        throw new Error(`HTTP error! status: ${definitionsResponse.status}, message: ${errorText}`);
      }

      const definitionsData = await definitionsResponse.json();
      setDefinitions(definitionsData.definitions);
      console.log('Received definitions data:', definitionsData);

      // Log request details for debugging
      console.log('Request payload for sentences:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

      // Fetch sentences
      const sentencesResponse = await fetch(SENTENCES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
      });

      // Log response status for debugging
      console.log('Response status for sentences:', sentencesResponse.status);

      // Check if response is successful
      if (!sentencesResponse.ok) {
        const errorText = await sentencesResponse.text();
        console.error('Error response for sentences:', errorText);
        throw new Error(`HTTP error! status: ${sentencesResponse.status}, message: ${errorText}`);
      }

      const sentencesData = await sentencesResponse.json();
      setSentences(sentencesData.sentences);
      console.log('Received sentences data:', sentencesData);

      // Log request details for debugging
      console.log('Request payload for total token count:', {
        definitionsTokens: definitionsData.definitions.tokenCount,
        sentencesTokens: sentencesData.sentences.tokenCount,
        translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      });

      // Calculate total token count
      const totalTokenCountResponse = await fetch(TOKEN_SUM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definitionsTokens: definitionsData.definitions.tokenCount,
          sentencesTokens: sentencesData.sentences.tokenCount,
          translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        }),
      });

      // Log response status for debugging
      console.log('Response status for total token count:', totalTokenCountResponse.status);

      // Check if response is successful
      if (!totalTokenCountResponse.ok) {
        const errorText = await totalTokenCountResponse.text();
        console.error('Error response for total token count:', errorText);
        throw new Error(`HTTP error! status: ${totalTokenCountResponse.status}, message: ${errorText}`);
      }

      const totalTokenCountData = await totalTokenCountResponse.json();
      setTotalTokenCount(totalTokenCountData);
      console.log('Received total token count data:', totalTokenCountData);

      setShowGenerateNotification(true);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      if (error instanceof Error) {
        setError(`An error occurred while fetching data: ${error.message}`);
      } else {
        setError('An unknown error occurred while fetching data.');
      }
    } finally {
      setIsGenerateLoading(false);
    }
  };

  // Function to handle generating dialogue
  const handleGenerateDialogue = async () => {
    if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null); // Clear any previous errors
    setIsDialogueLoading(true); // Set loading state

    try {
      // Log request details for debugging
      console.log('Sending dialogue generation request...');
      console.log('Request payload:', { word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

      // Send POST request to the dialogue generation endpoint
      const dialogueResponse = await fetch(DIALOGUE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
      });

      // Log response status for debugging
      console.log('Response status for dialogue:', dialogueResponse.status);

      // Check if response is successful
      if (!dialogueResponse.ok) {
        const errorText = await dialogueResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${dialogueResponse.status}, message: ${errorText}`);
      }

      // Parse response JSON
      const dialogueData = await dialogueResponse.json();
      console.log('Received dialogue data:', dialogueData);

      // Validate response data structure
      if (
          dialogueData.dialogue && typeof dialogueData.dialogue === 'string' &&
          dialogueData.tokenCount && typeof dialogueData.tokenCount === 'object' &&
          'inputTokens' in dialogueData.tokenCount &&
          'outputTokens' in dialogueData.tokenCount &&
          'totalTokens' in dialogueData.tokenCount
      ) {
        // Create and set dialogue object
        const dialogue: FrequencyAnalysis = {
          text: dialogueData.dialogue,
          tokenCount: dialogueData.tokenCount
        };
        setDialogue(dialogue);
        updateTotalTokenCount(dialogueData.tokenCount);
        console.log('Set dialogue:', dialogue);
        setIsDialogueModalOpen(true); // Open dialogue modal
      } else {
        console.error('Invalid dialogue data structure:', dialogueData);
        throw new Error('Received invalid dialogue data from the server.');
      }
    } catch (error: unknown) {
      console.error('Error in handleGenerateDialogue:', error);
      if (error instanceof Error) {
        setError(`An error occurred while fetching dialogue: ${error.message}`);
      } else {
        setError('An unknown error occurred while fetching dialogue.');
      }
    } finally {
      setIsDialogueLoading(false); // Reset loading state
    }
  };

  // Function to handle word frequency analysis
  const handleAnalyzeFrequency = async () => {
    // Validate required fields
    if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null); // Clear any previous errors
    setIsAnalyzeLoading(true); // Set loading state

    try {
      // Log request details for debugging
      console.log('Sending frequency analysis request...');
      console.log('Request payload:', { word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

      // Send POST request to the frequency analysis endpoint
      const analysisResponse = await fetch(ANALYZE_FREQUENCY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
      });

      // Log response status for debugging
      console.log('Response status for analysis:', analysisResponse.status);

      // Check if response is successful
      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${analysisResponse.status}, message: ${errorText}`);
      }

      // Parse response JSON
      const analysisData = await analysisResponse.json();
      console.log('Received analysis data:', analysisData);

      // Validate response data structure
      if (
          analysisData.analysis && typeof analysisData.analysis === 'string' &&
          analysisData.tokenCount && typeof analysisData.tokenCount === 'object' &&
          'inputTokens' in analysisData.tokenCount &&
          'outputTokens' in analysisData.tokenCount &&
          'totalTokens' in analysisData.tokenCount
      ) {
        // Create and set frequency analysis object
        const analysis: FrequencyAnalysis = {
          text: analysisData.analysis,
          tokenCount: analysisData.tokenCount
        };
        setFrequencyAnalysis(analysis);
        updateTotalTokenCount(analysisData.tokenCount);
        console.log('Set frequency analysis:', analysis);
        setIsFrequencyModalOpen(true); // Open frequency analysis modal
      } else {
        console.error('Invalid analysis data structure:', analysisData);
        throw new Error('Received invalid analysis data from the server.');
      }
    } catch (error: unknown) {
      console.error('Error in handleAnalyzeFrequency:', error);
      if (error instanceof Error) {
        setError(`An error occurred while fetching frequency analysis: ${error.message}`);
      } else {
        setError('An unknown error occurred while fetching frequency analysis.');
      }
    } finally {
      setIsAnalyzeLoading(false); // Reset loading state
    }
  };

  // Function to handle the translation of a given sentence
  const handleTranslation = async (sentence: string) => {
    if (isTranslateLoading) return; // Prevent multiple clicks while translating

    try {
      setIsTranslateLoading(true); // Set loading state

      // Log request details for debugging
      console.log('Sending translation request...');
      console.log('Request payload:', {
        text: sentence,
        nativeLanguage: nativeLanguage,
        targetLanguage: targetLanguage,
        apiService: selectedAPIService.value,
        llm: selectedLLM.value
      });

      // Send POST request to the translation API endpoint
      const response = await fetch(TRANSLATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sentence,
          nativeLanguage: nativeLanguage,
          targetLanguage: targetLanguage,
          apiService: selectedAPIService.value,
          llm: selectedLLM.value
        }),
      });

      // Log response status for debugging
      console.log('Response status for translation:', response.status);

      // Check if response is successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Parse response JSON
      const data = await response.json();
      console.log('Received translation data:', data);

      // Set the state for the translation
      setTranslation(data.translation);

      // Update the total token count to be cumulative
      updateTotalTokenCount(data.tokenCount);

      return data.translation; // Return the translation
    } catch (error) {
      console.error('Error in handleTranslation:', error);
      if (error instanceof Error) {
        setError(`An error occurred while translating the sentence: ${error.message}`);
      } else {
        setError('An unknown error occurred while translating the sentence. Please try again.');
      }
      return ''; // Return an empty string or some default value in case of error
    } finally {
      setIsTranslateLoading(false); // Reset loading state
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

  // Function to update the total token count to be cumulative
  const updateTotalTokenCount = (tokenCount: TokenCount) => {
    const currentTotalTokenCount = totalTokenCount || { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    const newTotalTokenCount = {
      inputTokens: currentTotalTokenCount.inputTokens + tokenCount.inputTokens,
      outputTokens: currentTotalTokenCount.outputTokens + tokenCount.outputTokens,
      totalTokens: currentTotalTokenCount.totalTokens + tokenCount.totalTokens
    };

    setTotalTokenCount(newTotalTokenCount);
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

  // Function to handle voice change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = voiceOptions.find(voice => voice.value === e.target.value) || voiceOptions[0];
    setSelectedVoice(newVoice);
    localStorage.setItem('selectedVoice', JSON.stringify(newVoice));
  };

  // Function to handle LLM change
  const handleLLMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLLM = llmOptions[selectedAPIService.value]?.find(llm => llm.value === e.target.value) || llmOptions[selectedAPIService.value][0];
    setSelectedLLM(newLLM);
    localStorage.setItem('selectedLLM', JSON.stringify(newLLM));
  };

  // Render the main application components
  if (isCheckingAuth) {
    return <div className="loading-screen"><p>Loading...</p></div>;
  }

  return (
      <div className="app-container">
        {isAuthenticated ? (
            <>
              <header className="app-header">
                <h1>📚📖🔖 Anki Assistant Languages</h1>
                <nav>
                  <ul>
                    <li><a href="#card-generator">Card Generator</a></li>
                    <li><a href="#saved-items">Saved Items</a></li>
                  </ul>
                </nav>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </header>

              <main>
                {/* Render the card generator section */}
                <section id="card-generator">
                  <h2>Card Generator</h2>
                  <form onSubmit={handleSubmit}>
                    {/* API service selection dropdown */}
                    <label htmlFor="api-service-select">AI Provider:</label>
                    <select
                        id="api-service-select"
                        value={selectedAPIService.value}
                        onChange={(e) => setSelectedAPIService(apiServiceOptions.find(option => option.value === e.target.value) || apiServiceOptions[0])}
                        required
                    >
                      {apiServiceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.name}
                          </option>
                      ))}
                    </select>

                    {/* LLM selection dropdown */}
                    <label htmlFor="llm-select">AI Model:</label>
                    <select
                        id="llm-select"
                        value={selectedLLM.value}
                        onChange={handleLLMChange}
                        required
                    >
                      {llmOptions[selectedAPIService.value]?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.name}
                          </option>
                      ))}
                    </select>

                    {/* Render the LanguageSelector component */}
                    <LanguageSelector />

                    {/* TTS service selection dropdown */}
                    <label htmlFor="tts-select">TTS Service:</label>
                    <select
                        id="tts-select"
                        value={selectedTTS.value}
                        onChange={(e) => setSelectedTTS(ttsOptions.find(option => option.value === e.target.value) || ttsOptions[0])}
                        required
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
                              onChange={handleVoiceChange}
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

                    <label htmlFor="word-input">Enter a word or expression:</label>
                    <input
                        id="word-input"
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder={`Enter a ${targetLanguage} word`}
                        required
                    />
                    <div className="button-container">
                      <button type="submit" className="generate-button" disabled={isGenerateLoading}>
                        {isGenerateLoading ? 'Generating...' : 'Generate'}
                      </button>
                      <button type="button" className="dialogue-button" onClick={handleGenerateDialogue}
                              disabled={isDialogueLoading}>
                        {isDialogueLoading ? 'Generating...' : 'Generate Dialogue'}
                      </button>
                      <button type="button" className="analyze-button" onClick={handleAnalyzeFrequency}
                              disabled={isAnalyzeLoading}>
                        {isAnalyzeLoading ? 'Analyzing...' : 'Analyze Frequency'}
                      </button>
                    </div>
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
                                <button
                                    className={`translate-button ${isTranslateLoading ? 'loading' : ''}`}
                                    disabled={isTranslateLoading}
                                    onClick={() => handleTranslation(selectedSentence)}
                                >
                                  {isTranslateLoading ? 'Translating...' : 'Translate this sentence'}
                                </button>
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
                          <h4>Total Tokens:</h4>
                          <p>
                            Input: {totalTokenCount?.inputTokens}<br />
                            Output: {totalTokenCount?.outputTokens}<br />
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
                  <p>© 2024 Anki Assistant Languages. This project is open source under the MIT License.</p>
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

              {/* Render the modal for generated dialogue */}
              <Modal
                  isOpen={isDialogueModalOpen}
                  onClose={() => setIsDialogueModalOpen(false)}
                  title="Generated Dialogue"
              >
                {dialogue ? (
                    <div className="dialogue">
                      <ReactMarkdown>{dialogue.text}</ReactMarkdown>
                    </div>
                ) : (
                    <p>No dialogue data available.</p>
                )}
              </Modal>

              {/* Render the modal for frequency analysis */}
              <Modal
                  isOpen={isFrequencyModalOpen}
                  onClose={() => setIsFrequencyModalOpen(false)}
                  title="Frequency Analysis"
              >
                {frequencyAnalysis ? (
                    <div className="frequency-analysis">
                      <ReactMarkdown>{frequencyAnalysis.text}</ReactMarkdown>
                    </div>
                ) : (
                    <p>No analysis data available.</p>
                )}
              </Modal>
            </>
        ) : (
            <Login onLogin={handleLogin} />
        )}
      </div>
  );
};

// Main App component
const App: React.FC = () => {
  // Wrap the AppInner component with the AppProvider to provide the context
  return (
      <AppProvider>
        <AppInner />
      </AppProvider>
  );
};

// Export the main App component
export default App;
