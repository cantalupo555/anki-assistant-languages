import { Router } from 'express';
import {
    getApiServices,
    getLlmOptions,
    getTtsServices,
    getVoiceOptions
} from '../controllers/optionsController';

/**
 * @description Express router instance for handling configuration option related routes.
 * Mounts controller functions to specific GET endpoints under the `/options` path prefix.
 * @type {Router}
 */
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
