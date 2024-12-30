// Import necessary dependencies and utility functions
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { TokenCount } from '../frontend/src/utils/Types';
import { getDefinitionsAnthropicClaude, getSentencesAnthropicClaude, translateSentenceAnthropicClaude, getDialogueAnthropicClaude, analyzeFrequencyAnthropicClaude } from './anthropicClaude';
import { getDefinitionsGoogleGemini, getSentencesGoogleGemini, translateSentenceGoogleGemini, getDialogueGoogleGemini, analyzeFrequencyGoogleGemini } from './googleGemini';
import { getDefinitionsOpenRouter, getSentencesOpenRouter, translateSentenceOpenRouter, getDialogueOpenRouter, analyzeFrequencyOpenRouter } from './openRouter';
import { textToSpeech as googleTextToSpeech } from './googleCloudTTS';
import { textToSpeech as azureTextToSpeech } from './azureTTS';
import { authenticateToken } from './middlewares/authMiddleware';

interface RequestParams {
    word: string;
    targetLanguage: string;
    nativeLanguage: string;
    apiService: string;
    llm: string;
}

/**
 * Validates and extracts common parameters from the request.
 * @param req - Express request object.
 * @returns Validated parameters.
 * @throws {Error} If any parameter is invalid.
 */
function validateRequestParams(req: Request): RequestParams {
    const { word, language, nativeLanguage, apiService, llm } = req.body;
    const targetLanguage = language; // Map 'language' to 'targetLanguage'
    console.log('Received targetLanguage:', targetLanguage); // Debug log

    if (!word || typeof word !== 'string' || word.trim() === '') {
        throw new Error('Valid word is required');
    }
    if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
        throw new Error('Valid target language is required');
    }
    if (!apiService || !['anthropic', 'openrouter', 'google'].includes(apiService)) {
        throw new Error('Valid API service (anthropic, openrouter, or google) is required');
    }
    if (!llm || typeof llm !== 'string') {
        throw new Error('Valid llm is required');
    }
    if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
        console.error('Invalid target language:', targetLanguage); // Additional debug log
        throw new Error('Valid target language is required');
    }
    if (!nativeLanguage || typeof nativeLanguage !== 'string' || !supportedLanguages.includes(nativeLanguage)) {
        throw new Error('Valid native language is required');
    }

    return { 
        word, 
        targetLanguage, 
        nativeLanguage, 
        apiService, 
        llm 
    };
}

/**
 * Validates parameters related to TTS.
 * @param ttsService - TTS service (google or azure).
 * @param languageCode - Supported language code.
 * @param voice - Selected voice.
 * @throws {Error} If any parameter is invalid.
 */
function validateTTSParams(ttsService: string, languageCode: string, voice: string): void {
    const supportedLanguageCodes = ['en-US', 'it-IT', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'nl-NL', 'pl-PL', 'ru-RU', 'cmn-CN', 'ja-JP', 'ko-KR'];

    if (!ttsService || !['google', 'azure'].includes(ttsService)) {
        throw new Error('Valid TTS service (google or azure) is required');
    }
    if (!languageCode || !supportedLanguageCodes.includes(languageCode)) {
        throw new Error('Invalid language code');
    }
    if (!voice || !voice.startsWith(languageCode)) {
        throw new Error('Voice does not match the language code');
    }
}

/**
 * Middleware for error handling.
 * @param err - Captured error.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Function to pass control to the next middleware.
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'An error occurred while processing the request' });
}

/**
 * Initializes a `TokenCount` object with default values.
 * @returns Initialized `TokenCount` object.
 */
function initializeTokenCount(): TokenCount {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

/**
 * Validates the `text` parameter.
 * @param text - Text to be validated.
 * @throws {Error} If the text is invalid.
 */
function validateText(text: string): void {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Valid text is required');
    }
}

// Create an Express application instance
const app = express();
app.use(cors()); // Enable CORS middleware
// Get the port number from the environment variable 'PORT'
const port = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET; // Use a strong secret key
if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set. Exiting.');
    process.exit(1);
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Enable CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Parse incoming JSON requests with increased size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// List of supported languages with updated language names
const supportedLanguages = [
    'English (United States)',
    'Italian (Italy)',
    'German (Germany)',
    'French (France)',
    'Spanish (Spain)',
    'Portuguese (Brazil)',
    'Dutch (Netherlands)',
    'Polish (Poland)',
    'Russian (Russia)',
    'Mandarin (China)',
    'Japanese (Japan)',
    'Korean (Korea)'
];

// Registration route
app.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email' });
            return;
        }

        // Check if user or email already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            res.status(409).json({ error: 'User or email already registered' });
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({ error: 'Password must be at least 8 characters' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );
        const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error registering user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error registering user';
        res.status(500).json({ error: errorMessage });
    }
});

// Login route
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error logging in';
        res.status(500).json({ error: errorMessage });
    }
});

// Protected route
app.get('/user', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error fetching user';
        res.status(500).json({ error: errorMessage });
    }
});

// Logout route
app.post('/logout', authenticateToken, (_req: Request, res: Response) => {
    // Invalidate the token on the client side by removing it from storage
    res.status(200).json({ message: 'Logout successful' });
});

app.put('/user/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { username, email } = req.body;

        // Validations
        if (!username || !email) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const updateResult = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email',
            [username, email, userId]
        );

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error updating profile';
        res.status(500).json({ error: errorMessage });
    }
});

app.post('/user/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { currentPassword, newPassword } = req.body;

        // Fetch current user
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }

        // Validate new password
        if (newPassword.length < 8) {
            res.status(400).json({ error: 'New password must be at least 8 characters' });
            return;
        }

        // Update password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error changing password';
        res.status(500).json({ error: errorMessage });
    }
});

/**
 * Route to generate word definitions.
 * @param req - Express request object.
 * @param res - Express response object.
 */
app.post('/generate/definitions', authenticateToken, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { word, targetLanguage, apiService, llm } = validateRequestParams(req);
        console.log('Validated params:', { word, targetLanguage, apiService, llm }); // Debug log

        let definitions = '';
        let definitionsTokens = initializeTokenCount();

        console.log(`Calling ${apiService} API for definitions...`);
        
        if (apiService === 'anthropic') {
            [definitions, definitionsTokens] = await getDefinitionsAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [definitions, definitionsTokens] = await getDefinitionsOpenRouter(word, targetLanguage, llm);
        } else if (apiService === 'google') {
            [definitions, definitionsTokens] = await getDefinitionsGoogleGemini(word, targetLanguage, llm);
        }

        console.log('Definitions generated successfully:', {
            definitions: definitions.substring(0, 100) + '...', // Log the first 100 characters
            tokenCount: definitionsTokens
        });

        res.json({ definitions: { text: definitions, tokenCount: definitionsTokens } });
    } catch (error) {
        console.error('Error in /generate/definitions:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the request';
        
        // Log detailed error information
        console.error('Error details:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : 'No stack trace available'
        });
        
        res.status(500).json({ 
            error: errorMessage,
            details: 'Check server logs for more information'
        });
    }
});

// Route to handle the generation of sentences
app.post('/generate/sentences', authenticateToken, async (req: Request, res: Response) => {
    try {
        // Get the word, target language, API service, and llm from the request body
        const { word, language: targetLanguage, apiService, llm } = req.body;
        // Validate the word, target language, API service, and llm
        if (!word || typeof word !== 'string' || word.trim() === '') {
            res.status(400).json({ error: 'Valid word is required' });
            return;
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            res.status(400).json({ error: 'Valid target language is required' });
            return;
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter' && apiService !== 'google')) {
            res.status(400).json({ error: 'Valid API service (anthropic, openrouter, or google) is required' });
            return;
        }
        if (!llm || typeof llm !== 'string') {
            res.status(400).json({ error: 'Valid llm is required' });
            return;
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
        } else if (apiService === 'google') {
             [sentences, sentencesTokens] = await getSentencesGoogleGemini(word, targetLanguage, llm);
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
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the request';
        res.status(500).json({ error: errorMessage });
    }
});

// Route to handle the translation request
app.post('/translate', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { text: inputSentence, targetLanguage, nativeLanguage, apiService, llm } = req.body;

        // Validate input
        if (!inputSentence || typeof inputSentence !== 'string' || inputSentence.trim() === '') {
            res.status(400).json({ error: 'Valid input sentence is required' });
            return;
        }
        if (!nativeLanguage || !targetLanguage || !supportedLanguages.includes(nativeLanguage) || !supportedLanguages.includes(targetLanguage)) {
            res.status(400).json({ error: 'Valid native and target languages are required' });
            return;
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter' && apiService !== 'google')) {
            res.status(400).json({ error: 'Valid API service (anthropic, openrouter, or google) is required' });
            return;
        }
        if (!llm || typeof llm !== 'string') {
            res.status(400).json({ error: 'Valid llm is required' });
            return;
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
        } else if (apiService === 'google') {
            [translation, tokenCount] = await translateSentenceGoogleGemini(inputSentence, targetLanguage, nativeLanguage, llm);
        }

        // Log the translation result
        console.log('Translation result:', translation, tokenCount);

        // Return the translated text and token count
        res.json({ translation, tokenCount });
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the translation request';
        res.status(500).json({ error: errorMessage });
    }
});

// Route to handle the generation of a dialogue
app.post('/generate/dialogue', authenticateToken, async (req: Request, res: Response) => {
    try {
        // Get the word, target language, native language, API service, and llm from the request body
        const { word, targetLanguage, nativeLanguage, apiService, llm } = req.body;
        // Validate the word, target language, native language, API service, and llm
        if (!word || typeof word !== 'string' || word.trim() === '') {
            res.status(400).json({ error: 'Valid word is required' });
            return;
        }
        if (!targetLanguage || typeof targetLanguage !== 'string' || !supportedLanguages.includes(targetLanguage)) {
            res.status(400).json({ error: 'Valid target language is required' });
            return;
        }
        if (!nativeLanguage || typeof nativeLanguage !== 'string' || !supportedLanguages.includes(nativeLanguage)) {
            res.status(400).json({ error: 'Valid native language is required' });
            return;
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter' && apiService !== 'google')) {
            res.status(400).json({ error: 'Valid API service (anthropic, openrouter, or google) is required' });
            return;
        }
        if (!llm || typeof llm !== 'string') {
            res.status(400).json({ error: 'Valid llm is required' });
            return;
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
        } else if (apiService === 'google') {
            [dialogue, tokenCount] = await getDialogueGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        }

        // Log the dialogue result
        console.log('Dialogue result:', dialogue, tokenCount);

        // Return the dialogue and token count
        res.json({ dialogue, tokenCount });
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the dialogue request';
        res.status(500).json({ error: errorMessage });
    }
});

// Route to handle the word frequency analysis request
app.post('/analyze/frequency', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { word, targetLanguage, nativeLanguage, apiService, llm } = req.body;

        if (!word || typeof word !== 'string' || word.trim() === '') {
            res.status(400).json({ error: 'Valid word is required' });
            return;
        }
        if (!nativeLanguage || !targetLanguage || !supportedLanguages.includes(nativeLanguage) || !supportedLanguages.includes(targetLanguage)) {
            res.status(400).json({ error: 'Valid native and target languages are required' });
            return;
        }
        if (!apiService || (apiService !== 'anthropic' && apiService !== 'openrouter' && apiService !== 'google')) {
            res.status(400).json({ error: 'Valid API service (anthropic, openrouter, or google) is required' });
            return;
        }
        if (!llm || typeof llm !== 'string') {
            res.status(400).json({ error: 'Valid llm is required' });
            return;
        }

        let analysis = '';
        let tokenCount: { inputTokens: number; outputTokens: number; totalTokens: number } = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        };

        // Perform analysis using the selected API service and llm
        if (apiService === 'anthropic') {
            [analysis, tokenCount] = await analyzeFrequencyAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [analysis, tokenCount] = await analyzeFrequencyOpenRouter(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'google') {
            [analysis, tokenCount] = await analyzeFrequencyGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        }

        // Log the frequency analysis result
        console.log('Frequency analysis result:', analysis, tokenCount);

        res.json({ analysis, tokenCount });
    } catch (error) {
        console.error('Error in /analyze/frequency:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the frequency analysis request';
        res.status(500).json({ error: errorMessage });
    }
});

// Route to handle token sum
app.post('/token/sum', authenticateToken, (req: Request, res: Response) => {
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
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the request';
        res.status(500).json({ error: errorMessage });
    }
});

/**
 * Route to generate audio using TTS.
 * @param req - Express request object.
 * @param res - Express response object.
 */
app.post('/tts', authenticateToken, async (req: Request, res: Response) => {
    const { text, voice, languageCode, ttsService } = req.body;

    validateText(text);
    validateTTSParams(ttsService, languageCode, voice);

    let audioBuffer;
    if (ttsService === 'google') {
        audioBuffer = await googleTextToSpeech(text, voice, languageCode);
    } else {
        audioBuffer = await azureTextToSpeech(text, voice, languageCode);
    }

    res.set('Content-Type', 'audio/wav');
    res.send(audioBuffer);
});

// Add the error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
