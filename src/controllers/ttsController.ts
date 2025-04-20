/**
 * @fileOverview Controller functions for handling Text-to-Speech (TTS) generation requests.
 * 
 * @dependencies
 * - express (Request, Response): For handling HTTP requests and responses.
 * - ../azureTTS (textToSpeech as azureTextToSpeech): Handler for Azure TTS API.
 * - ../googleCloudTTS (textToSpeech as googleTextToSpeech): Handler for Google Cloud TTS API.
 * - ../config/serverConfig (supportedTTSServices, supportedLanguages): For validation constants.
 */
import { Request, Response } from 'express';
import { textToSpeech as azureTextToSpeech } from '../azureTTS';
import { textToSpeech as googleTextToSpeech } from '../googleCloudTTS';
import { supportedTTSServices, supportedLanguages } from '../config/serverConfig'; // Import from serverConfig

/**
 * Validates the `text` parameter.
 * @param text - Text to be validated.
 * @throws {Error} If the text is invalid.
 */
function validateText(text: any): void {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Valid text is required for TTS');
    }
}

/**
 * Validates parameters related to TTS.
 * @param ttsService - TTS service (google or azure).
 * @param languageCode - Supported language code.
 * @param voice - Selected voice.
 * @throws {Error} If any parameter is invalid.
 */
function validateTTSParams(ttsService: any, languageCode: any, voice: any): void {
    if (!ttsService || typeof ttsService !== 'string' || !supportedTTSServices.includes(ttsService)) {
        throw new Error(`Valid TTS service (${supportedTTSServices.join(', ')}) is required`);
    }
    if (!languageCode || typeof languageCode !== 'string' || !supportedLanguages.includes(languageCode)) {
        // Use supportedLanguages imported from serverConfig
        throw new Error(`Invalid or unsupported language code. Supported: ${supportedLanguages.join(', ')}`);
    }
    if (!voice || typeof voice !== 'string') {
         throw new Error('Valid voice name is required');
    }
    // Optional: Add stricter validation for voice format or if it belongs to the service/language
    // Example: if (!voice.startsWith(languageCode)) { // This validation might be too restrictive depending on voice names
    //    throw new Error('Voice name does not seem to match the language code');
    // }
}

/**
 * @description Generates audio speech from text using the specified TTS service and voice.
 * @route POST /tts
 * @access Private (Requires authentication and active status via middleware in the route)
 * @param {Request} req - Express request object. Body should contain { text, voice, languageCode, ttsService }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends the generated audio file (WAV) or an error status.
 */
export async function generateSpeech(req: Request, res: Response): Promise<void> {
    try {
        const { text, voice, languageCode, ttsService } = req.body;

        // Validate parameters
        validateText(text);
        validateTTSParams(ttsService, languageCode, voice);

        console.log(`[${new Date().toISOString()}] /tts: Request received`, { ttsService, languageCode, voice, textLength: text.length });

        let audioBuffer: Buffer;

        // Call the appropriate TTS service
        if (ttsService === 'google') {
            console.log(`[${new Date().toISOString()}] /tts: Calling Google TTS...`);
            audioBuffer = await googleTextToSpeech(text, voice, languageCode);
        } else if (ttsService === 'azure') {
            console.log(`[${new Date().toISOString()}] /tts: Calling Azure TTS...`);
            audioBuffer = await azureTextToSpeech(text, voice, languageCode);
        } else {
            // This case should not occur due to validation, but it's good to have a fallback
            throw new Error(`Unsupported TTS service: ${ttsService}`);
        }

        console.log(`[${new Date().toISOString()}] /tts: Success. Sending audio buffer (size: ${audioBuffer.length} bytes).`);
        // Send the audio response
        res.set('Content-Type', 'audio/wav');
        res.send(audioBuffer);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in /tts:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred during TTS generation';
        // Ensure the status code is appropriate for validation errors vs. internal errors
        const statusCode = (error instanceof Error && (error.message.includes('required') || error.message.includes('Invalid'))) ? 400 : 500;
        res.status(statusCode).json({ error: errorMessage });
    }
}
