// Import necessary dependencies
import { Pool, PoolClient } from 'pg';
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

// Function to enable the pgcrypto extension (needed for gen_random_uuid())
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

// Function to check if the users table exists (dependency)
async function checkUsersTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if users table exists...');
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist. Please create it first.');
            process.exit(1);
        }
        console.log('Users table exists.');
        return true;
    } catch (error) {
        console.error('Error checking if users table exists:', error);
        throw error;
    }
}

// Function to check if the user_sessions table already exists
async function checkUserSessionsTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if user_sessions table already exists...');
        const tableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_sessions');`);
        if (tableRes.rows[0].exists) {
            console.log('Table user_sessions already exists');
            return true;
        }
        console.log('user_sessions table does not exist. Proceeding with creation.');
        return false;
    } catch (error) {
        console.error('Error checking if user_refresh_tokens table exists:', error);
        throw error;
    }
}

// Function to create the user_sessions table
async function createUserSessionsTable(client: PoolClient): Promise<void> {
    try {
        console.log('Creating user_sessions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for this session record
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to the user
                token_hash VARCHAR(255) NOT NULL UNIQUE, -- Secure HASH of the session's refresh token (e.g., SHA256)
                family UUID NOT NULL, -- Identifier for the token family (for rotation detection)
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When the refresh token expires
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When this record was created
                revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Timestamp if the token was manually revoked
                user_agent TEXT, -- User agent of the client originating the session
                ip_address VARCHAR(45) -- IP address of the client originating the session
            );
        `);
        console.log('user_sessions table created.');
    } catch (error) {
        console.error('Error creating user_sessions table:', error);
        throw error;
    }
}

// Function to add comments to columns
async function addCommentsToColumns(client: PoolClient): Promise<void> {
    try {
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN user_sessions.id IS 'Unique ID for this user session record';
            COMMENT ON COLUMN user_sessions.user_id IS 'Reference to the user who owns the session';
            COMMENT ON COLUMN user_sessions.token_hash IS 'Secure hash (e.g., SHA256) of the refresh token associated with this session. Never store the raw token.';
            COMMENT ON COLUMN user_sessions.family IS 'Identifier grouping session tokens created in sequence (for rotation detection)';
            COMMENT ON COLUMN user_sessions.expires_at IS 'Timestamp when the session (refresh token) becomes invalid';
            COMMENT ON COLUMN user_sessions.created_at IS 'Timestamp when this session record was created';
            COMMENT ON COLUMN user_sessions.revoked_at IS 'Timestamp indicating if the session was manually revoked before expiration (e.g., logout)';
            COMMENT ON COLUMN user_sessions.user_agent IS 'User agent string from the client that initiated the session';
            COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the client that initiated the session';
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
            CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
            -- Index on token_hash is crucial for quick lookups during refresh
            CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
            CREATE INDEX IF NOT EXISTS idx_user_sessions_family ON user_sessions(family);
            CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
        `);
        console.log('Indexes created.');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

// Main function to create the user_sessions table
const createUserSessionsTableMain = async () => {
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

        // Check if users table exists (dependency)
        await checkUsersTableExists(client);

        // Check if user_sessions table already exists
        const tableExists = await checkUserSessionsTableExists(client);
        if (tableExists) {
            console.log('Skipping creation as table already exists.');
            await client.query('COMMIT'); // Commit even if skipping
            return;
        }

        // Create the user_sessions table
        await createUserSessionsTable(client);

        // Add comments to columns
        await addCommentsToColumns(client);

        // Create indexes
        await createIndexes(client);

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');

        console.log('user_sessions table, comments, and indexes created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating user_sessions table, rolling back transaction:', error);
        await client.query('ROLLBACK');
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Check for non-interactive flag
const nonInteractive = process.argv.includes('--non-interactive');

if (nonInteractive) {
    // Run directly without confirmation
    createUserSessionsTableMain();
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to create the user_sessions table? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            createUserSessionsTableMain();
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
