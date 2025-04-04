// Import necessary dependencies and utility functions
import { stripMarkdown } from './markdownStripper';
// import { validateAndRefreshToken } from './validateAndRefreshToken'; // Removed deprecated import
import { VoiceOption, TTSOption } from './Types';

// Define the backend API URLs, using environment variables
const TTS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/tts';

// Function to handle generating TTS
export const handleGenerateTTS = async (
    sentence: string,
    selectedVoice: VoiceOption,
    selectedTTS: TTSOption,
    // Replace token parameter with callApiWithAuth function
    callApiWithAuth: (url: string, options?: RequestInit) => Promise<Response>
): Promise<Blob> => {
    // No need for explicit token check here
    const strippedSentence = stripMarkdown(sentence);
    // Use callApiWithAuth instead of fetch
    const response = await callApiWithAuth(TTS_URL, { // Use callApiWithAuth
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Authorization header is handled by callApiWithAuth
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
