// Import necessary dependencies
// Client: Manages database connections
// dotenv: Loads environment variables from a .env file
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Function to create the tokens_context table
const createTokensContextTable = async () => {
    const client = await pool.connect();

    try {
        // Create the tokens_context table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tokens_context (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique context ID
                target_language VARCHAR(255), -- Target language for token usage
                api_service VARCHAR(255) -- API service used for token consumption
            );
        `);

        // Create index on target_language
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language
            ON tokens_context(target_language);
        `);

        // Create index on api_service
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_context_api_service
            ON tokens_context(api_service);
        `);

        // Create composite index on target_language and api_service
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language_api_service
            ON tokens_context(target_language, api_service);
        `);

        console.log('tokens_context table and indexes created successfully!');
    } catch (error) {
        console.error('Error creating tokens_context table:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function to create the table.
createTokensContextTable();
