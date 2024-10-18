// Import necessary dependencies and utility functions
// express: Web framework for handling HTTP requests and responses
// cors: Middleware to enable Cross-Origin Resource Sharing (CORS)
import express from 'express';
import cors from 'cors';
import { getDefinitionsAnthropicClaude, getSentencesAnthropicClaude, translateSentenceAnthropicClaude, getDialogueAnthropicClaude, analyzeWordFrequencyAnthropicClaude } from './anthropicClaude';
import { getDefinitionsOpenRouter, getSentencesOpenRouter, translateSentenceOpenRouter, getDialogueOpenRouter, analyzeWordFrequencyOpenRouter } from './openRouter';
import { textToSpeech as googleTextToSpeech } from './googleCloudTTS';
import { textToSpeech as azureTextToSpeech } from './azureTTS';

// Create an Express application instance
const app = express();
// Get the port number from the environment variable 'PORT'
const port = process.env.PORT || 5000;

// Enable CORS middleware
app.use(cors());
// Parse incoming JSON requests with increased size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// List of supported languages
const supportedLanguages = ['english', 'italian', 'german', 'french', 'spanish', 'portuguese', 'dutch', 'polish', 'russian', 'mandarin', 'japanese', 'korean'];

// Route to handle the generation of definitions
app.post('/generate/definitions', async (req, res) => {
    try {
        // Get the word, target language, API service, and llm from the request body
        const { word, language: targetLanguage, apiService, llm } = req.body;
        // Validate the word, target language, API service, and llm
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid target language is required' });
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter')) {
            return res.status(400).json({ error: 'Valid API service (anthropic or openrouter) is required' });
        }
        if (!llm || typeof llm !== 'string') {
            return res.status(400).json({ error: 'Valid llm is required' });
        }

        let definitions = '';
        let definitionsTokens: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Get the definitions for the word using the selected API service and llm
        if (apiService === 'anthropic') {
            [definitions, definitionsTokens] = await getDefinitionsAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [definitions, definitionsTokens] = await getDefinitionsOpenRouter(word, targetLanguage, llm);
        }

        // Log the definitions result
        console.log('Definitions result:', definitions, definitionsTokens);

        // Return the result as a JSON response
        res.json({
            definitions: { text: definitions, tokenCount: definitionsTokens }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

// Route to handle the generation of sentences
app.post('/generate/sentences', async (req, res) => {
    try {
        // Get the word, target language, API service, and llm from the request body
        const { word, language: targetLanguage, apiService, llm } = req.body;
        // Validate the word, target language, API service, and llm
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid target language is required' });
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter')) {
            return res.status(400).json({ error: 'Valid API service (anthropic or openrouter) is required' });
        }
        if (!llm || typeof llm !== 'string') {
            return res.status(400).json({ error: 'Valid llm is required' });
        }

        let sentences = '';
        let sentencesTokens: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Get the sentences for the word using the selected API service and llm
        if (apiService === 'anthropic') {
            [sentences, sentencesTokens] = await getSentencesAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [sentences, sentencesTokens] = await getSentencesOpenRouter(word, targetLanguage, llm);
        }

        // Split sentences into an array
        const sentencesArray = sentences.split('\n').filter(sentence => sentence.trim() !== '');

        // Log the sentences result
        console.log('Sentences result:', sentencesArray, sentencesTokens);

        // Return the result as a JSON response
        res.json({
            sentences: {
                text: sentencesArray,
                tokenCount: sentencesTokens,
                totalPages: Math.ceil(sentencesArray.length / 5)
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

// Route to handle the translation request
app.post('/translate', async (req, res) => {
    try {
        const { text: inputSentence, targetLanguage, nativeLanguage, apiService, llm } = req.body;

        // Validate input
        if (!inputSentence || typeof inputSentence !== 'string' || inputSentence.trim() === '') {
            return res.status(400).json({ error: 'Valid input sentence is required' });
        }
        if (!nativeLanguage || !targetLanguage || !supportedLanguages.includes(nativeLanguage) || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid native and target languages are required' });
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter')) {
            return res.status(400).json({ error: 'Valid API service (anthropic or openrouter) is required' });
        }
        if (!llm || typeof llm !== 'string') {
            return res.status(400).json({ error: 'Valid llm is required' });
        }

        let translation = '';
        let tokenCount: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Perform translation using the selected API service and llm
        if (apiService === 'anthropic') {
            [translation, tokenCount] = await translateSentenceAnthropicClaude(inputSentence, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [translation, tokenCount] = await translateSentenceOpenRouter(inputSentence, targetLanguage, nativeLanguage, llm);
        }

        // Log the translation result
        console.log('Translation result:', translation, tokenCount);

        // Return the translated text and token count
        res.json({ translation, tokenCount });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the translation request' });
    }
});

// Route to handle the generation of a dialogue
app.post('/generate/dialogue', async (req, res) => {
    try {
        // Get the word, target language, native language, API service, and llm from the request body
        const { word, targetLanguage, nativeLanguage, apiService, llm } = req.body;
        // Validate the word, target language, native language, API service, and llm
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid target language is required' });
        }
        if (!nativeLanguage || typeof nativeLanguage !== 'string' || !supportedLanguages.includes(nativeLanguage)) {
            return res.status(400).json({ error: 'Valid native language is required' });
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter')) {
            return res.status(400).json({ error: 'Valid API service (anthropic or openrouter) is required' });
        }
        if (!llm || typeof llm !== 'string') {
            return res.status(400).json({ error: 'Valid llm is required' });
        }

        let dialogue = '';
        let tokenCount: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Create the dialogue using the selected API service and llm
        if (apiService === 'anthropic') {
            [dialogue, tokenCount] = await getDialogueAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [dialogue, tokenCount] = await getDialogueOpenRouter(word, targetLanguage, nativeLanguage, llm);
        }

        // Log the dialogue result
        console.log('Dialogue result:', dialogue, tokenCount);

        // Return the dialogue and token count
        res.json({ dialogue, tokenCount });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the dialogue request' });
    }
});

// Route to handle the word frequency analysis request
app.post('/analyze/frequency', async (req, res) => {
    try {
        const { word, targetLanguage, nativeLanguage, apiService, llm } = req.body;

        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!nativeLanguage || !targetLanguage || !supportedLanguages.includes(nativeLanguage) || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid native and target languages are required' });
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter')) {
            return res.status(400).json({ error: 'Valid API service (anthropic or openrouter) is required' });
        }
        if (!llm || typeof llm !== 'string') {
            return res.status(400).json({ error: 'Valid llm is required' });
        }

        let analysis = '';
        let tokenCount: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Perform analysis using the selected API service and llm
        if (apiService === 'anthropic') {
            [analysis, tokenCount] = await analyzeWordFrequencyAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [analysis, tokenCount] = await analyzeWordFrequencyOpenRouter(word, targetLanguage, nativeLanguage, llm);
        }

        // Log the frequency analysis result
        console.log('Frequency analysis result:', analysis, tokenCount);

        res.json({ analysis, tokenCount });
    } catch (error) {
        console.error('Error in /analyze/frequency:', error);
        res.status(500).json({ error: 'An error occurred while processing the frequency analysis request' });
    }
});

// Route to handle token sum
app.post('/token/sum', (req, res) => {
    try {
        const { definitionsTokens, sentencesTokens, translationTokens } = req.body;

        const totalTokenCount = {
            inputTokens: (definitionsTokens?.inputTokens || 0) + (sentencesTokens?.inputTokens || 0) + (translationTokens?.inputTokens || 0),
            outputTokens: (definitionsTokens?.outputTokens || 0) + (sentencesTokens?.outputTokens || 0) + (translationTokens?.outputTokens || 0),
            totalTokens: (definitionsTokens?.totalTokens || 0) + (sentencesTokens?.totalTokens || 0) + (translationTokens?.totalTokens || 0)
        };

        res.json(totalTokenCount);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

// Route to handle TTS requests
app.post('/tts', async (req, res) => {
    try {
        // Get the text, voice, language code, and TTS service from the request body
        const { text, voice, languageCode, ttsService } = req.body;

        // Validate the text, voice, language code, and TTS service
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Valid text is required' });
        }
        if (!voice || typeof voice !== 'string') {
            return res.status(400).json({ error: 'Valid voice is required' });
        }
        if (!languageCode || typeof languageCode !== 'string') {
            return res.status(400).json({ error: 'Valid language code is required' });
        }
        if (!ttsService || (ttsService !== 'google' && ttsService !== 'azure')) {
            return res.status(400).json({ error: 'Valid TTS service (google or azure) is required' });
        }

        let audioBuffer;

        if (ttsService === 'google') {
            // Google Cloud TTS
            // Check for supported language codes for Google Cloud TTS
            if (!['en-US', 'it-IT', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'nl-NL', 'pl-PL', 'ru-RU', 'cmn-CN', 'ja-JP', 'ko-KR'].includes(languageCode)) {
                return res.status(400).json({ error: 'Invalid language code for Google Cloud TTS' });
            }
            // Check if the voice matches the language code for Google Cloud TTS
            if (!voice.startsWith(languageCode)) {
                return res.status(400).json({ error: 'Voice does not match the language code for Google Cloud TTS' });
            }
            audioBuffer = await googleTextToSpeech(text, voice, languageCode);
        } else {
            // Azure TTS
            // Check for supported language codes for Azure TTS
            if (!['en-US', 'it-IT', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'nl-NL', 'pl-PL', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR'].includes(languageCode)) {
                return res.status(400).json({ error: 'Invalid language code for Azure TTS' });
            }
            // Check if the voice matches the language code for Azure TTS
            if (!voice.startsWith(languageCode)) {
                return res.status(400).json({ error: 'Voice does not match the language code for Azure TTS' });
            }
            audioBuffer = await azureTextToSpeech(text, voice, languageCode);
        }

        // Set the response content type to audio/wav
        res.set('Content-Type', 'audio/wav');

        // Send the audio buffer as the response
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the TTS request' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
