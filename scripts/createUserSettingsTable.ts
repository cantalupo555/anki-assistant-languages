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

// Function to create the user_settings table
const createUserSettingsTable = async () => {
    const client = await pool.connect();

    try {
        // Enable pgcrypto extension
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Check if users table exists
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist');
            process.exit(1);
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if user_settings table already exists
        const userSettingsTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_settings');`);
        if (userSettingsTableRes.rows[0].exists) {
            console.log('Table user_settings already exists');
            await client.query('COMMIT'); // Commit the transaction before returning
            return;
        }

        // Create the user_settings table
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

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_settings_native_language ON user_settings(native_language);
            CREATE INDEX IF NOT EXISTS idx_user_settings_target_language ON user_settings(target_language);
        `);

        // Create function to update the updated_at field
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column_user_settings()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create trigger to automatically update the updated_at field
        await client.query(`
            CREATE TRIGGER update_user_settings_updated_at
            BEFORE UPDATE ON user_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column_user_settings();
        `);

        // Commit transaction
        await client.query('COMMIT');

        console.log('user_settings table and trigger created successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating user_settings table and trigger:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function to create the table
createUserSettingsTable();
