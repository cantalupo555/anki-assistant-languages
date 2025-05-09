import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

// Import server configuration (Express app, pool, env vars, supportedLanguages)
import { app, PORT, supportedLanguages, supportedAPIServices, supportedTTSServices } from './config/serverConfig';

// Re-add middleware imports needed for remaining inline routes
import { authenticateToken, isActiveUser } from './middlewares/authMiddleware';

// Import type definitions
// import { TokenCount } from '../frontend/src/utils/Types'; // No longer used directly here
import { llmOptions } from './config/aiOptions';

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
// function initializeTokenCount(): TokenCount { // No longer used here
//     return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
// }

/**
 * Validates the `text` parameter.
 * @param text - Text to be validated.
 * @throws {Error} If the text is invalid.
 */

import authRoutes from './routes/authRoutes';
import optionsRoutes from './routes/optionsRoutes';
import userRoutes from './routes/userRoutes';
import generationRoutes from './routes/generationRoutes';
import ttsRoutes from './routes/ttsRoutes';
import tokenRoutes from './routes/tokenRoutes';

app.use('/auth', authRoutes);
app.use('/options', optionsRoutes);
app.use('/user', userRoutes);
app.use('/generate', generationRoutes);
app.use('/tts', ttsRoutes); 
app.use('/token', tokenRoutes); // Used

/**
 * Route to generate audio using TTS.
 * @param req - Express request object.
 * @param res - Express response object.
 */

// Add the error handling middleware
app.use(errorHandler);

// Constants for token expiration (example values, adjust as needed)
const ACCESS_TOKEN_EXPIRATION = '1m'; // 1 minute (for testing)
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper function to hash refresh tokens
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
