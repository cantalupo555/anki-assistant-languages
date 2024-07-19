import express from 'express';
import cors from 'cors';
import { getTranslationWithTokens, getDefinitionsWithTokens, getSentencesWithTokens } from './claude';

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS middleware
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Route to handle the word generation request
app.post('/generate', async (req, res) => {
    try {
        // Get the word from the request body
        const { word } = req.body;
        // Validate the word
        if (!word || typeof word !== 'string' || word.trim() === '') {
            return res.status(400).json({ error: 'Valid word is required' });
        }

        // Get the translation, definitions, and sentences for the word
        const [translation, translationTokens] = await getTranslationWithTokens(word);
        const [definitions, definitionsTokens] = await getDefinitionsWithTokens(word);
        const [sentences, sentencesTokens] = await getSentencesWithTokens(word);

        // Calculate the total token count
        const totalTokenCount = {
            inputTokens: translationTokens.inputTokens + definitionsTokens.inputTokens + sentencesTokens.inputTokens,
            outputTokens: translationTokens.outputTokens + definitionsTokens.outputTokens + sentencesTokens.outputTokens,
            totalTokens: translationTokens.totalTokens + definitionsTokens.totalTokens + sentencesTokens.totalTokens
        };

        // Split sentences into an array
        const sentencesArray = sentences.split('\n').filter(sentence => sentence.trim() !== '');

        // Return the result as a JSON response
        res.json({
            word,
            translation: { text: translation, tokenCount: translationTokens },
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
