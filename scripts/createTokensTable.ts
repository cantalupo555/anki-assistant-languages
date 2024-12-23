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
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                input_tokens INTEGER NOT NULL DEFAULT 0,
                output_tokens INTEGER NOT NULL DEFAULT 0,
                total_tokens INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                tokens_context_id UUID NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (tokens_context_id) REFERENCES tokens_context(id)
            );
        `);

        // Log a success message to the console.
        console.log('user_tokens table created successfully!');
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
