// Import necessary dependencies
// Pool: Manages database connections
// dotenv: Loads environment variables from a .env file
// readline: Enables interactive command-line input
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

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

import { PoolClient } from 'pg';

// Function to check database connection
async function checkDatabaseConnection(client: PoolClient): Promise<void> {
    try {
        await client.query('SELECT 1');
        console.log('Database connection is valid.');
    } catch (error) {
        console.error('Error checking database connection:', error);
        throw error;
    }
}

// Function to enable the pgcrypto extension
async function enablePgcryptoExtension(client: PoolClient): Promise<void> {
    try {
        console.log('Enabling pgcrypto extension...');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        console.log('pgcrypto extension enabled.');
    } catch (error) {
        console.error('Error enabling pgcrypto extension:', error);
        throw error;
    }
}

// Function to check if the users table already exists
async function checkUsersTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if users table already exists...');
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (usersTableRes.rows[0].exists) {
            console.log('Table users already exists');
            return true;
        }
        console.log('Users table does not exist. Proceeding with creation.');
        return false;
    } catch (error) {
        console.error('Error checking if users table exists:', error);
        throw error;
    }
}

// Function to create the users table
async function createUsersTable(client: PoolClient): Promise<void> {
    try {
        console.log('Creating users table...');
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
        console.log('Users table created.');
    } catch (error) {
        console.error('Error creating users table:', error);
        throw error;
    }
}

// Function to add comments to columns
async function addCommentsToColumns(client: PoolClient): Promise<void> {
    try {
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN users.username IS 'Unique username for login';
            COMMENT ON COLUMN users.email IS 'Unique email for user account';
            COMMENT ON COLUMN users.password_hash IS 'Hashed password for security';
            COMMENT ON COLUMN users.status IS 'User status (active, inactive, banned)';
            COMMENT ON COLUMN users.created_at IS 'Timestamp of user creation';
            COMMENT ON COLUMN users.updated_at IS 'Timestamp of last user update';
            COMMENT ON COLUMN users.role IS 'User role (user, admin)';
        `);
        console.log('Comments added to columns.');
    } catch (error) {
        console.error('Error adding comments to columns:', error);
        throw error;
    }
}

// Function to create indexes
async function createIndexes(client: PoolClient): Promise<void> {
    try {
        console.log('Creating indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);
        console.log('Indexes created.');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

// Function to create the function to update the updated_at field
async function createUpdateUpdatedAtFunction(client: PoolClient): Promise<void> {
    try {
        console.log('Creating function to update updated_at field...');
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('Function to update updated_at field created.');
    } catch (error) {
        console.error('Error creating function to update updated_at field:', error);
        throw error;
    }
}

// Function to create the trigger to update the updated_at field
async function createUpdateUpdatedAtTrigger(client: PoolClient): Promise<void> {
    try {
        console.log('Creating trigger to update updated_at field...');
        await client.query(`
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('Trigger to update updated_at field created.');
    } catch (error) {
        console.error('Error creating trigger to update updated_at field:', error);
        throw error;
    }
}

// Main function to create the users table
const createUsersTableMain = async () => {
    const client = await pool.connect();
    

    try {
        // Check database connection
        await checkDatabaseConnection(client);

        // Start transaction
        console.log('Starting transaction...');
        await client.query('BEGIN');
        console.log('Transaction started.');

        // Enable pgcrypto extension
        await enablePgcryptoExtension(client);

        // Check if users table already exists
        const usersTableExists = await checkUsersTableExists(client);
        if (usersTableExists) {
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the users table
        await createUsersTable(client);

        // Add comments to columns
        await addCommentsToColumns(client);

        // Create indexes
        await createIndexes(client);

        // Create function to update the updated_at field
        await createUpdateUpdatedAtFunction(client);

        // Create trigger to automatically update the updated_at field
        await createUpdateUpdatedAtTrigger(client);

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');

        console.log('Users table, indexes, and trigger created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating users table, rolling back transaction:', error);
        await client.query('ROLLBACK');
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Interactive confirmation
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Are you sure you want to create the users table? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        createUsersTableMain();
    } else {
        console.log('Operation cancelled.');
        process.exit(0);
    }
    rl.close();
});
