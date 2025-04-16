/**
 * @fileOverview Controller functions for retrieving configuration options.
 * Provides endpoints to fetch available AI services, LLMs, TTS services, and voices,
 * typically used to populate frontend selection menus.
 * 
 * @dependencies
 * - express (Request, Response): For handling HTTP requests and responses.
 * - ../config/aiOptions: Source of AI service and LLM options.
 * - ../config/ttsOptions: Source of TTS service and voice options.
 */
import { Request, Response } from 'express';
import { apiServiceOptions, llmOptions } from '../config/aiOptions';
import { ttsOptions, voiceOptions } from '../config/ttsOptions';

/**
 * @description Retrieves the list of available AI service providers.
 * Sends a JSON response containing the `apiServiceOptions` array.
 * Handles potential errors during the process.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export function getApiServices(req: Request, res: Response): void {
    try {
        res.status(200).json(apiServiceOptions);
    } catch (error) {
        console.error("Error fetching API services:", error);
        res.status(500).json({ error: "Failed to fetch API services" });
    }
}

/**
 * @description Retrieves the mapping of AI service providers to their available LLM options.
 * Sends a JSON response containing the `llmOptions` object.
 * Handles potential errors during the process.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export function getLlmOptions(req: Request, res: Response): void {
    try {
        res.status(200).json(llmOptions);
    } catch (error) {
        console.error("Error fetching LLM options:", error);
        res.status(500).json({ error: "Failed to fetch LLM options" });
    }
}

/**
 * @description Retrieves the list of available Text-to-Speech (TTS) services.
 * Sends a JSON response containing the `ttsOptions` array.
 * Handles potential errors during the process.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export function getTtsServices(req: Request, res: Response): void {
    try {
        res.status(200).json(ttsOptions);
    } catch (error) {
        console.error("Error fetching TTS services:", error);
        res.status(500).json({ error: "Failed to fetch TTS services" });
    }
}

/**
 * @description Retrieves the complete list of available Text-to-Speech (TTS) voices.
 * Sends a JSON response containing the `voiceOptions` array.
 * Handles potential errors during the process.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export function getVoiceOptions(req: Request, res: Response): void {
    try {
        res.status(200).json(voiceOptions);
    } catch (error) {
        console.error("Error fetching voice options:", error);
        res.status(500).json({ error: "Failed to fetch voice options" });
    }
}
