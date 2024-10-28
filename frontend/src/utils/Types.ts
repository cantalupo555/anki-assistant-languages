// Define a type for token counts in the system
export interface TokenCount {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

// Define a type for saved items, which are sentences and their associated data
export interface SavedItem {
    sentence: string;
    definition: string;
    audioKey?: string;
    translation?: string;
}

// Define a type for TTS (Text-to-Speech) options
export interface TTSOption {
    name: string;
    value: string;
}

// Define a type for voice options, which are used by TTS services
export interface VoiceOption {
    name: string;
    value: string;
    language: string;
    languageCode: string;
    ttsService: 'google' | 'azure';
}

// Define a type for API service options, which are used to select the backend service
export interface APIServiceOption {
    name: string;
    value: string;
}

// Define a type for LLM model options, which are used to select the LLM model
export interface LLMOption {
    name: string;
    value: string;
}

// Define the props for the Modal component
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    contentType: 'dialogue' | 'analysis' | 'default';
}

// Define a type for frequency analysis, which includes the text and its associated token counts
export interface FrequencyAnalysis {
    text: string;
    tokenCount: TokenCount;
}

// Define the props for the Login component
export interface LoginProps {
    onLogin: (username: string, password: string) => void;
}
