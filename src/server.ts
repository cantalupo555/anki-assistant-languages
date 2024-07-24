import express from 'express';
import cors from 'cors';
import { getDefinitionsWithTokens, getSentencesWithTokens } from './claude';
import { textToSpeech } from './googleCloudTTS'; // Import the TTS function

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS middleware
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// List of supported languages
const supportedLanguages = ['english', 'italian', 'german', 'french', 'spanish', 'portuguese', 'polish', 'dutch', 'russian', 'mandarin'];

// Route to handle the word generation request
app.post('/generate', async (req, res) => {
    try {
        // Get the word and language from the request body
        const { word, language } = req.body;
        // Validate the word and language
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }
        if (!language || typeof language !== 'string' || !supportedLanguages.includes(language)) {
            return res.status(400).json({ error: 'Valid language is required' });
        }

        // Get the definitions and sentences for the word
        const [definitions, definitionsTokens] = await getDefinitionsWithTokens(word, language);
        const [sentences, sentencesTokens] = await getSentencesWithTokens(word, language);

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

// New route to handle TTS requests
app.post('/tts', async (req, res) => {
    try {
        // Get the text and voice from the request body
        const { text, voice } = req.body;

        // Validate the text and voice
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Valid text is required' });
        }
        if (!voice || typeof voice !== 'string' || !['en-US-Journey-F', 'en-US-Journey-D', 'en-US-Journey-O'].includes(voice)) {
            return res.status(400).json({ error: 'Valid voice is required' });
        }

        // Generate the audio using the Google Cloud TTS API
        const audioBuffer = await textToSpeech(text, voice);

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
