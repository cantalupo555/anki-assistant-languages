/**
 * @fileOverview Controller for handling token calculation operations.
 * Contains the logic for the `/token/sum` route used to aggregate token usage from multiple sources.
 *
 * @dependencies
 * - express (Request, Response): For handling HTTP requests and responses.
 * - ../../frontend/src/utils/Types (TokenCount): Type definition for token count data.
 */
import { Request, Response } from 'express';
import { TokenCount } from '../../frontend/src/utils/Types';

/**
 * @description Calculates the total token usage from definitions, sentences, and translations.
 * Used by the frontend to display aggregated token usage statistics.
 *
 * @route POST /token/sum
 * @access Public (no middleware required)
 *
 * @param {Request} req - The Express request object containing definitionsTokens, sentencesTokens, translationTokens.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends the summed token count in the response.
 */
export async function calculateTokenSum(req: Request, res: Response): Promise<void> {
    try {
        const { definitionsTokens, sentencesTokens, translationTokens } = req.body;

        const totalTokenCount: TokenCount = {
            inputTokens: (definitionsTokens?.inputTokens || 0) + 
                         (sentencesTokens?.inputTokens || 0) + 
                         (translationTokens?.inputTokens || 0),
            outputTokens: (definitionsTokens?.outputTokens || 0) + 
                          (sentencesTokens?.outputTokens || 0) + 
                          (translationTokens?.outputTokens || 0),
            totalTokens: (definitionsTokens?.totalTokens || 0) + 
                         (sentencesTokens?.totalTokens || 0) + 
                         (translationTokens?.totalTokens || 0)
        };

        res.status(200).json(totalTokenCount);
    } catch (error) {
        console.error('Error calculating token sum:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error during token calculation';
        res.status(500).json({ error: errorMessage });
    }
}
