/**
 * @fileoverview Defines the Express router for user-related endpoints.
 * All routes defined in this file are prefixed with `/user` (in expressServer.ts)
 * and require authentication and an active user status via middlewares applied here.
 */
import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserSettings,
    updateUserSettings
} from '../controllers/userController';
import { authenticateToken, isActiveUser } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes in this router.
// Ensures that a valid JWT access token is present and verified.
router.use(authenticateToken);

// Apply active user check middleware to all routes in this router.
// Ensures the user associated with the token has an 'active' status in the database.
router.use(isActiveUser);

// --- Define User Routes ---

// GET /user - Get the authenticated user's profile information.
router.get('/', getUserProfile);

// PUT /user/profile - Update the authenticated user's profile (username, email).
router.put('/profile', updateUserProfile);

// POST /user/change-password - Change the authenticated user's password.
router.post('/change-password', changePassword);

// GET /user/settings - Get the authenticated user's application settings.
router.get('/settings', getUserSettings);

// PUT /user/settings - Update (or create) the authenticated user's application settings.
router.put('/settings', updateUserSettings);

export default router;
