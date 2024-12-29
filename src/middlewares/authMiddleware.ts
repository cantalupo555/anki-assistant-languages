// Import necessary modules from the 'express' library for handling requests, responses, and middleware
import { Request, Response, NextFunction } from 'express';
// Import the 'jsonwebtoken' library for handling JSON Web Tokens (JWT)
import jwt from 'jsonwebtoken';

// Get the JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Check if the JWT_SECRET environment variable is set
if (!JWT_SECRET) {
    // If not set, log an error message and exit the process
    console.error('JWT_SECRET environment variable is not set. Exiting.');
    process.exit(1);
}

/**
 * Middleware function to authenticate requests using JWT.
 *
 * This middleware checks for a valid JWT in the Authorization header of the request.
 * If a valid token is found, it adds the user information to the request object.
 * If the token is missing or invalid, it sends an appropriate error response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Get the authorization header from the request
    const authHeader = req.headers['authorization'];
    // Extract the token from the authorization header (format: "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is found, send a 401 Unauthorized response
    if (token == null) {
        res.sendStatus(401);
        return;
    }

    // Verify the token using the JWT secret key
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        // If the token is invalid, send a 403 Forbidden response
        if (err) {
            res.sendStatus(403);
            return;
        }
        // If the token is valid, add the user information to the request object
        (req as any).user = user;
        // Call the next middleware function in the stack
        next();
    });
};
