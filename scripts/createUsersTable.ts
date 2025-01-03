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

// Function to create the users table
const createUsersTable = async () => {
    const client = await pool.connect();

    try {
        // Enable the pgcrypto extension
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Create the users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique user ID
                username VARCHAR(255) UNIQUE NOT NULL, -- User's unique username
                email VARCHAR(255) UNIQUE NOT NULL, -- User's unique email
                password_hash VARCHAR(255) NOT NULL, -- Hashed password for security
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of user creation
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last update
                role VARCHAR(50) DEFAULT 'user' -- User role (e.g., 'user', 'admin')
            );
        `);

        // Create index on role
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role
            ON users(role);
        `);

        // Create the function to update the updated_at field
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create the trigger to update the updated_at field
        await client.query(`
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('Users table, index on role, and trigger created successfully!');
    } catch (error) {
        console.error('Error creating users table, index on role, and trigger:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function
createUsersTable();
