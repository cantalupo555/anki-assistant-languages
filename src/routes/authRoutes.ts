/**
 * @fileOverview Defines the Express router for authentication-related endpoints.
 * All routes defined here are prefixed with `/auth` (in expressServer.ts).
 * Handles user registration, login, token refresh, logout, and token validation.
 * 
 * @dependencies
 * - express (Router): For creating and managing the router instance.
 * - ../controllers/authController: Provides the handler functions for each auth route.
 * - ../middlewares/authMiddleware (authenticateToken): Used to protect the /validate route.
 */
import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser, validateAccessToken } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// POST /auth/register - Register a new user.
router.post('/register', registerUser);

// POST /auth/login - Log in an existing user.
router.post('/login', loginUser);

// POST /auth/refresh - Refresh the access token using the refresh token cookie.
router.post('/refresh', refreshToken);

// POST /auth/logout - Log out the user by invalidating the session and clearing the cookie.
router.post('/logout', logoutUser);

// POST /auth/validate - Validate the current access token (requires authenticateToken middleware).
router.post('/validate', authenticateToken, validateAccessToken);

export default router;
