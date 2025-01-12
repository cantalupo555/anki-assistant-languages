// Import necessary dependencies and utility functions
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// PostgreSQL pool configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable not configured. Exiting.');
    process.exit(1);
}

interface JwtPayload {
    userId: string;
    role: string;
}

/**
 * Middleware to authenticate JWT tokens
 * 
 * This middleware:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies the token using the JWT_SECRET
 * 3. Checks for required token payload (userId and role)
 * 4. Validates the user role against allowed roles
 * 5. Attaches user information to the request object
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const now = new Date();
    const utcTime = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    console.log(`[${utcTime}] authenticateToken: Starting token verification`);
    // Extract token from Authorization header (format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Return 401 if no token is provided
    if (!token) {
        res.status(401).json({ error: 'Authentication token not provided' });
        return;
    }

    // Verify the JWT token
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        // Handle invalid or expired tokens
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }

        // Validate token payload structure
        if (!decoded.userId || !decoded.role) {
            res.status(403).json({ error: 'Malformed token' });
            return;
        }
        const now = new Date();
        const utcTime = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        console.log(`[${utcTime}] authenticateToken: Token verified successfully`, decoded);

        // Attach user information to request object
        (req as any).user = {
            userId: decoded.userId,
            role: decoded.role
        };

        // Validate user role against allowed roles
        const allowedRoles = ['user', 'admin'];
        if (!allowedRoles.includes(decoded.role)) {
            res.status(403).json({ error: 'Unauthorized access' });
            return;
        }

        // Proceed to next middleware/route handler
        next();
    });
};

/**
 * Middleware to restrict access to admin users only
 * 
 * This middleware:
 * 1. Checks if the authenticated user has the 'admin' role
 * 2. Returns 403 Forbidden if user is not an admin
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    // Check if user has admin role
    if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access restricted to administrators' });
    }
    
    // Proceed to next middleware/route handler
    next();
};

/**
 * Middleware to verify if user account is active
 * 
 * This middleware:
 * 1. Checks the user's status in the database
 * 2. Returns 403 Forbidden if user is not active
 * 3. Handles database errors appropriately
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const isActiveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const now = new Date();
    const utcTime = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    console.log(`[${utcTime}] isActiveUser: Starting user status verification`);
    try {
        const userId = (req as any).user.userId;
        
        // Query database for user status
        const user = await pool.query(
            'SELECT id, status FROM users WHERE id = $1', 
            [userId]
        );

        // Check if user exists
        if (user.rows.length === 0) {
            res.status(404).json({ 
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Check if user is active
        if (user.rows[0].status !== 'active') {
            res.status(403).json({ 
                error: 'Your account is inactive. Please contact support.',
                code: 'USER_INACTIVE'
            });
            return;
        }

        // Attach user ID to request for easier access in routes
        (req as any).userId = user.rows[0].id;
        const now = new Date();
        const utcTime = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        console.log(`[${utcTime}] isActiveUser: User verified successfully`, user.rows[0]);
        next();
    } catch (error) {
        console.error('Error verifying user status:', error);
        res.status(500).json({ 
            error: 'Internal server error while verifying account status',
            code: 'SERVER_ERROR'
        });
    }
};
