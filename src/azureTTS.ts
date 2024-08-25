import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env file
dotenv.config();

// Get the Azure Speech Key and Region from the environment variables
const SPEECH_KEY = process.env.AZURE_SPEECH_RESOURCE_KEY;
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

// Construct the endpoint URL
const ENDPOINT = `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

// Define the output format
const OUTPUT_FORMAT = 'riff-24khz-16bit-mono-pcm';

export async function textToSpeech(text: string, voice: string, languageCode: string): Promise<Buffer> {
    // Validate environment variables
    if (!SPEECH_KEY || !SPEECH_REGION) {
        throw new Error('Azure Speech API key or region not found. Check your .env file');
    }

    // Validate input parameters
    if (!text || !voice || !languageCode) {
        throw new Error('Invalid input: text, voice, and languageCode are required');
    }

    // Set the required headers for the Azure TTS API request
    const headers = {
        'Ocp-Apim-Subscription-Key': SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'AnkiAssistantLanguages'
    };

    // Construct the SSML (Speech Synthesis Markup Language) request body
    const ssml = `
        <speak version='1.0' xml:lang='${languageCode}'>
            <voice name='${voice}'>
                ${text}
            </voice>
        </speak>
    `;

    try {
        // Send the POST request to the Azure TTS API endpoint
        const response = await axios.post(ENDPOINT, ssml, {
            headers,
            responseType: 'arraybuffer'
        });
        // Return the audio data as a Buffer
        return Buffer.from(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Azure TTS API Error:', error.response?.status, error.response?.data);
            throw new Error(`Azure TTS API Error: ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred while generating speech');
        }
    }
}
