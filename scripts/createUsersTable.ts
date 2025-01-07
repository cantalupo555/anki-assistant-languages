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
        // Enable pgcrypto extension
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Start transaction
        await client.query('BEGIN');

        // Check if users table already exists
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (usersTableRes.rows[0].exists) {
            console.log('Table users already exists');
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique user ID
                username VARCHAR(255) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]+$'), -- Username with alphanumeric and underscore
                email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'), -- Valid email format
                password_hash VARCHAR(255) NOT NULL, -- Hashed password for security
                status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')), -- User status
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp with timezone
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp with timezone
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')) -- User role
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);

        // Create function to update the updated_at field
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create trigger to automatically update the updated_at field
        await client.query(`
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);

        // Commit transaction
        await client.query('COMMIT');

        console.log('Users table, indexes, and trigger created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating users table:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function to create the table
createUsersTable();
