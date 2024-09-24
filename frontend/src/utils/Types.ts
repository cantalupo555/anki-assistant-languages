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
    ttsService: string;
}

// Define a type for API service options, which are used to select the backend service
export interface APIServiceOption {
    name: string;
    value: string;
}
