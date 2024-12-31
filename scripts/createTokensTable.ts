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

// Function to create the 'user_tokens' table in the database.
const createTokensTable = async () => {
    // Get a client from the connection pool.
    const client = await pool.connect();

    try {
        // Execute a SQL query to create the 'user_tokens' table if it does not exist.
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique token record ID
                user_id UUID NOT NULL, -- Reference to the user
                input_tokens INTEGER NOT NULL DEFAULT 0, -- Number of input tokens consumed
                output_tokens INTEGER NOT NULL DEFAULT 0, -- Number of output tokens consumed
                total_tokens INTEGER NOT NULL DEFAULT 0, -- Total tokens consumed (input + output)
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of token usage
                tokens_context_id UUID NOT NULL, -- Reference to the token context
                FOREIGN KEY (user_id) REFERENCES users(id), -- Foreign key to users table
                FOREIGN KEY (tokens_context_id) REFERENCES tokens_context(id) -- Foreign key to tokens_context table
            );
        `);

        // Create index on user_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id
            ON user_tokens(user_id);
        `);

        // Create index on tokens_context_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_tokens_tokens_context_id
            ON user_tokens(tokens_context_id);
        `);

        // Create composite index on user_id and tokens_context_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id_tokens_context_id
            ON user_tokens(user_id, tokens_context_id);
        `);

        // Log a success message to the console.
        console.log('user_tokens table and indexes created successfully!');
    } catch (error) {
        // Log an error message to the console if there is an issue creating the table.
        console.error('Error creating user_tokens table:', error);
    } finally {
        // Release the client back to the connection pool.
        client.release();
        // End the connection pool.
        await pool.end();
    }
};

// Execute the function to create the table.
createTokensTable();
