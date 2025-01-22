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
        console.log('Checking if users table exists...');
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist');
            process.exit(1);
        }
        console.log('Users table exists.');
        return true;
    } catch (error) {
        console.error('Error checking if users table exists:', error);
        throw error;
    }
}

// Function to check if the tokens_context table already exists
async function checkTokensContextTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if tokens_context table exists...');
        const tokensContextTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tokens_context');`);
        if (!tokensContextTableRes.rows[0].exists) {
            console.error('Required table "tokens_context" does not exist');
            process.exit(1);
        }
        console.log('tokens_context table exists.');
        return true;
    } catch (error) {
        console.error('Error checking if tokens_context table exists:', error);
        throw error;
    }
}

// Function to check if the user_tokens table already exists
async function checkUserTokensTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if user_tokens table already exists...');
        const userTokensTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_tokens');`);
        if (userTokensTableRes.rows[0].exists) {
            console.log('Table user_tokens already exists');
            return true;
        }
        console.log('user_tokens table does not exist. Proceeding with creation.');
        return false;
    } catch (error) {
        console.error('Error checking if user_tokens table exists:', error);
        throw error;
    }
}

// Function to create the user_tokens table
async function createTokensTable(client: PoolClient): Promise<void> {
    try {
        console.log('Creating user_tokens table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique token record ID
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Reference to the user with cascade delete
                input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0), -- Number of input tokens consumed
                output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0), -- Number of output tokens consumed
                total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0), -- Total tokens consumed (input + output)
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of token usage
                tokens_context_id UUID NOT NULL, -- Reference to the token context
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users table with cascade delete
                FOREIGN KEY (tokens_context_id) REFERENCES tokens_context(id) ON DELETE CASCADE, -- Foreign key to tokens_context table with cascade delete
                UNIQUE (user_id, tokens_context_id) -- Unique combination of user and context
            );
        `);
        console.log('user_tokens table created.');
    } catch (error) {
        console.error('Error creating user_tokens table:', error);
        throw error;
    }
}

// Function to add comments to columns
async function addCommentsToColumns(client: PoolClient): Promise<void> {
    try {
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN user_tokens.user_id IS 'Reference to the user';
            COMMENT ON COLUMN user_tokens.input_tokens IS 'Number of input tokens consumed';
            COMMENT ON COLUMN user_tokens.output_tokens IS 'Number of output tokens consumed';
            COMMENT ON COLUMN user_tokens.total_tokens IS 'Total tokens consumed (input + output)';
            COMMENT ON COLUMN user_tokens.created_at IS 'Timestamp of token usage';
            COMMENT ON COLUMN user_tokens.tokens_context_id IS 'Reference to the token context';
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
            CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_tokens_tokens_context_id ON user_tokens(tokens_context_id);
            CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id_tokens_context_id ON user_tokens(user_id, tokens_context_id);
        `);
        console.log('Indexes created.');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

// Main function to create the user_tokens table
const createTokensTableMain = async () => {
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

        // Check if users table exists
        await checkUsersTableExists(client);

        // Check if tokens_context table exists
        await checkTokensContextTableExists(client);

         // Check if user_tokens table already exists
        const userTokensTableExists = await checkUserTokensTableExists(client);
        if (userTokensTableExists) {
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the user_tokens table
        await createTokensTable(client);

        // Add comments to columns
        await addCommentsToColumns(client);

        // Create indexes
        await createIndexes(client);

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');

        console.log('user_tokens table and indexes created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating user_tokens table, rolling back transaction:', error);
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
    createTokensTableMain();
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to create the user_tokens table? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            createTokensTableMain();
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
