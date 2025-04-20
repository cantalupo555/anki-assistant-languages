/**
 * @fileOverview Defines the Express router for Text-to-Speech (TTS) endpoints.
 * All routes defined here are prefixed with `/tts` (in expressServer.ts).
 * 
 * @dependencies
 * - express (Router): For creating and managing the router instance.
 * - ../controllers/ttsController: Provides the handler functions for TTS routes.
 * - ../middlewares/authMiddleware (authenticateToken, isActiveUser): Applied to routes requiring authentication and active status.
 */
import { Router } from 'express';
import { generateSpeech } from '../controllers/ttsController';
import { authenticateToken, isActiveUser } from '../middlewares/authMiddleware'; // Required middlewares

const router = Router();

// POST /tts - Generate audio from text (requires authentication and active user)
// Middlewares ensure that only authenticated and active users can generate audio
router.post('/', authenticateToken, isActiveUser, generateSpeech);

export default router;
