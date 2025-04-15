import { Router } from 'express';
// Import the new controller function and the middleware
import { registerUser, loginUser, refreshToken, logoutUser, validateAccessToken } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware'; // Import middleware

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
