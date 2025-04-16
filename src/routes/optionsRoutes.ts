/**
 * @fileOverview Defines the Express router for configuration option endpoints.
 * All routes defined here are prefixed with `/options` (in expressServer.ts).
 * Provides GET endpoints to retrieve lists of available services and models.
 * 
 * @dependencies
 * - express (Router): For creating and managing the router instance.
 * - ../controllers/optionsController: Provides the handler functions for each options route.
 */
import { Router } from 'express';
import {
    getApiServices,
    getLlmOptions,
    getTtsServices,
    getVoiceOptions
} from '../controllers/optionsController';

const router = Router();

// GET /options/api-services: Returns the list of AI providers
router.get('/api-services', getApiServices);

// GET /options/llms: Returns the object of LLM options per provider
router.get('/llms', getLlmOptions);

// GET /options/tts-services: Returns the list of TTS services
router.get('/tts-services', getTtsServices);

// GET /options/voices: Returns the complete list of TTS voices
router.get('/voices', getVoiceOptions);

export default router;
