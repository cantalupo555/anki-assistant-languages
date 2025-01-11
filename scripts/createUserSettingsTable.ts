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

// Function to check if the user_settings table already exists
async function checkUserSettingsTableExists(client: PoolClient): Promise<boolean> {
    try {
        console.log('Checking if user_settings table already exists...');
        const userSettingsTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_settings');`);
        if (userSettingsTableRes.rows[0].exists) {
            console.log('Table user_settings already exists');
            return true;
        }
        console.log('user_settings table does not exist. Proceeding with creation.');
        return false;
    } catch (error) {
        console.error('Error checking if user_settings table exists:', error);
        throw error;
    }
}

// Function to create the user_settings table
async function createUserSettingsTable(client: PoolClient): Promise<void> {
    try {
        console.log('Creating user_settings table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique settings ID
                user_id UUID NOT NULL, -- Reference to the user
                preferred_language VARCHAR(50) DEFAULT 'english' CHECK (preferred_language IN ('english', 'spanish', 'french')), -- Default interface language
                theme VARCHAR(50) DEFAULT 'light' CHECK (theme IN ('light', 'dark')), -- Interface theme
                native_language VARCHAR(255) CHECK (native_language ~ '^[A-Za-z ]+$'), -- User's native language
                target_language VARCHAR(255) CHECK (target_language ~ '^[A-Za-z ]+$'), -- User's target learning language
                selected_api_service VARCHAR(255), -- Selected API service
                selected_tts_service VARCHAR(255), -- Selected TTS service
                selected_llm VARCHAR(255), -- Selected LLM model
                selected_voice VARCHAR(255), -- Selected TTS voice
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of settings creation
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last update
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Foreign key to users table
            );
        `);
        console.log('user_settings table created.');
    } catch (error) {
        console.error('Error creating user_settings table:', error);
        throw error;
    }
}

// Function to add comments to columns
async function addCommentsToColumns(client: PoolClient): Promise<void> {
    try {
        console.log('Adding comments to columns...');
        await client.query(`
            COMMENT ON COLUMN user_settings.user_id IS 'Reference to the user';
            COMMENT ON COLUMN user_settings.preferred_language IS 'Default interface language';
            COMMENT ON COLUMN user_settings.theme IS 'Interface theme';
            COMMENT ON COLUMN user_settings.native_language IS 'User native language';
            COMMENT ON COLUMN user_settings.target_language IS 'User target learning language';
            COMMENT ON COLUMN user_settings.selected_api_service IS 'Selected API service';
            COMMENT ON COLUMN user_settings.selected_tts_service IS 'Selected TTS service';
            COMMENT ON COLUMN user_settings.selected_llm IS 'Selected LLM model';
            COMMENT ON COLUMN user_settings.selected_voice IS 'Selected TTS voice';
            COMMENT ON COLUMN user_settings.created_at IS 'Timestamp of settings creation';
            COMMENT ON COLUMN user_settings.updated_at IS 'Timestamp of last update';
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
            CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_settings_native_language ON user_settings(native_language);
            CREATE INDEX IF NOT EXISTS idx_user_settings_target_language ON user_settings(target_language);
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
            CREATE OR REPLACE FUNCTION update_updated_at_column_user_settings()
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
            CREATE TRIGGER update_user_settings_updated_at
            BEFORE UPDATE ON user_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column_user_settings();
        `);
        console.log('Trigger to update updated_at field created.');
    } catch (error) {
        console.error('Error creating trigger to update updated_at field:', error);
        throw error;
    }
}

// Main function to create the user_settings table
const createUserSettingsTableMain = async () => {
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

        // Check if user_settings table already exists
        const userSettingsTableExists = await checkUserSettingsTableExists(client);
        if (userSettingsTableExists) {
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the user_settings table
        await createUserSettingsTable(client);

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

        console.log('user_settings table, indexes, and trigger created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating user_settings table, rolling back transaction:', error);
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
    createUserSettingsTableMain();
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to create the user_settings table? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            createUserSettingsTableMain();
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
