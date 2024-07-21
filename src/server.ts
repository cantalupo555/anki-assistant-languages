import express from 'express';
import cors from 'cors';
import { getDefinitionsWithTokens, getSentencesWithTokens } from './claude';

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

        // Get the definitions and sentences for the word
        const [definitions, definitionsTokens] = await getDefinitionsWithTokens(word);
        const [sentences, sentencesTokens] = await getSentencesWithTokens(word);

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

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
