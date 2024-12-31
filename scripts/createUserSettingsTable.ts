// Import necessary dependencies
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
        // Create the user_settings table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique settings ID
                user_id UUID NOT NULL, -- Reference to the user
                preferred_language VARCHAR(50) DEFAULT 'english', -- Default interface language
                theme VARCHAR(50) DEFAULT 'light' CHECK (theme IN ('light', 'dark')), -- Interface theme
                native_language VARCHAR(255), -- User's native language
                target_language VARCHAR(255), -- User's target learning language
                selected_api_service VARCHAR(255), -- Selected API service
                selected_tts_service VARCHAR(255), -- Selected TTS service
                selected_llm VARCHAR(255), -- Selected LLM model
                selected_voice VARCHAR(255), -- Selected TTS voice
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of settings creation
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last update
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Foreign key to users table
            );
        `);

        // Create index for user_id to improve query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
            ON user_settings(user_id);
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

        console.log('user_settings table and trigger created successfully!');
    } catch (error) {
        console.error('Error creating user_settings table and trigger:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function to create the table
createUserSettingsTable();
