import express from 'express';
import cors from 'cors';
import { getDefinitionsWithTokens, getSentencesWithTokens, translateSentence } from './anthropicClaude';
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

// Route to handle the generation request
app.post('/generate', async (req, res) => {
    try {
        // Get the word and target language from the request body
        const { word, language: targetLanguage } = req.body;
        // Validate the word and target language
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid target language is required' });
        }

        // Get the definitions and sentences for the word
        const [definitions, definitionsTokens] = await getDefinitionsWithTokens(word, targetLanguage);
        const [sentences, sentencesTokens] = await getSentencesWithTokens(word, targetLanguage);

        // Calculate the total token count
        const totalTokenCount = {
            inputTokens: definitionsTokens.inputTokens + sentencesTokens.inputTokens,
            outputTokens: definitionsTokens.outputTokens + sentencesTokens.outputTokens,
            totalTokens: definitionsTokens.totalTokens + sentencesTokens.totalTokens
        };

        // Split sentences into an array
        const sentencesArray = sentences.split('\n').filter(sentence => sentence.trim() !== '');

        // Return the result as a JSON response
        res.json({
            word,
            definitions: { text: definitions, tokenCount: definitionsTokens },
            sentences: {
                text: sentencesArray,
                tokenCount: sentencesTokens,
                totalPages: Math.ceil(sentencesArray.length / 5)
            },
            totalTokenCount
        });
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

// Route to handle the translation request
app.post('/translate', async (req, res) => {
    try {
        const { text: inputSentence, targetLanguage, nativeLanguage } = req.body;

        // Validate input
        if (!inputSentence || typeof inputSentence !== 'string' || inputSentence.trim() === '') {
            return res.status(400).json({ error: 'Valid input sentence is required' });
        }
        if (!nativeLanguage || !targetLanguage || !supportedLanguages.includes(nativeLanguage) || !supportedLanguages.includes(targetLanguage)) {
            return res.status(400).json({ error: 'Valid native and target languages are required' });
        }

        // Perform translation
        const translation = await translateSentence(inputSentence, targetLanguage, nativeLanguage);

        // Return the translated text
        res.json({ translation });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the translation request' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
