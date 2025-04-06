import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env file
dotenv.config();

/**
 * Create an Express application instance.
 */
export const app = express();

/**
 * Configure CORS to allow requests from the frontend URL.
 * Enables credentials (cookies, auth headers) to be sent cross-origin.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

/**
 * Configure JSON and URL-encoded parsers with increased size limits.
 * Allows the server to handle large payloads (e.g., AI responses, audio data).
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Enable cookie parsing middleware.
 * Required for handling refresh tokens stored in HttpOnly cookies.
 */
app.use(cookieParser());

/**
 * Initialize PostgreSQL connection pool.
 * Connection details are loaded from environment variables.
 */
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

/**
 * Load JWT secret key from environment variables.
 * This secret is used to sign and verify JWT tokens.
 */
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET not set. Exiting.');
  process.exit(1);
}

/**
 * Define the server port.
 * Defaults to 5000 if not specified in environment variables.
 */
export const PORT = process.env.PORT || 5000;

/**
 * Import the list of supported language codes and supported services.
 * Used for validation, language selection, and service selection throughout the app.
 */
import { supportedLanguageCodes as supportedLanguages, supportedAPIServices, supportedTTSServices } from '../shared/constants';

export { supportedLanguages, supportedAPIServices, supportedTTSServices };
