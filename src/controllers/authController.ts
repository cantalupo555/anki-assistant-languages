/**
 * Controller for authentication-related operations.
 * Handles user registration, login, refresh token, and logout.
 */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool, JWT_SECRET } from '../config/serverConfig';

// Constants for token expiration
const ACCESS_TOKEN_EXPIRATION = '1m'; // 1 minute (for testing)
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Registers a new user.
 * 
 * - Validates username, email, and password.
 * - Hashes the password with bcrypt.
 * - Inserts user and default settings into the database.
 * - Generates access and refresh tokens.
 * - Stores refresh token hash in the database.
 * - Sets refresh token as HttpOnly cookie.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns 201 with user info and access token on success
 * @throws 400, 409, 500 with error message on failure
 */
export async function registerUser(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;

        // Check if username, email, or password is missing
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email' });
            return;
        }

        // Check if user or email already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            res.status(409).json({ error: 'User or email already registered' });
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({ error: 'Password must be at least 8 characters' });
            return;
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        const newUser = await pool.query(
            `INSERT INTO users 
            (username, email, password_hash, status, role) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, username, email, status, role`,
            [username, email, hashedPassword, 'active', 'user']
        );

        // Insert default user settings
        await pool.query(`
            INSERT INTO user_settings 
            (user_id, preferred_language, theme, native_language, target_language, 
             selected_api_service, selected_tts_service, selected_llm, selected_voice)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) DO NOTHING;
        `, [
            newUser.rows[0].id,
            'english',
            'light',
            'en-US',
            'en-US',
            'openrouter',
            'google',
            'qwen/qwen-2.5-72b-instruct',
            'en-US-Wavenet-A'
        ]);

        // Generate access and refresh tokens
        const userId = newUser.rows[0].id;
        const userRole = newUser.rows[0].role;
        const accessToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRATION_MS / 1000}s` });

        // Hash the refresh token and store in database
        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenFamily = uuidv4();
        const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);

        await pool.query(
            `INSERT INTO user_sessions (user_id, token_hash, family, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, refreshTokenHash, refreshTokenFamily, refreshTokenExpiresAt, req.ip, req.headers['user-agent']]
        );

        // Set refresh token as HttpOnly cookie
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: REFRESH_TOKEN_EXPIRATION_MS
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Send response with access token and user info
        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Error registering user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error registering user';
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * Logs in an existing user.
 * 
 * - Validates username and password.
 * - Checks user status.
 * - Generates new access and refresh tokens.
 * - Stores refresh token hash in the database.
 * - Sets refresh token as HttpOnly cookie.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 with user info and access token on success
 * @throws 401, 403, 500 with error message on failure
 */
export async function loginUser(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        // Fetch user by username
        const user = await pool.query(
            'SELECT id, username, email, password_hash, status, role FROM users WHERE username = $1',
            [username]
        );

        // Check if user exists
        if (user.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const userData = user.rows[0];

        // Check if user is active
        if (userData.status !== 'active') {
            res.status(403).json({ error: 'Your account is inactive' });
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, userData.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Update last login timestamp
        await pool.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [userData.id]
        );

        // Generate access and refresh tokens
        const accessToken = jwt.sign({ userId: userData.id, role: userData.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshTokenFamily = uuidv4();
        const refreshToken = jwt.sign(
            { userId: userData.id, role: userData.role, family: refreshTokenFamily },
            JWT_SECRET,
            { expiresIn: `${REFRESH_TOKEN_EXPIRATION_MS / 1000}s` }
        );

        // Hash the refresh token and store in database
        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);

        await pool.query(
            `INSERT INTO user_sessions (user_id, token_hash, family, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userData.id, refreshTokenHash, refreshTokenFamily, refreshTokenExpiresAt, req.ip, req.headers['user-agent']]
        );

        // Set refresh token as HttpOnly cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            maxAge: REFRESH_TOKEN_EXPIRATION_MS
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Send response with access token and user info
        res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                status: userData.status
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error during login';
        res.status(500).json({ error: errorMessage });
    }
}

/**
 * Refreshes the access token using a valid refresh token cookie.
 * 
 * - Validates refresh token from cookie.
 * - Checks token hash in the database.
 * - Verifies token is not expired or revoked.
 * - Generates a new access token (without rotating refresh token).
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 with new access token and user info on success
 * @throws 401, 403, 404, 500 with error message on failure
 */
/**
 * Refreshes the access token using a valid refresh token cookie.
 * 
 * - Validates refresh token from cookie.
 * - Checks token hash in the database.
 * - Verifies token is not expired or revoked.
 * - Generates a new access token (without rotating refresh token).
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 with new access token and user info on success
 * @throws 401, 403, 404, 500 with error message on failure
 */
export async function refreshToken(req: Request, res: Response) {
    const incomingRefreshToken = req.cookies.refreshToken;
    const allCookies = req.cookies;
    const cookieHeader = req.headers.cookie;
    console.log(`[${new Date().toISOString()}] /auth/refresh: Received request.`); // Log entry
    console.log(`[${new Date().toISOString()}] /auth/refresh: Cookie Header:`, cookieHeader); // Log raw cookie header
    console.log(`[${new Date().toISOString()}] /auth/refresh: Parsed Cookies (req.cookies):`, allCookies); // Log parsed cookies

    // Check if refresh token cookie is present
    if (!incomingRefreshToken) {
        console.log(`[${new Date().toISOString()}] /auth/refresh: No refreshToken cookie found in parsed cookies.`);
        if (!req.cookies) {
            console.log(`[${new Date().toISOString()}] /auth/refresh: req.cookies object is missing. Is cookie-parser middleware active?`);
        }
        return res.status(401).json({ error: 'Refresh token not found' });
    } else {
        console.log(`[${new Date().toISOString()}] /auth/refresh: refreshToken cookie found in parsed cookies (length: ${incomingRefreshToken.length}).`);
    }

    // Hash the incoming refresh token
    const incomingTokenHash = hashToken(incomingRefreshToken);
    console.log(`[${new Date().toISOString()}] /auth/refresh: Calculated hash: ${incomingTokenHash.substring(0, 10)}...`);

    try {
        // Query the database for the refresh token hash
        const tokenResult = await pool.query(
            `SELECT id, user_id, family, expires_at, revoked_at
             FROM user_sessions
             WHERE token_hash = $1`,
            [incomingTokenHash]
        );

        const storedToken = tokenResult.rows[0];
        console.log(`[${new Date().toISOString()}] /auth/refresh: DB query result for hash ${incomingTokenHash.substring(0, 10)}... :`, storedToken);

        // Check if token exists
        if (!storedToken) {
            console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash not found in DB.`);
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Check if token is revoked
        if (storedToken.revoked_at) {
            console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash found but session is revoked (revoked_at: ${storedToken.revoked_at}).`);
            if (storedToken?.family) {
                await pool.query(
                    'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE family = $1 AND revoked_at IS NULL',
                    [storedToken.family]
                );
            }
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(403).json({ error: 'Session revoked (potential reuse detected)' });
        }

        // Check if token is expired
        const expiresAt = new Date(storedToken.expires_at);
        const now = new Date();
        if (expiresAt < now) {
            console.log(`[${new Date().toISOString()}] /auth/refresh: Token hash found but session expired (expires_at: ${expiresAt.toISOString()}, now: ${now.toISOString()}).`);
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(403).json({ error: 'Session expired' });
        }

        console.log(`[${new Date().toISOString()}] /auth/refresh: Token is valid. Proceeding WITHOUT rotation for user ${storedToken.user_id}, family ${storedToken.family}.`);

        // Fetch user info
        const userResult = await pool.query(
            'SELECT id, username, email, role, status FROM users WHERE id = $1',
            [storedToken.user_id]
        );
        if (userResult.rows.length === 0) {
            console.error(`[${new Date().toISOString()}] /auth/refresh: User not found in DB for user_id ${storedToken.user_id} associated with token ${storedToken.id}.`);
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
            return res.status(404).json({ error: 'User associated with token not found' });
        }
        const user = userResult.rows[0];

        // Generate a new access token
        const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1m' });

        // Send the new access token and user info
        res.json({
            accessToken: newAccessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
        console.log(`[${new Date().toISOString()}] /auth/refresh: Successfully refreshed access token for user ${user.id}. Refresh token was NOT rotated.`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] /auth/refresh: Error during token refresh process:`, error);
        res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
        res.status(500).json({ error: 'Error refreshing token' });
    }
}

/**
 * Logs out the user by revoking the refresh token and clearing the cookie.
 * 
 * - Retrieves the refresh token from the HttpOnly cookie.
 * - Hashes the refresh token and revokes the corresponding session in the database.
 * - Clears the refresh token cookie on the client.
 * - Handles errors gracefully and always clears the cookie.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 with success message on success, 500 with error message on failure
 */
export async function logoutUser(req: Request, res: Response) {
    try {
        // Retrieve refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                // Hash the refresh token
                const tokenHash = hashToken(refreshToken);
                // Revoke the refresh token in the database
                await pool.query(
                    'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND revoked_at IS NULL',
                    [tokenHash]
                );
            } catch (dbError) {
                console.error("Error invalidating session token during logout:", dbError);
            }
        }

        // Clear the refresh token cookie on the client
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0)
        });

        // Send success response
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Error during logout' });
    }
}
