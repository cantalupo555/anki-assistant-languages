/**
 * @fileOverview Controller functions for handling user-related operations,
 * including profile management, settings, and password changes.
 * All operations require user authentication and active status,
 * enforced by middlewares in the corresponding route file.
 * 
 * @dependencies
 * - express (Request, Response): For handling HTTP requests and responses.
 * - bcrypt: For hashing new passwords and comparing existing ones.
 * - ../config/serverConfig (pool): For database access.
 * - ../config/aiOptions (llmOptions): For validating LLM selection in settings updates.
 */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/serverConfig'; // Import pool from serverConfig
import { llmOptions } from '../config/aiOptions'; // Import llmOptions for validation
// TODO: Import voiceOptions from '../config/ttsOptions' when voice validation is implemented

// --- Helper Types (Consider moving to a shared types file, e.g., src/shared/types.ts) ---
interface UserSettings {
    preferred_language: string;
    theme: string;
    native_language: string;
    target_language: string;
    selected_api_service: string;
    selected_tts_service: string;
    selected_llm: string;
    selected_voice: string;
}

// --- Controller Functions ---

/**
 * @description Fetches the basic profile information (id, username, email, role, status) for the authenticated user.
 *              The user ID is extracted from the JWT token payload attached by the `authenticateToken` middleware.
 * @route GET /user
 * @access Private (Requires authentication via `authenticateToken` and `isActiveUser` middlewares)
 * @param {Request} req - Express request object, expects `req.user.userId` to be populated.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with user profile data or an error status.
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
    try {
        // User ID is attached by authenticateToken middleware
        const userId = (req as any).user.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const user = await pool.query('SELECT id, username, email, role, status FROM users WHERE id = $1', [userId]);

        if (user.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error fetching user profile';
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Updates the username and/or email for the authenticated user.
 *              Validates input and checks for conflicts with existing users.
 * @route PUT /user/profile
 * @access Private (Requires authentication via `authenticateToken` and `isActiveUser` middlewares)
 * @param {Request} req - Express request object containing `username` and `email` in the body, and `req.user.userId`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the updated user profile data or an error status.
 * @throws {400} If username or email is missing.
 * @throws {409} If username or email is already taken by another user.
 * @throws {404} If the user to update is not found (should not typically happen if authenticated).
 * @throws {500} For database errors or other internal issues.
 */
export async function updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user.userId;
        const { username, email } = req.body;

        // Basic Validations
        if (!username || !email) {
            res.status(400).json({ error: 'Username and email are required' });
            return;
        }
        // Add more specific validations (email format, username format/length) if needed

        // Check if new username or email already exists for another user
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
            [username, email, userId]
        );
        if (existingUser.rows.length > 0) {
             res.status(409).json({ error: 'Username or email already taken by another user' });
             return;
        }


        const updateResult = await pool.query(`
            UPDATE users
            SET username = $1,
                email = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, username, email, role, status
        `, [username, email, userId]);

        if (updateResult.rowCount === 0) {
             res.status(404).json({ error: 'User not found for update' });
             return;
        }

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        // Check for unique constraint violation error (e.g., PostgreSQL error code 23505)
        if (error instanceof Error && (error as any).code === '23505') {
             res.status(409).json({ error: 'Username or email already exists.' });
        } else {
            const errorMessage = error instanceof Error ? error.message : 'Error updating profile';
            res.status(500).json({ error: errorMessage });
        }
    }
}

/**
 * @description Changes the password for the authenticated user after verifying the current password.
 * @route POST /user/change-password
 * @access Private (Requires authentication via `authenticateToken` and `isActiveUser` middlewares)
 * @param {Request} req - Express request object containing `currentPassword` and `newPassword` in the body, and `req.user.userId`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with a success message or an error status.
 * @throws {400} If passwords are missing, new password is too short, or current password is incorrect.
 * @throws {404} If the user is not found.
 * @throws {500} For database errors or other internal issues.
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new passwords are required' });
            return;
        }

        // Fetch current user's password hash
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const user = userResult.rows[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }

        // Validate new password strength (example: min 8 chars)
        if (newPassword.length < 8) {
            res.status(400).json({ error: 'New password must be at least 8 characters' });
            return;
        }

        // Hash and update password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateResult = await pool.query(`
            UPDATE users
            SET password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [hashedNewPassword, userId]);

         if (updateResult.rowCount === 0) {
             // Should not happen if user was found earlier, but good practice
             res.status(404).json({ error: 'User not found during password update' });
             return;
         }

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error changing password';
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * @description Fetches the application settings for the authenticated user from the `user_settings` table.
 * @route GET /user/settings
 * @access Private (Requires authentication via `authenticateToken` and `isActiveUser` middlewares)
 * @param {Request} req - Express request object, expects `req.user.userId` to be populated.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with user settings or a 404/500 error.
 */
export async function getUserSettings(req: Request, res: Response): Promise<void> {
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
            res.status(200).json(result.rows[0]);
        } else {
            // If no settings found, potentially return defaults or 404
            // Returning 404 might be better to let frontend handle defaults
            res.status(404).json({ error: 'Settings not found for this user' });
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Error fetching settings' });
    }
}

/**
 * @description Updates or creates (upserts) the application settings for the authenticated user in the `user_settings` table.
 *              Validates the incoming settings data, including LLM selection based on the chosen API service.
 * @route PUT /user/settings
 * @access Private (Requires authentication via `authenticateToken` and `isActiveUser` middlewares)
 * @param {Request} req - Express request object containing the `UserSettings` object in the body, and `req.user.userId`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the updated settings or an error status.
 * @throws {400} If settings data is invalid, missing required fields, or contains invalid combinations (e.g., LLM/service).
 * @throws {500} For database errors or other internal issues.
 */
export async function updateUserSettings(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user.userId;
        const settings: UserSettings = req.body;

        // --- Basic Validation ---
        if (!settings || typeof settings !== 'object') {
             res.status(400).json({ error: 'Invalid settings data format' });
             return;
        }

        const requiredFields: (keyof UserSettings)[] = [
            'preferred_language', 'theme', 'native_language', 'target_language',
            'selected_api_service', 'selected_tts_service', 'selected_llm', 'selected_voice'
        ];

        for (const field of requiredFields) {
            if (!(field in settings) || typeof settings[field] !== 'string' || settings[field].trim() === '') {
                 res.status(400).json({ error: `Missing or invalid required setting: ${field}` });
                 return;
            }
        }

        // --- Specific Value Validation ---
        // (Add more validations as needed for language codes, themes, etc.)

        // Validate service/llm combination using imported llmOptions
        const validLLMs = llmOptions[settings.selected_api_service]?.map((llm: { value: string }) => llm.value) || [];
        if (!validLLMs.includes(settings.selected_llm)) {
            res.status(400).json({ error: `Invalid LLM '${settings.selected_llm}' for service '${settings.selected_api_service}'` });
            return;
        }

        // TODO: Add validation for selected_voice based on selected_tts_service and target_language
        // This would require importing voiceOptions from config/ttsOptions.ts
        // Example:
        // import { voiceOptions } from '../config/ttsOptions';
        // const validVoices = voiceOptions.filter(v => v.ttsService === settings.selected_tts_service && v.languageCode === settings.target_language).map(v => v.value);
        // if (!validVoices.includes(settings.selected_voice)) {
        //     res.status(400).json({ error: `Invalid voice '${settings.selected_voice}' for TTS service '${settings.selected_tts_service}' and language '${settings.target_language}'` });
        //     return;
        // }


        // --- Database Operation ---
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
                selected_voice = EXCLUDED.selected_voice,
                updated_at = CURRENT_TIMESTAMP  -- Ensure updated_at is set on update
            RETURNING *
        `, [
            userId,
            settings.preferred_language,
            settings.theme,
            settings.native_language,
            settings.target_language,
            settings.selected_api_service,
            settings.selected_tts_service,
            settings.selected_llm,
            settings.selected_voice
        ]);

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Error updating settings' });
    }
}
