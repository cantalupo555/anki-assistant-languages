// Import necessary dependencies
// Pool: Manages database connections
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
        // Enable pgcrypto extension
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Check if users table exists
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist');
            process.exit(1);
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if tokens_context table already exists
        const tokensContextTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tokens_context');`);
        if (tokensContextTableRes.rows[0].exists) {
            console.log('Table tokens_context already exists');
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the tokens_context table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tokens_context (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique context ID
                target_language VARCHAR(255) CHECK (target_language ~ '^[A-Za-z ]+$'), -- Target language for token usage
                api_service VARCHAR(255) CHECK (api_service ~ '^[A-Za-z0-9_]+$') -- API service used for token consumption
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language ON tokens_context(target_language);
            CREATE INDEX IF NOT EXISTS idx_tokens_context_api_service ON tokens_context(api_service);
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language_api_service ON tokens_context(target_language, api_service);
        `);

        // Commit transaction
        await client.query('COMMIT');

        console.log('tokens_context table and indexes created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating tokens_context table:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function to create the table
createTokensContextTable();
