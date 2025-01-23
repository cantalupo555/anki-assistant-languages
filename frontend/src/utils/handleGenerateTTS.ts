// Import necessary dependencies and utility functions
import { stripMarkdown } from './markdownStripper';
import { validateAndRefreshToken } from './validateAndRefreshToken';
import { VoiceOption, TTSOption } from './Types';

// Define the backend API URLs, using environment variables
const TTS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/tts';

// Function to handle generating TTS
export const handleGenerateTTS = async (sentence: string, selectedVoice: VoiceOption, selectedTTS: TTSOption, token: string | null): Promise<Blob> => {
    if (!token) {
        throw new Error('Não autenticado');
    }
    const strippedSentence = stripMarkdown(sentence);
    const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
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
