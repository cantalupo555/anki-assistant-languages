import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env file
dotenv.config();

// Get the Google Cloud API key from the environment variable
const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

// Interface for the Text-to-Speech request payload
interface TTSRequest {
    audioConfig: {
        audioEncoding: string;
        effectsProfileId: string[];
        pitch: number;
        speakingRate: number;
    };
    input: {
        text: string;
    };
    voice: {
        languageCode: string;
        name: string;
    };
}

// Interface for the Text-to-Speech response
interface TTSResponse {
    audioContent: string;
}

// Function to convert text to speech using the Google Cloud Text-to-Speech API
export async function textToSpeech(text: string, voice: string): Promise<Buffer> {
    // Check if the API key is available
    if (!API_KEY) {
        throw new Error('Google Cloud API key not found. Check your .env file');
    }

    // Construct the request payload
    const payload: TTSRequest = {
        audioConfig: {
            audioEncoding: 'LINEAR16',
            effectsProfileId: [
                'small-bluetooth-speaker-class-device'
            ],
            pitch: 0,
            speakingRate: 1
        },
        input: {
            text: text
        },
        voice: {
            languageCode: 'en-US',
            name: voice
        }
    };

    try {
        // Send the request to the Google Cloud Text-to-Speech API
        const response = await axios.post<TTSResponse>(URL, payload);

        // Check if the response is successful and contains the audio content
        if (response.status === 200 && response.data.audioContent) {
            // Convert the base64-encoded audio content to a Buffer
            return Buffer.from(response.data.audioContent, 'base64');
        } else {
            throw new Error('Unexpected response from API');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Request error:', error.response?.status);
            console.error('Details:', error.response?.data);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
}
