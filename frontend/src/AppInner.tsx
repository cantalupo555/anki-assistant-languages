// Import necessary dependencies and utility functions
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Context imports
import { useAppContext } from './context/selectionContext';

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
import { apiServiceOptions, llmOptions, ttsOptions } from './utils/Options';
import { handleAnalyzeFrequency } from './utils/handleAnalyzeFrequency';
import { handleExport } from './utils/languageCardExporter';
import { handleGenerateDialogue } from './utils/handleGenerateDialogue';
import { handleGenerateTTS } from './utils/handleGenerateTTS';
import { handleTranslation } from './utils/handleTranslation';
import { handleSubmit } from './utils/handleSubmit';
import { voiceOptions } from './utils/voiceOptions';
import { FrequencyAnalysis, SavedItem, TokenCount } from './utils/Types';

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
                const token = localStorage.getItem('token');
                const audioBlob = await handleGenerateTTS(selectedSentence, selectedVoice, selectedTTS, token);
                const translation = await handleTranslation(selectedSentence, setError, setIsTranslateLoading, updateTotalTokenCount, setTranslation, isTranslateLoading, nativeLanguage, targetLanguage, selectedAPIService.value, selectedLLM.value);

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
            const token = localStorage.getItem('token');
            const audioBlob = await handleGenerateTTS(sentence, selectedVoice, selectedTTS, token);
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

    return (
        <S.AppContainer>
            <>
                <Header />

                <S.MainContent>
                    {/* Render the card generator section */}
                    {!showStats && (
                    <S.Section id="card-generator">
                        <h2>Card Generator</h2>
                        <S.Form onSubmit={(e) => handleSubmit(e, setDefinitions, setSentences, setTotalTokenCount, setError, setIsGenerateLoading, setCurrentPage, updateTotalTokenCount, setShowGenerateNotification, nativeLanguage, targetLanguage, selectedAPIService, selectedTTS, word, selectedLLM)}> {/* Update the onSubmit prop */}
                            {/* API service selection dropdown */}
                            <S.FormGroup>
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
                            </S.FormGroup>

                            {/* LLM selection dropdown */}
                            <S.FormGroup>
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
                            </S.FormGroup>

                            {/* Render the LanguageSelector component */}
                            <LanguageSelector />

                            {/* TTS service selection dropdown */}
                            <S.FormGroup>
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
                            </S.FormGroup>

                            {/* Voice selection dropdown */}
                            {(targetLanguage === 'English (United States)' || targetLanguage === 'Italian (Italy)' || targetLanguage === 'German (Germany)' || targetLanguage === 'French (France)' || targetLanguage === 'Spanish (Spain)' || targetLanguage === 'Portuguese (Brazil)' || targetLanguage === 'Dutch (Netherlands)' || targetLanguage === 'Polish (Poland)' || targetLanguage === 'Russian (Russia)' || targetLanguage === 'Mandarin (China)' || targetLanguage === 'Japanese (Japan)' || targetLanguage === 'Korean (Korea)') && (
                                <>
                                    <S.FormGroup>
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
                                <DialogueButton type="button" onClick={() => handleGenerateDialogue(setDialogue, setIsDialogueLoading, setError, updateTotalTokenCount, setIsDialogueModalOpen, nativeLanguage, targetLanguage, selectedAPIService, selectedTTS, word, selectedLLM)}
                                        disabled={isDialogueLoading}>
                                    {isDialogueLoading ? 'Generating...' : 'Generate Dialogue'}
                                </DialogueButton>
                                <AnalyzeButton type="button" onClick={() => handleAnalyzeFrequency(setFrequencyAnalysis, setIsAnalyzeLoading, setError, updateTotalTokenCount, setIsFrequencyModalOpen, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word)}
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
                                                {(targetLanguage === 'English (United States)' || targetLanguage === 'Italian (Italy)' || targetLanguage === 'German (Germany)' || targetLanguage === 'French (France)' || targetLanguage === 'Spanish (Spain)' || targetLanguage === 'Portuguese (Brazil)' || targetLanguage === 'Dutch (Netherlands)' || targetLanguage === 'Polish (Poland)' || targetLanguage === 'Russian (Russia)' || targetLanguage === 'Mandarin (China)' || targetLanguage === 'Japanese (Japan)' || targetLanguage === 'Korean (Korea)') && (
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
                                                onClick={() => handleTranslation(selectedSentence, setError, setIsTranslateLoading, updateTotalTokenCount, setTranslation, isTranslateLoading, nativeLanguage, targetLanguage, selectedAPIService.value, selectedLLM.value)}
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
