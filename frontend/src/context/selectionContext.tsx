// Import necessary libraries
import React, { createContext, useState, useEffect, useContext } from 'react';

// Import type definitions
import {
    APIServiceOption,
    LLMOption,
    TokenCount,
    TTSOption,
    VoiceOption,
    LanguageOption,
} from '../utils/Types';

// Define the shape of the context
interface AppContextType {
    nativeLanguage: string;
    setNativeLanguage: React.Dispatch<React.SetStateAction<string>>;
    targetLanguage: string;
    setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
    selectedAPIService: APIServiceOption;
    setSelectedAPIService: React.Dispatch<React.SetStateAction<APIServiceOption>>;
    selectedTTS: TTSOption;
    setSelectedTTS: React.Dispatch<React.SetStateAction<TTSOption>>;
    selectedVoice: VoiceOption;
    setSelectedVoice: React.Dispatch<React.SetStateAction<VoiceOption>>;
    selectedLLM: LLMOption;
    setSelectedLLM: React.Dispatch<React.SetStateAction<LLMOption>>;
    totalTokenCount: TokenCount | null;
    setTotalTokenCount: React.Dispatch<React.SetStateAction<TokenCount | null>>;
    // Add states for fetched options lists
    apiServiceOptionsList: APIServiceOption[];
    setApiServiceOptionsList: React.Dispatch<React.SetStateAction<APIServiceOption[]>>;
    llmOptionsList: { [key: string]: LLMOption[] };
    setLlmOptionsList: React.Dispatch<React.SetStateAction<{ [key: string]: LLMOption[] }>>;
    ttsOptionsList: TTSOption[];
    setTtsOptionsList: React.Dispatch<React.SetStateAction<TTSOption[]>>;
    voiceOptionsList: VoiceOption[];
    setVoiceOptionsList: React.Dispatch<React.SetStateAction<VoiceOption[]>>;
    // Add states for options loading status
    optionsLoading: boolean;
    setOptionsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    optionsError: string | null;
    setOptionsError: React.Dispatch<React.SetStateAction<string | null>>;
    // Add states for language options
    languageOptionsList: LanguageOption[];
    setLanguageOptionsList: React.Dispatch<React.SetStateAction<LanguageOption[]>>;
}

// Create the context with an initial value of undefined
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the AppProvider component to manage the context
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State to manage the native language
    const [nativeLanguage, setNativeLanguage] = useState<string>(() => {
        return localStorage.getItem('nativeLanguage') || '';
    });

    // State to manage the target language
    const [targetLanguage, setTargetLanguage] = useState<string>(() => {
        return localStorage.getItem('selectedLanguage') || '';
    });

    // State to manage the selected API service
    const [selectedAPIService, setSelectedAPIService] = useState<APIServiceOption>(() => {
        return JSON.parse(localStorage.getItem('selectedAPIService') || '{}') || { name: 'Anthropic Claude', value: 'anthropic' };
    });

    // State to manage the selected TTS service
    const [selectedTTS, setSelectedTTS] = useState<TTSOption>(() => {
        return JSON.parse(localStorage.getItem('selectedTTS') || '{}') || { name: 'Google TTS', value: 'google' };
    });

    // State to manage the selected voice
    const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(() => {
        // Initialize with a placeholder or null, default will be set in AppInner after fetching
        const savedVoice = localStorage.getItem('selectedVoice');
        return savedVoice ? JSON.parse(savedVoice) : { name: 'Select Voice', value: '', language: '', languageCode: '', ttsService: 'google' }; // Placeholder
    });

    // State to manage the selected LLM model
    const [selectedLLM, setSelectedLLM] = useState<LLMOption>(() => {
        const savedLLM = localStorage.getItem('selectedLLM');
        if (savedLLM) {
            return JSON.parse(savedLLM);
        }
        // Initialize with a placeholder, default will be set in AppInner after fetching
        return { name: 'Select Model', value: '' }; // Placeholder
    });

    const [totalTokenCount, setTotalTokenCount] = useState<TokenCount | null>(null);

    // State for fetched options lists
    const [apiServiceOptionsList, setApiServiceOptionsList] = useState<APIServiceOption[]>([]);
    const [llmOptionsList, setLlmOptionsList] = useState<{ [key: string]: LLMOption[] }>({});
    const [ttsOptionsList, setTtsOptionsList] = useState<TTSOption[]>([]);
    const [voiceOptionsList, setVoiceOptionsList] = useState<VoiceOption[]>([]);
    const [optionsLoading, setOptionsLoading] = useState<boolean>(true); // Start as loading
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [languageOptionsList, setLanguageOptionsList] = useState<LanguageOption[]>([]);


    // Effect to save the user selections to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('nativeLanguage', nativeLanguage);
        localStorage.setItem('selectedLanguage', targetLanguage);
        localStorage.setItem('selectedAPIService', JSON.stringify(selectedAPIService));
        localStorage.setItem('selectedTTS', JSON.stringify(selectedTTS));
        localStorage.setItem('selectedVoice', JSON.stringify(selectedVoice));
        localStorage.setItem('selectedLLM', JSON.stringify(selectedLLM));
    }, [nativeLanguage, targetLanguage, selectedAPIService, selectedTTS, selectedVoice, selectedLLM]);

    // NOTE: The useEffect hook that previously set the default voice based on
    // targetLanguage and selectedTTS has been removed. This logic will now
    // reside in AppInner.tsx after the voice options are fetched from the API.

    // Return the context provider with the state and state setters
    return (
        <AppContext.Provider value={{
            nativeLanguage,
            setNativeLanguage,
            targetLanguage,
            setTargetLanguage,
            selectedAPIService,
            setSelectedAPIService,
            selectedTTS,
            setSelectedTTS,
            selectedVoice,
            setSelectedVoice,
            selectedLLM,
            setSelectedLLM,
            totalTokenCount,
            setTotalTokenCount,
            // Expose fetched options and status
            apiServiceOptionsList,
            setApiServiceOptionsList,
            llmOptionsList,
            setLlmOptionsList,
            ttsOptionsList,
            setTtsOptionsList,
            voiceOptionsList,
            setVoiceOptionsList,
            optionsLoading,
            setOptionsLoading,
            optionsError,
            setOptionsError,
            // Expose language options
            languageOptionsList,
            setLanguageOptionsList,
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
