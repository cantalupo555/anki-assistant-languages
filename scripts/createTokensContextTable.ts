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

// Function to create the tokens_context table
const createTokensContextTable = async () => {
    const client = await pool.connect();

    try {
        // Enable pgcrypto extension
        console.log('Enabling pgcrypto extension...');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        console.log('pgcrypto extension enabled.');

        // Check if users table exists
        console.log('Checking if users table exists...');
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist');
            process.exit(1);
        }
        console.log('Users table exists.');

        // Start transaction
        console.log('Starting transaction...');
        await client.query('BEGIN');
        console.log('Transaction started.');

        // Check if tokens_context table already exists
        console.log('Checking if tokens_context table already exists...');
        const tokensContextTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tokens_context');`);
        if (tokensContextTableRes.rows[0].exists) {
            console.log('Table tokens_context already exists');
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }
        console.log('tokens_context table does not exist. Proceeding with creation.');

        // Create the tokens_context table
        console.log('Creating tokens_context table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tokens_context (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique context ID
                target_language VARCHAR(255) CHECK (target_language ~ '^[A-Za-z ]+$'), -- Target language for token usage
                api_service VARCHAR(255) CHECK (api_service ~ '^[A-Za-z0-9_]+$') -- API service used for token consumption
            );
        `);
        console.log('tokens_context table created.');

        // Add comments to columns
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN tokens_context.target_language IS 'Target language for token usage';
            COMMENT ON COLUMN tokens_context.api_service IS 'API service used for token consumption';
        `);
        console.log('Comments added to columns.');

        // Create indexes
        console.log('Creating indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language ON tokens_context(target_language);
            CREATE INDEX IF NOT EXISTS idx_tokens_context_api_service ON tokens_context(api_service);
            CREATE INDEX IF NOT EXISTS idx_tokens_context_target_language_api_service ON tokens_context(target_language, api_service);
        `);
        console.log('Indexes created.');

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');

        console.log('tokens_context table and indexes created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating tokens_context table:', error);
        await client.query('ROLLBACK');
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Interactive confirmation
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Are you sure you want to create the tokens_context table? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        createTokensContextTable();
    } else {
        console.log('Operation cancelled.');
        process.exit(0);
    }
    rl.close();
});
