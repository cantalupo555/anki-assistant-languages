// Import necessary libraries
// React: Core library for building user interfaces
// createContext: Function to create a context object for state management
// useState: Hook to add state to functional components
// useEffect: Hook to perform side effects in functional components
// useContext: Hook to consume a context within a functional component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { APIServiceOption, TTSOption, VoiceOption, LLMOption, TokenCount } from '../utils/Types';
import { voiceOptions } from '../utils/voiceOptions'; // Import the voiceOptions array

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
        const savedVoice = localStorage.getItem('selectedVoice');
        if (savedVoice) {
            return JSON.parse(savedVoice);
        }
        return voiceOptions[0]; // Default to first voice if nothing is saved
    });

    // State to manage the selected LLM model
    const [selectedLLM, setSelectedLLM] = useState<LLMOption>(() => {
        const savedLLM = localStorage.getItem('selectedLLM');
        if (savedLLM) {
            return JSON.parse(savedLLM);
        }
        return { name: 'Select AI', value: '' }; // Default to first option if nothing is saved
    });

    const [totalTokenCount, setTotalTokenCount] = useState<TokenCount | null>(null);

    // Effect to save the state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('nativeLanguage', nativeLanguage);
        localStorage.setItem('selectedLanguage', targetLanguage);
        localStorage.setItem('selectedAPIService', JSON.stringify(selectedAPIService));
        localStorage.setItem('selectedTTS', JSON.stringify(selectedTTS));
        localStorage.setItem('selectedVoice', JSON.stringify(selectedVoice));
        localStorage.setItem('selectedLLM', JSON.stringify(selectedLLM));
    }, [nativeLanguage, targetLanguage, selectedAPIService, selectedTTS, selectedVoice, selectedLLM]);

    // Effect to set the default voice option based on the selected language and TTS service
    useEffect(() => {
        const savedVoice = localStorage.getItem('selectedVoice');
        if (savedVoice) {
            const parsedVoice = JSON.parse(savedVoice);
            const matchingVoice = voiceOptions.find(
                (voice) => voice.value === parsedVoice.value &&
                    voice.language === targetLanguage &&
                    voice.ttsService === selectedTTS.value
            );
            if (matchingVoice) {
                setSelectedVoice(matchingVoice);
            } else {
                // If no matching voice found, set default for current language and TTS
                const defaultVoice = voiceOptions.find(
                    (voice) => voice.language === targetLanguage && voice.ttsService === selectedTTS.value
                ) || voiceOptions[0];
                setSelectedVoice(defaultVoice);
            }
        } else {
            // If no saved voice, set default for current language and TTS
            const defaultVoice = voiceOptions.find(
                (voice) => voice.language === targetLanguage && voice.ttsService === selectedTTS.value
            ) || voiceOptions[0];
            setSelectedVoice(defaultVoice);
        }
    }, [targetLanguage, selectedTTS]);

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
            setTotalTokenCount
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
