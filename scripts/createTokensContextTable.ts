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
        console.log('Checking if tokens_context table already exists...');
        const tokensContextTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tokens_context');`);
        if (tokensContextTableRes.rows[0].exists) {
            console.log('Table tokens_context already exists');
            return true;
        }
        console.log('tokens_context table does not exist. Proceeding with creation.');
        return false;
    } catch (error) {
        console.error('Error checking if tokens_context table exists:', error);
        throw error;
    }
}

// Function to create the tokens_context table
async function createTokensContextTable(client: PoolClient): Promise<void> {
    try {
        console.log('Creating tokens_context table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tokens_context (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique context ID
                target_language VARCHAR(255) NOT NULL CHECK (target_language ~ '^[A-Za-z ]+$'), -- Target language for token usage
                api_service VARCHAR(255) NOT NULL CHECK (api_service ~ '^[A-Za-z0-9_]+$') -- API service used for token consumption
            );
        `);
        console.log('tokens_context table created.');
    } catch (error) {
        console.error('Error creating tokens_context table:', error);
        throw error;
    }
}

// Function to add comments to columns
async function addCommentsToColumns(client: PoolClient): Promise<void> {
    try {
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN tokens_context.target_language IS 'Target language for token usage';
            COMMENT ON COLUMN tokens_context.api_service IS 'API service used for token consumption';
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
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language ON tokens_context(target_language);
            CREATE INDEX IF NOT EXISTS idx_tokens_context_api_service ON tokens_context(api_service);
        `);
        console.log('Indexes created.');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

// Main function to create the tokens_context table
const createTokensContextTableMain = async () => {
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

        // Check if tokens_context table already exists
        const tokensContextTableExists = await checkTokensContextTableExists(client);
        if (tokensContextTableExists) {
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the tokens_context table
        await createTokensContextTable(client);

        // Add comments to columns
        await addCommentsToColumns(client);

        // Create indexes
        await createIndexes(client);

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');

        console.log('tokens_context table and indexes created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating tokens_context table, rolling back transaction:', error);
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
    createTokensContextTableMain();
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to create the tokens_context table? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            createTokensContextTableMain();
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
