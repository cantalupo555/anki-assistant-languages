// Import necessary dependencies and utility functions
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser'; // Added cookie-parser
import cors from 'cors';
import crypto from 'crypto'; // Added crypto for hashing refresh tokens
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid'; // Added for generating token family UUIDs

// Import utilities
import { getFullLanguageName } from '../frontend/src/utils/languageMapping';
import { supportedLanguageCodes, supportedAPIServices, supportedTTSServices } from './shared/constants';

// Import API handlers
import { 
    analyzeFrequencyAnthropicClaude, 
    getDefinitionsAnthropicClaude, 
    getDialogueAnthropicClaude, 
    getSentencesAnthropicClaude, 
    translateSentenceAnthropicClaude 
} from './anthropicClaude';
import { 
    analyzeFrequencyGoogleGemini, 
    getDefinitionsGoogleGemini, 
    getDialogueGoogleGemini, 
    getSentencesGoogleGemini, 
    translateSentenceGoogleGemini 
} from './googleGemini';
import { 
    analyzeFrequencyOpenRouter, 
    getDefinitionsOpenRouter, 
    getDialogueOpenRouter, 
    getSentencesOpenRouter, 
    translateSentenceOpenRouter 
} from './openRouter';

// Import middlewares
import { authenticateToken, isActiveUser } from './middlewares/authMiddleware';

// Import TTS handlers
import { textToSpeech as azureTextToSpeech } from './azureTTS';
import { textToSpeech as googleTextToSpeech } from './googleCloudTTS';

// Import type definitions and options
import { TokenCount } from '../frontend/src/utils/Types';
import { llmOptions } from '../frontend/src/utils/Options';

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
function validateRequestParams(req: Request, requireNativeLanguage = false): RequestParams {
    const { word, text, targetLanguage, language, nativeLanguage, apiService, llm } = req.body;

    // Debug log to check the request body
    console.log('Request body in validate:', req.body);

    const content = word || text;
    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new Error('Valid word or text is required');
    }

    // Accepts both targetLanguage and language
    const targetLang = targetLanguage || language;
    if (!targetLang || typeof targetLang !== 'string' || !supportedLanguages.includes(targetLang)) {
        throw new Error('Valid target language is required');
    }
    if (!apiService || !supportedAPIServices.includes(apiService)) {
        throw new Error(`Valid API service (${supportedAPIServices.join(', ')}) is required`);
    }
    if (!llm || typeof llm !== 'string') {
        throw new Error('Valid llm is required');
    }

    // Only validate nativeLanguage if required
    if (requireNativeLanguage && (!nativeLanguage || typeof nativeLanguage !== 'string' || !supportedLanguages.includes(nativeLanguage))) {
        throw new Error('Valid native language is required');
    }

    return { 
        word: content, 
        targetLanguage: targetLang, 
        nativeLanguage: nativeLanguage || '', // Allow undefined if not required
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

    if (!ttsService || !supportedTTSServices.includes(ttsService)) {
        throw new Error(`Valid TTS service (${supportedTTSServices.join(', ')}) is required`);
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
// app.use(cors()); // Remove default CORS middleware which defaults to '*' origin

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

// Enable CORS middleware - Ensure origin is specific and credentials allowed
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use specific origin
    credentials: true // Allow cookies to be sent cross-origin
}));
// Parse incoming JSON requests with increased size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Add cookie parser middleware
app.use(cookieParser());

// Import supported languages from shared constants
import { supportedLanguageCodes as supportedLanguages } from './shared/constants';

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
            `INSERT INTO users 
            (username, email, password_hash, status, role) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, username, email, status, role`,
            [username, email, hashedPassword, 'active', 'user']
        );

        // Validate default language codes
        if (!supportedLanguageCodes.includes('en-US')) {
            throw new Error('Invalid default language codes');
        }

        // Create default settings with explicit values
        await pool.query(`
            INSERT INTO user_settings 
            (user_id, preferred_language, theme, native_language, target_language, 
             selected_api_service, selected_tts_service, selected_llm, selected_voice)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) DO NOTHING; -- Prevents duplicate settings creation if user_id already exists
        `, [
            newUser.rows[0].id, // user_id
            'english', // preferred_language
            'light', // theme
            'en-US', // native_language
            'en-US', // target_language
            'openrouter', // selected_api_service
            'google', // selected_api_service
            'qwen/qwen-2.5-72b-instruct', // selected_llm
            'en-US-Wavenet-A' // selected_voice
        ]);

        // Generate tokens (Access + Refresh)
        const userId = newUser.rows[0].id;
        const userRole = newUser.rows[0].role; // Assuming role is returned
        const accessToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRATION_MS / 1000}s` }); // Use a different secret in production!

        // Store refresh token hash in DB
        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenFamily = uuidv4(); // Generate a new family UUID
        const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);

        await pool.query(
            `INSERT INTO user_sessions (user_id, token_hash, family, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, refreshTokenHash, refreshTokenFamily, refreshTokenExpiresAt, req.ip, req.headers['user-agent']]
        );

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // Explicitamente definido com base no NODE_ENV
            sameSite: 'lax' as const, // Manter 'lax' para desenvolvimento same-site
            path: '/',
            maxAge: REFRESH_TOKEN_EXPIRATION_MS
        };
        // Log detalhado incluindo status do NODE_ENV
        console.log(`[${new Date().toISOString()}] /register: NODE_ENV='${process.env.NODE_ENV}', isProduction=${isProduction}. Setting refreshToken cookie with options:`, cookieOptions); // Corrected log source

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Send access token and user data in response body
        res.status(201).json({
            message: 'User registered successfully',
            accessToken, // Send access token in body
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Error registering user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error registering user';
        res.status(500).json({ 
            error: errorMessage,
            details: error instanceof Error ? error.stack : undefined
        });
    }
});

// Login route
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Fetch user including status and role
        const user = await pool.query(
            'SELECT id, username, email, password_hash, status, role FROM users WHERE username = $1', 
            [username]
        );

        if (user.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const userData = user.rows[0];

        // Verify user status
        if (userData.status !== 'active') {
            res.status(403).json({ error: 'Your account is inactive' });
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, userData.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT token with user information
        // Update last login timestamp
        await pool.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [userData.id]
        );

        // Generate tokens (Access + Refresh)
        const accessToken = jwt.sign({ userId: userData.id, role: userData.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshTokenFamily = uuidv4(); // Generate a new family UUID for this login session
        // Include the family UUID in the refresh token payload to ensure uniqueness
        const refreshToken = jwt.sign(
            { userId: userData.id, role: userData.role, family: refreshTokenFamily }, // Add family here
            JWT_SECRET, 
            { expiresIn: `${REFRESH_TOKEN_EXPIRATION_MS / 1000}s` }
        ); 
        // Calculate the hash of the new refresh token
        const refreshTokenHash = hashToken(refreshToken); 

        const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);

        // Session cleanup removed to allow multiple active sessions per user.
        // The refresh token rotation mechanism handles invalidating used tokens.

        await pool.query(
            `INSERT INTO user_sessions (user_id, token_hash, family, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userData.id, refreshTokenHash, refreshTokenFamily, refreshTokenExpiresAt, req.ip, req.headers['user-agent']]
        );

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const, // Explicitly 'lax'
            path: '/',
            maxAge: REFRESH_TOKEN_EXPIRATION_MS
        };
        console.log(`[${new Date().toISOString()}] /login: Setting refreshToken cookie with options:`, cookieOptions); // Log options

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Send access token and user data in response body
        res.status(200).json({
            message: 'Login bem-sucedido',
            accessToken, // Send access token in body
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                status: userData.status
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error during login';
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
app.post('/logout', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const tokenHash = hashToken(refreshToken);
            // Invalidate the specific session (refresh token) in the database
            await pool.query(
                'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND revoked_at IS NULL',
                [tokenHash]
            );
        } catch (dbError) {
            console.error("Error invalidating session token during logout:", dbError);
            // Continue with clearing the cookie even if DB update fails
        }
    }

    // Clear the refresh token cookie
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0) // Set expiry to past date
    });

    res.status(200).json({ message: 'Logout successful' });
});

// Route to validate JWT access token (remains mostly the same, validates token from Authorization header)
// Note: This route might become less necessary if frontend relies more on refresh flow.
app.post('/auth/validate', authenticateToken, (req: Request, res: Response) => {
    // The authenticateToken middleware already validates the access token.
    // If it reaches here, the token is valid (though maybe expired if not checked by middleware).
    // We can return the user info attached by the middleware.
    const user = (req as any).user;
    if (user) {
        res.status(200).json({ isValid: true, user });
    } else {
        // Should not happen if authenticateToken is working correctly
        res.status(401).json({ isValid: false, error: 'Invalid token or user not found' });
    }
});


// Route to refresh JWT access token using the refresh token from the HttpOnly cookie
app.post('/auth/refresh', async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    const allCookies = req.cookies;
    const cookieHeader = req.headers.cookie;
    console.log(`[${new Date().toISOString()}] /auth/refresh: Received request.`); // Log entry
    console.log(`[${new Date().toISOString()}] /auth/refresh: Cookie Header:`, cookieHeader); // Log raw cookie header
    console.log(`[${new Date().toISOString()}] /auth/refresh: Parsed Cookies (req.cookies):`, allCookies); // Log parsed cookies

    if (!incomingRefreshToken) {
        console.log(`[${new Date().toISOString()}] /auth/refresh: No refreshToken cookie found in parsed cookies.`);
        // Adicional: Logar se o cookie-parser está funcionando
        if (!req.cookies) {
             console.log(`[${new Date().toISOString()}] /auth/refresh: req.cookies object is missing. Is cookie-parser middleware active?`);
        }
        return res.status(401).json({ error: 'Refresh token not found' });
    } else {
         console.log(`[${new Date().toISOString()}] /auth/refresh: refreshToken cookie found in parsed cookies (length: ${incomingRefreshToken.length}).`);
    }

    const incomingTokenHash = hashToken(incomingRefreshToken);
    console.log(`[${new Date().toISOString()}] /auth/refresh: Calculated hash: ${incomingTokenHash.substring(0, 10)}...`);

    try {
        // Find the session (refresh token) in the database
        const tokenResult = await pool.query(
            `SELECT id, user_id, family, expires_at, revoked_at
             FROM user_sessions
             WHERE token_hash = $1`,
            [incomingTokenHash]
        );

        const storedToken = tokenResult.rows[0];
        console.log(`[${new Date().toISOString()}] /auth/refresh: DB query result for hash ${incomingTokenHash.substring(0, 10)}... :`, storedToken);

        // Case 1: Token not found or already revoked
        if (!storedToken) {
             console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash not found in DB.`);
             // Clear the cookie on the client
             res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
             return res.status(401).json({ error: 'Invalid session' }); // Use 401 for not found
        }

        if (storedToken.revoked_at) {
             console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash found but session is revoked (revoked_at: ${storedToken.revoked_at}).`);
             // Potential token theft detected if a revoked token is used. Invalidate the entire session family.
             if (storedToken?.family) {
                 await pool.query(
                     'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE family = $1 AND revoked_at IS NULL',
                     [storedToken.family]
                 );
             }
             // Clear the cookie on the client
             res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
             return res.status(403).json({ error: 'Session revoked' }); // Use 403 for revoked
        }

        // Case 2: Token expired
        const expiresAt = new Date(storedToken.expires_at);
        const now = new Date();
        if (expiresAt < now) {
            console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash found but session expired (expires_at: ${expiresAt.toISOString()}, now: ${now.toISOString()}).`);
            // Clear the cookie on the client
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(403).json({ error: 'Session expired' }); // Use 403 for expired
        }

        // --- Token is valid, proceed with rotation ---
        console.log(`[${new Date().toISOString()}] /auth/refresh: Token is valid. Proceeding with rotation for user ${storedToken.user_id}, family ${storedToken.family}.`);

        // Get user info
        // Fetch comprehensive user details
        const userResult = await pool.query(
            'SELECT id, username, email, role, status FROM users WHERE id = $1', 
            [storedToken.user_id]
        );
        if (userResult.rows.length === 0) {
            console.error(`[${new Date().toISOString()}] /auth/refresh: User not found in DB for user_id ${storedToken.user_id} associated with token family ${storedToken.family}.`);
            // Invalidate the potentially compromised token family
            await pool.query(
                'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE family = $1 AND revoked_at IS NULL',
                [storedToken.family]
            );
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(404).json({ error: 'User associated with token not found' });
        }
        const user = userResult.rows[0]; // Contains id, username, email, role, status

        // Generate new tokens
        const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const newRefreshToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRATION_MS / 1000}s` }); // Use a different secret in production!
        const newRefreshTokenHash = hashToken(newRefreshToken);
        const newRefreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);

        // Update the database: Revoke the old token and insert the new one within a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Revoke the used session token
            await client.query(
                'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1',
                [storedToken.id]
            );
            // Insert the new session token (same family)
            await client.query(
                `INSERT INTO user_sessions (user_id, token_hash, family, expires_at, ip_address, user_agent)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [user.id, newRefreshTokenHash, storedToken.family, newRefreshTokenExpiresAt, req.ip, req.headers['user-agent']]
            );
            await client.query('COMMIT');
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error("Error during refresh token rotation:", dbError);
            return res.status(500).json({ error: 'Database error during token rotation' });
        } finally {
            client.release();
        }

        // Set the new refresh token in the HttpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: REFRESH_TOKEN_EXPIRATION_MS
        });

        // Send the new access token and full user details in the response body
        res.json({
            accessToken: newAccessToken,
            user: { // Return comprehensive user details
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status // Include status if needed by frontend
            }
        });
        console.log(`[${new Date().toISOString()}] /auth/refresh: Successfully rotated token for user ${user.id}, family ${storedToken.family}. Sent new accessToken and user data.`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] /auth/refresh: Error during token refresh process:`, error);
        res.status(500).json({ error: 'Error refreshing token' });
    }
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

        const updateResult = await pool.query(`
            UPDATE users 
            SET username = $1, 
                email = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, username, email
        `, [username, email, userId]);

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
        await pool.query(`
            UPDATE users 
            SET password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error changing password';
        res.status(500).json({ error: errorMessage });
    }
});

// Route to get user settings
app.get('/user/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const result = await pool.query(
            `SELECT 
                preferred_language,
                theme,
                native_language,
                target_language,
                selected_api_service,
                selected_tts_service,
                selected_llm,
                selected_voice
             FROM user_settings WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Settings not found' });
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Error fetching settings' });
    }
});

// Route to update user settings
app.put('/user/settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const {
            preferred_language,
            theme,
            native_language,
            target_language,
            selected_api_service,
            selected_tts_service,
            selected_llm,
            selected_voice
        } = req.body;

        // Validate service/llm combination
        const validLLMs = llmOptions[selected_api_service]?.map((llm: { value: string }) => llm.value) || [];
        if (!validLLMs.includes(selected_llm)) {
            res.status(400).json({ error: 'Invalid service and model combination' });
            return;
        }

        const result = await pool.query(`
            INSERT INTO user_settings 
                (user_id, preferred_language, theme, native_language, target_language, 
                 selected_api_service, selected_tts_service, selected_llm, selected_voice)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) DO UPDATE SET
                preferred_language = EXCLUDED.preferred_language,
                theme = EXCLUDED.theme,
                native_language = EXCLUDED.native_language,
                target_language = EXCLUDED.target_language,
                selected_api_service = EXCLUDED.selected_api_service,
                selected_tts_service = EXCLUDED.selected_tts_service,
                selected_llm = EXCLUDED.selected_llm,
                selected_voice = EXCLUDED.selected_voice
            RETURNING *
        `, [
            userId,
            preferred_language,
            theme,
            native_language,
            target_language,
            selected_api_service,
            selected_tts_service,
            selected_llm,
            selected_voice
        ]);

        res.json(result.rows[0]);
        return;
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Error updating settings' });
        return;
    }
});

/**
 * Route to generate word definitions.
 * @param req - Express request object.
 * @param res - Express response object.
 */
app.post('/generate/definitions', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { word, targetLanguage, apiService, llm } = validateRequestParams(req);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        console.log('Validated params:', { word, targetLanguageFull, apiService, llm }); // Debug log

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
app.post('/generate/sentences', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { word, targetLanguage, apiService, llm } = validateRequestParams(req);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        console.log('Validated params:', { word, targetLanguageFull, apiService, llm }); // Debug log

        let sentences = '';
        let sentencesTokens = initializeTokenCount();

        console.log(`Calling ${apiService} API for sentences...`);

        if (apiService === 'anthropic') {
            [sentences, sentencesTokens] = await getSentencesAnthropicClaude(word, targetLanguage, llm);
        } else if (apiService === 'openrouter') {
            [sentences, sentencesTokens] = await getSentencesOpenRouter(word, targetLanguage, llm);
        } else if (apiService === 'google') {
            [sentences, sentencesTokens] = await getSentencesGoogleGemini(word, targetLanguage, llm);
        }

        console.log('Sentences generated successfully:', {
            sentences: sentences.substring(0, 100) + '...', // Log the first 100 characters
            tokenCount: sentencesTokens
        });

        // Split sentences into an array
        const sentencesArray = sentences.split('\n').filter(sentence => sentence.trim() !== '');

        res.json({
            sentences: {
                text: sentencesArray,
                tokenCount: sentencesTokens,
                totalPages: Math.ceil(sentencesArray.length / 5)
            }
        });
    } catch (error) {
        console.error('Error in /generate/sentences:', error);
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

// Route to handle the translation request
app.post('/translate', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { word: content, targetLanguage, nativeLanguage, apiService, llm } = validateRequestParams(req, true);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage);

        console.log('Validated params:', {
            content,
            targetLanguage: targetLanguageFull,
            nativeLanguage: nativeLanguageFull,
            apiService,
            llm
        });

        let translation = '';
        let translationTokens = initializeTokenCount();

        console.log(`Calling ${apiService} API for translation...`);
        console.log('Translation parameters:', {
            content,
            targetLanguage: targetLanguageFull,
            nativeLanguage: nativeLanguageFull,
            llm
        });

        // Process the translation based on the selected API service
        if (apiService === 'anthropic') {
            [translation, translationTokens] = await translateSentenceAnthropicClaude(content, targetLanguage, nativeLanguageFull, llm);
        } else if (apiService === 'openrouter') {
            [translation, translationTokens] = await translateSentenceOpenRouter(content, targetLanguage, nativeLanguageFull, llm);
        } else if (apiService === 'google') {
            [translation, translationTokens] = await translateSentenceGoogleGemini(content, targetLanguage, nativeLanguageFull, llm);
        }

        console.log('Translation generated successfully:', {
            translation: translation.substring(0, 100) + '...',
            tokenCount: translationTokens
        });

        // Returns the translation and token count
        res.json({ 
            translation: { 
                text: translation, 
                tokenCount: translationTokens 
            } 
        });
    } catch (error) {
        console.error('Error in /translate:', error);
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

// Route to handle the generation of a dialogue
app.post('/generate/dialogue', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { word, targetLanguage, nativeLanguage, apiService, llm } = validateRequestParams(req, true);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage);

        console.log('Validated params:', {
            word,
            targetLanguage: targetLanguageFull,
            nativeLanguage: nativeLanguageFull,
            apiService,
            llm
        });

        let dialogue = '';
        let dialogueTokens = initializeTokenCount();

        console.log(`Calling ${apiService} API for dialogue...`);

        if (apiService === 'anthropic') {
            [dialogue, dialogueTokens] = await getDialogueAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [dialogue, dialogueTokens] = await getDialogueOpenRouter(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'google') {
            [dialogue, dialogueTokens] = await getDialogueGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        }

        console.log('Dialogue generated successfully:', {
            dialogue: dialogue.substring(0, 100) + '...',
            tokenCount: dialogueTokens
        });

        res.json({ 
            dialogue: {
                text: dialogue,
                tokenCount: dialogueTokens
            }
        });
    } catch (error) {
        console.error('Error in /generate/dialogue:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the request';

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

// Route to handle the word frequency analysis request
app.post('/analyze/frequency', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body); // Log request body
        const { word, targetLanguage, nativeLanguage, apiService, llm } = validateRequestParams(req, true);
        const targetLanguageFull = getFullLanguageName(targetLanguage);
        const nativeLanguageFull = getFullLanguageName(nativeLanguage);

        console.log('Validated params:', { // Log validated parameters
            word,
            targetLanguage: targetLanguageFull,
            nativeLanguage: nativeLanguageFull,
            apiService,
            llm
        });

        let analysis = '';
        let tokenCount: TokenCount = initializeTokenCount();

        console.log(`Calling ${apiService} API for frequency analysis...`); // Log indicating which API will be called

        if (apiService === 'anthropic') {
            [analysis, tokenCount] = await analyzeFrequencyAnthropicClaude(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'openrouter') {
            [analysis, tokenCount] = await analyzeFrequencyOpenRouter(word, targetLanguage, nativeLanguage, llm);
        } else if (apiService === 'google') {
            [analysis, tokenCount] = await analyzeFrequencyGoogleGemini(word, targetLanguage, nativeLanguage, llm);
        }

        console.log('Frequency analysis generated successfully:', { // Log the result
            analysis: analysis.substring(0, 100) + '...', // Show first 100 characters
            tokenCount
        });

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
app.post('/tts', authenticateToken, isActiveUser, async (req: Request, res: Response) => {
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

// Constants for token expiration (example values, adjust as needed)
const ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper function to hash refresh tokens
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
