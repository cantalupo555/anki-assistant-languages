/**
 * @fileOverview Controller functions for handling content generation requests,
 * including definitions, example sentences, and dialogues.
 * All operations require user authentication and active status.
 *
 * @dependencies
 * - express (Request, Response): For handling HTTP requests and responses.
 * - ../config/serverConfig (pool): Potentially for logging or limits (currently unused here).
 * - ../../frontend/src/utils/languageMapping (getFullLanguageName): To get full language names.
 * - ../../frontend/src/utils/Types (TokenCount): For typing token counts.
 * - ../anthropicClaude: API handler for Anthropic Claude.
 * - ../googleGemini: API handler for Google Gemini.
 * - ../openRouter: API handler for OpenRouter.
 */
import { Request, Response } from 'express';
// import { pool } from '../config/serverConfig'; // Assuming pool might be needed later
import { getFullLanguageName } from '../../frontend/src/utils/languageMapping'; // Path might need adjustment if moved
import { TokenCount } from '../../frontend/src/utils/Types'; // Path might need adjustment

// Import API handlers (adjust paths if needed)
import {
    getDefinitionsAnthropicClaude, getSentencesAnthropicClaude, getDialogueAnthropicClaude,
    translateSentenceAnthropicClaude, analyzeFrequencyAnthropicClaude
} from '../anthropicClaude';
import {
    getDefinitionsGoogleGemini, getSentencesGoogleGemini, getDialogueGoogleGemini,
    translateSentenceGoogleGemini, analyzeFrequencyGoogleGemini
} from '../googleGemini';
import {
    getDefinitionsOpenRouter, getSentencesOpenRouter, getDialogueOpenRouter,
    translateSentenceOpenRouter, analyzeFrequencyOpenRouter
} from '../openRouter';

// --- Helper Functions (Consider moving to a shared utility file) ---

/**
 * Initializes a TokenCount object.
 * @returns {TokenCount} An object with zeroed token counts.
 */
function initializeTokenCount(): TokenCount {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

/**
 * Validates common parameters for generation requests.
 * NOTE: This is a basic validation. Consider enhancing or moving to middleware.
 * TODO: Add validation against supportedLanguages, supportedAPIServices, llmOptions from config.
 *
 * @param {Request} req - The Express request object.
 * @param {boolean} [requireNativeLanguage=false] - Whether nativeLanguage is required.
 * @returns {object} Validated parameters { word, targetLanguage, nativeLanguage, apiService, llm }.
 * @throws {Error} If any required parameter is missing or invalid.
 */
function validateGenerationParams(req: Request, requireNativeLanguage = false): { word: string; targetLanguage: string; nativeLanguage?: string; apiService: string; llm: string } {
    const { word, text, targetLanguage, language, nativeLanguage, apiService, llm } = req.body;

    const content = word || text; // Use 'word' or 'text' from body
    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new Error('Valid word or text is required');
    }

    const targetLang = targetLanguage || language; // Allow 'language' as alias
    if (!targetLang || typeof targetLang !== 'string') { // TODO: Validate against supportedLanguages
        throw new Error('Valid target language is required');
    }

    if (!apiService || typeof apiService !== 'string') { // TODO: Validate against supportedAPIServices
        throw new Error('Valid API service is required');
    }

    if (!llm || typeof llm !== 'string') {
        throw new Error('Valid LLM model is required');
    }

    if (requireNativeLanguage) {
        if (!nativeLanguage || typeof nativeLanguage !== 'string') { // TODO: Validate against supportedLanguages
            throw new Error('Valid native language is required for this operation');
        }
        return { word: content, targetLanguage: targetLang, nativeLanguage, apiService, llm };
    }

    return { word: content, targetLanguage: targetLang, apiService, llm };
}


// --- Controller Functions ---

/**
 * @description Generates word definitions using the selected AI service.
 * @route POST /generate/definitions
 * @access Private (Requires authentication and active status via middleware)
 * @param {Request} req - Express request object. Body should contain { word, targetLanguage, apiService, llm }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with definitions or error.
 */
export async function generateDefinitions(req: Request, res: Response): Promise<void> {
    const endpoint = '/generate/definitions'; // For logging context
    try {
        const { word, targetLanguage, apiService, llm } = validateGenerationParams(req);
        const targetLanguageFull = getFullLanguageName(targetLanguage); // Assuming this mapping is still needed/correct
        console.log(`[${new Date().toISOString()}] ${endpoint}: Validated params:`, { word, targetLanguage: targetLanguageFull, apiService, llm });

        let definitions = '';
        let definitionsTokens = initializeTokenCount();

        console.log(`[${new Date().toISOString()}] ${endpoint}: Calling ${apiService} API...`);

        // Select the appropriate API handler based on the service
        if (apiService === 'anthropic') {
            [definitions, definitionsTokens] = await getDefinitionsAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [definitions, definitionsTokens] = await getDefinitionsOpenRouter(word, targetLanguage, llm);
        } else if (apiService === 'google') {
            [definitions, definitionsTokens] = await getDefinitionsGoogleGemini(word, targetLanguage, llm);
        } else {
            // Handle unsupported service
            console.warn(`[${new Date().toISOString()}] ${endpoint}: Unsupported API service requested: ${apiService}`);
            res.status(400).json({ error: `Unsupported API service: ${apiService}` });
            return;
        }

        console.log(`[${new Date().toISOString()}] ${endpoint}: Success from ${apiService}`, { tokenCount: definitionsTokens });
        // Send successful response
        res.status(200).json({ definitions: { text: definitions, tokenCount: definitionsTokens } });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in ${endpoint}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred generating definitions';
        // Send error response
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Generates example sentences for a word using the selected AI service.
 * @route POST /generate/sentences
 * @access Private (Requires authentication and active status via middleware)
 * @param {Request} req - Express request object. Body should contain { word, targetLanguage, apiService, llm }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with sentences or error.
 */
export async function generateSentences(req: Request, res: Response): Promise<void> {
    const endpoint = '/generate/sentences'; // For logging context
    try {
        const { word, targetLanguage, apiService, llm } = validateGenerationParams(req);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        console.log(`[${new Date().toISOString()}] ${endpoint}: Validated params:`, { word, targetLanguage: targetLanguageFull, apiService, llm });

        let sentences = '';
        let sentencesTokens = initializeTokenCount();

        console.log(`[${new Date().toISOString()}] ${endpoint}: Calling ${apiService} API...`);

        // Select the appropriate API handler
        if (apiService === 'anthropic') {
            [sentences, sentencesTokens] = await getSentencesAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [sentences, sentencesTokens] = await getSentencesOpenRouter(word, targetLanguage, llm);
        } else if (apiService === 'google') {
            [sentences, sentencesTokens] = await getSentencesGoogleGemini(word, targetLanguage, llm);
        } else {
            console.warn(`[${new Date().toISOString()}] ${endpoint}: Unsupported API service requested: ${apiService}`);
            res.status(400).json({ error: `Unsupported API service: ${apiService}` });
            return;
        }

        console.log(`[${new Date().toISOString()}] ${endpoint}: Success from ${apiService}`, { tokenCount: sentencesTokens });
        // Process sentences into an array for the frontend
        const sentencesArray = sentences.split('\n').filter(sentence => sentence.trim() !== '');
        // Send successful response
        res.status(200).json({
            sentences: {
                text: sentencesArray,
                tokenCount: sentencesTokens,
                totalPages: Math.ceil(sentencesArray.length / 5) // Assuming 5 sentences per page for frontend pagination
            }
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in ${endpoint}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred generating sentences';
        // Send error response
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Translates text from the target language to the native language using the selected AI service.
 * @route POST /generate/translate (Note: Route defined as /translate in generationRoutes.ts)
 * @access Private (Requires authentication and active status via middleware)
 * @param {Request} req - Express request object. Body should contain { word/text, targetLanguage, nativeLanguage, apiService, llm }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with the translation or error.
 */
export async function translateText(req: Request, res: Response): Promise<void> {
    const endpoint = '/generate/translate'; // For logging context
    try {
        // Translation requires native language
        const { word: content, targetLanguage, nativeLanguage, apiService, llm } = validateGenerationParams(req, true);
         if (!nativeLanguage) { // Double check
             throw new Error('Native language is required for translation but was not validated.');
        }

        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage);
        console.log(`[${new Date().toISOString()}] ${endpoint}: Validated params:`, { content, targetLanguage: targetLanguageFull, nativeLanguage: nativeLanguageFull, apiService, llm });

        let translation = '';
        let translationTokens = initializeTokenCount();

        console.log(`[${new Date().toISOString()}] ${endpoint}: Calling ${apiService} API...`);

        // Select the appropriate API handler
        if (apiService === 'anthropic') {
            [translation, translationTokens] = await translateSentenceAnthropicClaude(content, targetLanguage, nativeLanguageFull, llm);
        } else if (apiService === 'openrouter') {
            [translation, translationTokens] = await translateSentenceOpenRouter(content, targetLanguage, nativeLanguageFull, llm);
        } else if (apiService === 'google') {
            [translation, translationTokens] = await translateSentenceGoogleGemini(content, targetLanguage, nativeLanguageFull, llm);
        } else {
            console.warn(`[${new Date().toISOString()}] ${endpoint}: Unsupported API service requested: ${apiService}`);
            res.status(400).json({ error: `Unsupported API service: ${apiService}` });
            return;
        }

        console.log(`[${new Date().toISOString()}] ${endpoint}: Success from ${apiService}`, { tokenCount: translationTokens });
        // Send successful response
        res.status(200).json({
            translation: {
                text: translation,
                tokenCount: translationTokens
            }
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in ${endpoint}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred generating translation';
        // Send error response
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Analyzes the frequency of a word in the target language using the selected AI service.
 * @route POST /generate/frequency (Note: Route defined as /frequency in generationRoutes.ts)
 * @access Private (Requires authentication and active status via middleware)
 * @param {Request} req - Express request object. Body should contain { word, targetLanguage, nativeLanguage, apiService, llm }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with the frequency analysis or error.
 */
export async function analyzeFrequency(req: Request, res: Response): Promise<void> {
    const endpoint = '/generate/frequency'; // For logging context
    try {
        // Frequency analysis requires native language for the response
        const { word, targetLanguage, nativeLanguage, apiService, llm } = validateGenerationParams(req, true);
         if (!nativeLanguage) { // Double check
             throw new Error('Native language is required for frequency analysis but was not validated.');
        }

        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage);
        console.log(`[${new Date().toISOString()}] ${endpoint}: Validated params:`, { word, targetLanguage: targetLanguageFull, nativeLanguage: nativeLanguageFull, apiService, llm });

        let analysis = '';
        let analysisTokens = initializeTokenCount();

        console.log(`[${new Date().toISOString()}] ${endpoint}: Calling ${apiService} API...`);

        // Select the appropriate API handler
        if (apiService === 'anthropic') {
            [analysis, analysisTokens] = await analyzeFrequencyAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [analysis, analysisTokens] = await analyzeFrequencyOpenRouter(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'google') {
            [analysis, analysisTokens] = await analyzeFrequencyGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        } else {
            console.warn(`[${new Date().toISOString()}] ${endpoint}: Unsupported API service requested: ${apiService}`);
            res.status(400).json({ error: `Unsupported API service: ${apiService}` });
            return;
        }

        console.log(`[${new Date().toISOString()}] ${endpoint}: Success from ${apiService}`, { tokenCount: analysisTokens });
        // Send successful response
        // The API response structure for frequency analysis might differ, adjust as needed
        // Assuming the handler returns the analysis text and token count directly for now
        res.status(200).json({
            analysis: { // Wrapping in an 'analysis' object for consistency, adjust if needed
                text: analysis,
                tokenCount: analysisTokens
            }
         });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in ${endpoint}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred during frequency analysis';
        // Send error response
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Generates a short dialogue using a word/expression with the selected AI service.
 * @route POST /generate/dialogue
 * @access Private (Requires authentication and active status via middleware)
 * @param {Request} req - Express request object. Body should contain { word, targetLanguage, nativeLanguage, apiService, llm }.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with the dialogue or error.
 */
export async function generateDialogue(req: Request, res: Response): Promise<void> {
    const endpoint = '/generate/dialogue'; // For logging context
    try {
        // Dialogue requires native language for translation in the prompt
        const { word, targetLanguage, nativeLanguage, apiService, llm } = validateGenerationParams(req, true);
        if (!nativeLanguage) { // Double check, though validate should throw
             throw new Error('Native language is required for dialogue generation but was not validated.');
        }

        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage); // Assuming mapping needed
        console.log(`[${new Date().toISOString()}] ${endpoint}: Validated params:`, { word, targetLanguage: targetLanguageFull, nativeLanguage: nativeLanguageFull, apiService, llm });

        let dialogue = '';
        let dialogueTokens = initializeTokenCount();

        console.log(`[${new Date().toISOString()}] ${endpoint}: Calling ${apiService} API...`);

        // Select the appropriate API handler
        if (apiService === 'anthropic') {
            [dialogue, dialogueTokens] = await getDialogueAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [dialogue, dialogueTokens] = await getDialogueOpenRouter(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'google') {
            [dialogue, dialogueTokens] = await getDialogueGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        } else {
            console.warn(`[${new Date().toISOString()}] ${endpoint}: Unsupported API service requested: ${apiService}`);
            res.status(400).json({ error: `Unsupported API service: ${apiService}` });
            return;
        }

        console.log(`[${new Date().toISOString()}] ${endpoint}: Success from ${apiService}`, { tokenCount: dialogueTokens });
        // Send successful response
        res.status(200).json({
            dialogue: {
                text: dialogue,
                tokenCount: dialogueTokens
            }
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in ${endpoint}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred generating dialogue';
        // Send error response
        res.status(500).json({ error: errorMessage });
    }
}
