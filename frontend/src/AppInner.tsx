// Import necessary dependencies and utility functions
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Context imports
import { useAppContext } from './context/selectionContext';
import { supportedLanguageCodes } from './shared/constants';

// Internal component imports
import DialogueModal from './components/DialogueModal';
import Footer from './components/Footer';
import FrequencyAnalysisModal from './components/FrequencyAnalysisModal';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import Notifications from './components/Notifications';
import Stats from './components/Stats';

// Style imports
import * as S from './styles/AppStyles';
import {
    AnalyzeButton,
    Button,
    DialogueButton,
    GenerateButton,
    ListenButton,
    PaginationButton,
    SaveButton,
    TranslateButton as StyledTranslateButton
} from './styles/ButtonStyles';

// Utility function imports
// Options are now fetched from the API, removed imports: apiServiceOptions, llmOptions, ttsOptions
import { getFullLanguageName } from './utils/languageMapping';
import { handleAnalyzeFrequency } from './utils/handleAnalyzeFrequency';
import { handleExport } from './utils/languageCardExporter';
import { handleGenerateDialogue } from './utils/handleGenerateDialogue';
import { handleGenerateTTS } from './utils/handleGenerateTTS';
import { handleTranslation } from './utils/handleTranslation';
import { handleSubmit } from './utils/handleSubmit';
// Options are now fetched from the API, removed import: voiceOptions
import { APIServiceOption, FrequencyAnalysis, LLMOption, SavedItem, TokenCount, TTSOption, VoiceOption } from './utils/Types'; // Added Option types
import useAuth from './utils/useAuth'; // Import useAuth

interface AppInnerProps {
    showStats?: boolean;
}

// Main component that renders the application's inner layout and functionality
const AppInner: React.FC<AppInnerProps> = ({ showStats = false }) => {
    const {
        nativeLanguage,
        selectedAPIService,
        selectedLLM,
        selectedTTS,
        selectedVoice,
        setSelectedAPIService,
        setSelectedLLM,
        setSelectedTTS,
        setSelectedVoice,
        targetLanguage,
        // Consume options lists and status from context
        apiServiceOptionsList,
        llmOptionsList,
        ttsOptionsList,
        voiceOptionsList,
        optionsLoading,
        optionsError,
        // Consume setters for options lists and status
        setApiServiceOptionsList,
        setLlmOptionsList,
        setTtsOptionsList,
        setVoiceOptionsList,
        setOptionsLoading,
        setOptionsError,
    } = useAppContext();
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
    const [dialogue, setDialogue] = useState<{ text: string; tokenCount: TokenCount } | null>(null);
    const [isDialogueModalOpen, setIsDialogueModalOpen] = useState(false);
    const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
    const { callApiWithAuth } = useAuth();

    // REMOVED: Local state for fetched options - now using context state


    // --- Fetch Options from API (updates context state) ---
    useEffect(() => {
        // Only fetch if options are currently marked as loading in context
        if (!optionsLoading) return;

        const fetchOptions = async () => {
            // Ensure loading state is true before starting
            setOptionsLoading(true);
            setOptionsError(null);
            try {
                // Fetch all options concurrently
                const [apiServicesRes, llmOptionsRes, ttsServicesRes, voiceOptionsRes] = await Promise.all([
                    fetch('/options/api-services'),
                    fetch('/options/llms'),
                    fetch('/options/tts-services'),
                    fetch('/options/voices')
                ]);

                // Check responses
                if (!apiServicesRes.ok) throw new Error(`Failed to fetch API services: ${apiServicesRes.statusText}`);
                if (!llmOptionsRes.ok) throw new Error(`Failed to fetch LLM options: ${llmOptionsRes.statusText}`);
                if (!ttsServicesRes.ok) throw new Error(`Failed to fetch TTS services: ${ttsServicesRes.statusText}`);
                if (!voiceOptionsRes.ok) throw new Error(`Failed to fetch voice options: ${voiceOptionsRes.statusText}`);

                // Parse JSON data
                const apiServicesData: APIServiceOption[] = await apiServicesRes.json();
                const llmOptionsData: { [key: string]: LLMOption[] } = await llmOptionsRes.json();
                const ttsServicesData: TTSOption[] = await ttsServicesRes.json();
                const voiceOptionsData: VoiceOption[] = await voiceOptionsRes.json();

                // Update CONTEXT state
                setApiServiceOptionsList(apiServicesData);
                setLlmOptionsList(llmOptionsData);
                setTtsOptionsList(ttsServicesData);
                setVoiceOptionsList(voiceOptionsData);

                // --- Set Default Selections AFTER options are loaded (using context lists) ---

                // Set default API service if current selection is invalid or placeholder
                if (!selectedAPIService.value || !apiServicesData.some(opt => opt.value === selectedAPIService.value)) {
                    setSelectedAPIService(apiServicesData[0] || { name: 'No Service', value: '' });
                }

                // Set default TTS service if current selection is invalid or placeholder
                if (!selectedTTS.value || !ttsServicesData.some(opt => opt.value === selectedTTS.value)) {
                    setSelectedTTS(ttsServicesData[0] || { name: 'No TTS', value: '' });
                }

                // Set default LLM based on the (potentially updated) API service
                // Need to access the potentially updated selectedAPIService value directly
                const currentApiServiceValue = apiServicesData.some(opt => opt.value === selectedAPIService.value)
                    ? selectedAPIService.value
                    : (apiServicesData[0]?.value || '');

                const availableLLMs = llmOptionsData[currentApiServiceValue] || [];
                if (!selectedLLM.value || !availableLLMs.some(opt => opt.value === selectedLLM.value)) {
                    setSelectedLLM(availableLLMs[0] || { name: 'No Model', value: '' });
                }

                // Set default Voice based on target language and (potentially updated) TTS service
                 // Need to access the potentially updated selectedTTS value directly
                const currentTtsServiceValue = ttsServicesData.some(opt => opt.value === selectedTTS.value)
                    ? selectedTTS.value
                    : (ttsServicesData[0]?.value || '');

                const availableVoices = voiceOptionsData.filter(
                    voice => voice.language === getFullLanguageName(targetLanguage) && voice.ttsService === currentTtsServiceValue
                );
                if (!selectedVoice.value || !availableVoices.some(opt => opt.value === selectedVoice.value)) {
                     // Find default for the current language/TTS combo, or fallback to the very first voice overall
                    const defaultVoiceForLangTTS = availableVoices[0];
                    const overallDefaultVoice = voiceOptionsData[0] || { name: 'No Voice', value: '', language: '', languageCode: '', ttsService: 'google' };
                    setSelectedVoice(defaultVoiceForLangTTS || overallDefaultVoice);
                }
                 // --- End of Default Selections ---

            } catch (error) {
                console.error("Error fetching options:", error);
                setOptionsError(error instanceof Error ? error.message : "An unknown error occurred while fetching options.");
            } finally {
                setOptionsLoading(false); // Update context loading state
            }
        };

        fetchOptions();
    // Only re-run if context loading state changes back to true (e.g., for a refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsLoading]);


    // --- Load saved items from localStorage ---
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

    // --- Effects to update default selections when dependencies change AFTER initial load ---

    // Update default LLM when API Service changes (and options are loaded)
     useEffect(() => {
        if (optionsLoading) return; // Don't run while options are loading

        const availableLLMs = llmOptionsList[selectedAPIService.value] || [];
        // Check if the currently selected LLM is valid for the NEW service
        const currentLLMIsValid = availableLLMs.some(llm => llm.value === selectedLLM.value);

        // If the current LLM is NOT valid for the new service, pick the first available one
        if (!currentLLMIsValid && availableLLMs.length > 0) {
            setSelectedLLM(availableLLMs[0]);
        } else if (!currentLLMIsValid && availableLLMs.length === 0) {
            // Handle case where the new service has NO models
            setSelectedLLM({ name: 'No Model Available', value: '' });
        }
        // If current LLM *is* valid for the new service, no change needed here.
     }, [selectedAPIService, llmOptionsList, setSelectedLLM, optionsLoading, selectedLLM.value]); // Depend on context list and loading state

    // Update default Voice when Target Language or TTS Service changes (and options are loaded)
    useEffect(() => {
        if (optionsLoading) return; // Don't run while options are loading

        const targetLangName = getFullLanguageName(targetLanguage);
        // Filter voices from the context list
        const availableVoices = voiceOptionsList.filter(
            voice => voice.language === targetLangName && voice.ttsService === selectedTTS.value
        );
        // Check if the currently selected voice is valid for the NEW language/TTS combo
        const currentVoiceIsValid = availableVoices.some(voice => voice.value === selectedVoice.value);

        // If the current voice is NOT valid, pick the first available one for the combo
        if (!currentVoiceIsValid && availableVoices.length > 0) {
            setSelectedVoice(availableVoices[0]);
        } else if (!currentVoiceIsValid && availableVoices.length === 0) { // Handle case where combo has NO voices
             // Fallback: find first voice for the language regardless of TTS, or first overall voice
            const firstVoiceForLang = voiceOptionsList.find(v => v.language === targetLangName);
            const overallDefault = voiceOptionsList[0] || { name: 'No Voice Available', value: '', language: '', languageCode: '', ttsService: 'google' }; // Use placeholder if list is empty
            setSelectedVoice(firstVoiceForLang || overallDefault);
        }
        // If current voice *is* valid for the new combo, no change needed here.
    }, [targetLanguage, selectedTTS, voiceOptionsList, setSelectedVoice, optionsLoading, selectedVoice.value]); // Depend on context list and loading state


    // --- Other Effects ---

    // Timer for notifications
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
    const updateTotalTokenCount = (tokenCount?: TokenCount) => {
        if (!tokenCount) return;
        
        const currentTotalTokenCount = totalTokenCount || { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        const newTotalTokenCount = {
            inputTokens: currentTotalTokenCount.inputTokens + (tokenCount.inputTokens || 0),
            outputTokens: currentTotalTokenCount.outputTokens + (tokenCount.outputTokens || 0),
            totalTokens: currentTotalTokenCount.totalTokens + (tokenCount.totalTokens || 0)
        };

        setTotalTokenCount(newTotalTokenCount);
    };

    // Function to save the selected phrase with its definition, TTS and translation
    const handleSaveItem = async () => {
        if (selectedSentence && definitions && sentences) {
            try {
                // Always generate new TTS for the selected sentence
                const audioBlob = await handleGenerateTTS(selectedSentence, selectedVoice, selectedTTS, callApiWithAuth); // Pass callApiWithAuth
                const translationResult = await handleTranslation(selectedSentence, setError, setIsTranslateLoading, updateTotalTokenCount, setTranslation, isTranslateLoading, nativeLanguage, targetLanguage, selectedAPIService.value, selectedLLM.value, callApiWithAuth); // Pass callApiWithAuth

                const audioKey = `audio_${Date.now()}`; // Generate a unique key for the audio
                const newItem: SavedItem = {
                    sentence: selectedSentence,
                    definition: definitions.text,
                    audioKey: audioKey,
                    translation: translationResult // Use the result from handleTranslation
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
            const audioBlob = await handleGenerateTTS(sentence, selectedVoice, selectedTTS, callApiWithAuth); // Pass callApiWithAuth
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
        // Find the selected voice from the CONTEXT options list
        const newVoice = voiceOptionsList.find(voice => voice.value === e.target.value);
        if (newVoice) {
            setSelectedVoice(newVoice);
            // localStorage update is handled by the context's useEffect
        }
    };

    // Function to handle LLM change
    const handleLLMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Find the selected LLM from the CONTEXT options list for the current API service
        const newLLM = llmOptionsList[selectedAPIService.value]?.find(llm => llm.value === e.target.value);
        if (newLLM) {
            setSelectedLLM(newLLM);
            // localStorage update is handled by the context's useEffect
        }
    };

    // --- Render Logic ---

    // Display loading indicator (using context state)
    if (optionsLoading) {
        return <S.AppContainer><Header /><S.LoadingMessage>Loading options...</S.LoadingMessage><Footer /></S.AppContainer>;
    }

    // Display error message if options failed to load (using context state)
    if (optionsError) {
        return <S.AppContainer><Header /><S.Error>Failed to load application options: {optionsError}</S.Error><Footer /></S.AppContainer>;
    }

    // Main render when options are loaded (optionsLoading is false and optionsError is null)
    return (
        <S.AppContainer>
            <>
                <Header />

                <S.MainContent>
                    {/* Render the card generator section */}
                    {!showStats && (
                    <S.Section id="card-generator">
                        <h2>Card Generator</h2>
                        <S.Form onSubmit={(e) => handleSubmit(e, setDefinitions, setSentences, setTotalTokenCount, setError, setIsGenerateLoading, setCurrentPage, updateTotalTokenCount, setShowGenerateNotification, nativeLanguage, targetLanguage, selectedAPIService, selectedTTS, word, selectedLLM, callApiWithAuth)}> {/* Pass callApiWithAuth */}
                            {/* API service selection dropdown */}
                            <S.FormGroup>
                                <label htmlFor="api-service-select">AI Provider:</label>
                                <select
                                    id="api-service-select"
                                    value={selectedAPIService.value}
                                    // Find the selected option from the CONTEXT list
                                    onChange={(e) => setSelectedAPIService(apiServiceOptionsList.find(option => option.value === e.target.value) || apiServiceOptionsList[0])}
                                    required
                                    disabled={apiServiceOptionsList.length === 0} // Disable if no options loaded
                                >
                                    {/* Message handled by main loading/error check */}
                                    {apiServiceOptionsList.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </S.FormGroup>

                            {/* LLM selection dropdown - options depend on selectedAPIService */}
                            <S.FormGroup>
                                <label htmlFor="llm-select">AI Model:</label>
                                <select
                                    id="llm-select"
                                    value={selectedLLM.value}
                                    onChange={handleLLMChange}
                                    required
                                    // Disable if no models for the selected service
                                    disabled={!llmOptionsList[selectedAPIService.value] || llmOptionsList[selectedAPIService.value].length === 0}
                                >
                                    {/* Show message if no models */}
                                    {(!llmOptionsList[selectedAPIService.value] || llmOptionsList[selectedAPIService.value].length === 0) && <option value="">No models available</option>}
                                    {/* Map over models from CONTEXT list */}
                                    {llmOptionsList[selectedAPIService.value]?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </S.FormGroup>

                            {/* Render the LanguageSelector component */}
                            <LanguageSelector />

                            {/* TTS service selection dropdown */}
                            <S.FormGroup>
                                <label htmlFor="tts-select">TTS Service:</label>
                                <select
                                    id="tts-select"
                                    value={selectedTTS.value}
                                    // Find the selected option from the CONTEXT list
                                    onChange={(e) => setSelectedTTS(ttsOptionsList.find(option => option.value === e.target.value) || ttsOptionsList[0])}
                                    required
                                    disabled={ttsOptionsList.length === 0} // Disable if no options loaded
                                >
                                    {/* Message handled by main loading/error check */}
                                    {ttsOptionsList.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </S.FormGroup>

                            {/* Voice selection dropdown - options depend on targetLanguage and selectedTTS */}
                            {supportedLanguageCodes.includes(targetLanguage) && (
                                <>
                                    <S.FormGroup>
                                        <label htmlFor="voice-select">Select Voice:</label>
                                        <select
                                            id="voice-select"
                                            value={selectedVoice.value}
                                            onChange={handleVoiceChange}
                                            // Disable if no voices for the current language/TTS combo
                                            disabled={voiceOptionsList.filter(v => v.language === getFullLanguageName(targetLanguage) && v.ttsService === selectedTTS.value).length === 0}
                                        >
                                            {/* Filter and map voices from CONTEXT list */}
                                            {voiceOptionsList
                                                .filter((voice) => voice.language === getFullLanguageName(targetLanguage) && voice.ttsService === selectedTTS.value)
                                                .map((voice) => (
                                                    <option key={voice.value} value={voice.value}>
                                                        {voice.name}
                                                    </option>
                                                ))}
                                            {/* Display message if no voices match */}
                                            {voiceOptionsList.filter(v => v.language === getFullLanguageName(targetLanguage) && v.ttsService === selectedTTS.value).length === 0 && (
                                                <option value="">No voices available</option>
                                            )}
                                        </select>
                                    </S.FormGroup>
                                </>
                            )}

                            <S.FormGroup>
                                <label htmlFor="word-input">Enter a word or expression:</label>
                                <input
                                    id="word-input"
                                    type="text"
                                    value={word}
                                    onChange={(e) => setWord(e.target.value)}
                                    placeholder={`Enter a ${targetLanguage} word`}
                                    required
                                />
                            </S.FormGroup>
                            <S.ButtonContainer>
                                <GenerateButton type="submit" disabled={isGenerateLoading}>
                                    {isGenerateLoading ? 'Generating...' : 'Generate'}
                                </GenerateButton>
                                <DialogueButton type="button" onClick={() => handleGenerateDialogue(
                                    setDialogue, 
                                    setIsDialogueLoading, 
                                    setError, 
                                    updateTotalTokenCount, 
                                    setIsDialogueModalOpen, 
                                    nativeLanguage, 
                                    targetLanguage, // Passar o código da língua (ex: 'de-DE')
                                    selectedAPIService, 
                                    selectedTTS,
                                    word,
                                    selectedLLM,
                                    callApiWithAuth // Pass callApiWithAuth
                                )}
                                disabled={isDialogueLoading}>
                                    {isDialogueLoading ? 'Generating...' : 'Generate Dialogue'}
                                </DialogueButton>
                                <AnalyzeButton type="button" onClick={() => handleAnalyzeFrequency(setFrequencyAnalysis, setIsAnalyzeLoading, setError, updateTotalTokenCount, setIsFrequencyModalOpen, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word, callApiWithAuth)} // Pass callApiWithAuth
                                        disabled={isAnalyzeLoading}>
                                    {isAnalyzeLoading ? 'Analyzing...' : 'Analyze Frequency'}
                                </AnalyzeButton>
                            </S.ButtonContainer>
                        </S.Form>

                        {error && <S.Error role="alert">{error}</S.Error>}

                        {definitions && sentences && (
                            <S.ResultContainer>
                                <h3>Results for: {word}</h3>
                                <S.ResultSection>
                                    <h4>Definitions:</h4>
                                    <ReactMarkdown>{definitions.text}</ReactMarkdown>
                                </S.ResultSection>
                                <S.ResultSection>
                                    <h4>Select 1 Sentence:</h4>
                                    <S.SentenceList>
                                        {getCurrentPageSentences().map((sentence, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleSentenceClick(sentence)}
                                                className={selectedSentence === sentence ? 'selected' : ''}
                                            >
                                                <ReactMarkdown>{sentence}</ReactMarkdown>
                                                {/* TTS listen button */}
                                                {supportedLanguageCodes.includes(targetLanguage) && (
                                                    <ListenButton onClick={() => handleTTS(sentence)}>
                                                        Listen
                                                    </ListenButton>
                                                )}
                                            </li>
                                        ))}
                                    </S.SentenceList>

                                    <S.Pagination>
                                        <PaginationButton
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </PaginationButton>
                                        <span>Page {currentPage} of {sentences.totalPages}</span>
                                        <PaginationButton
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === sentences.totalPages}
                                        >
                                            Next
                                        </PaginationButton>
                                    </S.Pagination>

                                    {selectedSentence && (
                                        <div className="selected-sentence">
                                            <h4>Selected Sentence:</h4>
                                            <ReactMarkdown>{selectedSentence}</ReactMarkdown>
                                            <SaveButton onClick={handleSaveItem}>Save Sentence</SaveButton>
                                            <StyledTranslateButton
                                                disabled={isTranslateLoading}
                                                onClick={() => handleTranslation(selectedSentence!, setError, setIsTranslateLoading, updateTotalTokenCount, setTranslation, isTranslateLoading, nativeLanguage, targetLanguage, selectedAPIService.value, selectedLLM.value, callApiWithAuth)} // Pass callApiWithAuth (added non-null assertion for selectedSentence)
                                            >
                                                {isTranslateLoading ? 'Translating...' : 'Translate this sentence'}
                                            </StyledTranslateButton>
                                            {translation && (
                                                <div className="translation">
                                                    <h4>Translation:</h4>
                                                    <ReactMarkdown>{translation}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </S.ResultSection>

                                <S.TokenInfo>
                                    <h4>Total Tokens:</h4>
                                    <p>
                                        Input: {totalTokenCount?.inputTokens}<br />
                                        Output: {totalTokenCount?.outputTokens}<br />
                                        Total: {totalTokenCount?.totalTokens}
                                    </p>
                                </S.TokenInfo>
                            </S.ResultContainer>
                        )}
                    </S.Section>)}
                    
                    {showStats && (
                        <S.Section id="stats">
                            <Stats totalTokenCount={totalTokenCount} />
                        </S.Section>
                    )}

                    {/* Render the saved items section */}
                    <S.Section id="saved-items">
                        <h2>Saved Items</h2>
                        {savedItems.length > 0 ? (
                            <>
                                <S.SavedItemsList>
                                    {savedItems.map((item, index) => (
                                        <li key={index}>
                                            <S.SavedItemContent>
                                                <ReactMarkdown>{item.sentence}</ReactMarkdown>
                                                <ReactMarkdown>{item.definition}</ReactMarkdown>
                                                {item.translation && (
                                                    <div className="translation">
                                                        <ReactMarkdown>{item.translation}</ReactMarkdown>
                                                    </div>
                                                )}
                                                {item.audioKey && audioData[item.audioKey] && (
                                                    <Button onClick={() => playSavedAudio(item.audioKey!)}>
                                                        Play Audio
                                                    </Button>
                                                )}
                                            </S.SavedItemContent>
                                            <Button onClick={() => handleRemoveSavedItem(item)}>Remove</Button>
                                        </li>
                                    ))}
                                </S.SavedItemsList>
                                <S.ActionButtons>
                                    <S.ExportButton onClick={handleExportClick}>Export</S.ExportButton>
                                    <S.ClearAllButton onClick={handleClearAll}>Clear All</S.ClearAllButton>
                                </S.ActionButtons>
                            </>
                        ) : (
                            <p>No saved items yet. Generate some words and save sentences to see them here!</p>
                        )}
                    </S.Section>
                </S.MainContent>

                {/* Scroll-to-top button */}
                {showScrollTop && (
                    <S.ScrollToTop onClick={scrollToTop}>
                        ↑
                    </S.ScrollToTop>
                )}

                {/* Render the notification messages */}
                <Notifications
                    showSaveNotification={showSaveNotification}
                    showExportNotification={showExportNotification}
                    showRemoveNotification={showRemoveNotification}
                    showClearAllNotification={showClearAllNotification}
                    showGenerateNotification={showGenerateNotification}
                />
                <DialogueModal
                    isOpen={isDialogueModalOpen}
                    onClose={() => setIsDialogueModalOpen(false)}
                    dialogue={dialogue}
                />
                <FrequencyAnalysisModal
                    isOpen={isFrequencyModalOpen}
                    onClose={() => setIsFrequencyModalOpen(false)}
                    frequencyAnalysis={frequencyAnalysis}
                />
                {/* Render the footer */}
                <Footer/>
            </>
        </S.AppContainer>
    );
};

export default AppInner;
