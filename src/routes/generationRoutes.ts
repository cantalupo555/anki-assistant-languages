/**
 * @fileOverview Defines the Express router for content generation endpoints.
 * All routes defined here are prefixed with `/generate` (in expressServer.ts)
 * and require authentication and an active user status via middlewares applied here.
 *
 * @dependencies
 * - express (Router): For creating and managing the router instance.
 * - ../controllers/generationController: Provides the handler functions for each generation route.
 * - ../middlewares/authMiddleware (authenticateToken, isActiveUser): Applied to all routes in this router.
 */
import { Router } from 'express';
import {
    generateDefinitions, generateSentences, generateDialogue,
    translateText, analyzeFrequency // Added translate/analyze controllers
} from '../controllers/generationController';
import { authenticateToken, isActiveUser } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication and active user check to all generation routes
router.use(authenticateToken);
router.use(isActiveUser);

// POST /generate/definitions - Generate definitions for a word
router.post('/definitions', generateDefinitions);

// POST /generate/sentences - Generate example sentences for a word
router.post('/sentences', generateSentences);

// POST /generate/dialogue - Generate a dialogue using a word/expression
router.post('/dialogue', generateDialogue);

// POST /generate/translate - Translate text
router.post('/translate', translateText); // Note: Path is /translate relative to /generate prefix

// POST /generate/frequency - Analyze word frequency
router.post('/frequency', analyzeFrequency); // Note: Path is /frequency relative to /generate prefix

export default router;
