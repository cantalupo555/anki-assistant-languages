// Import necessary dependencies
// Pool: Manages database connections
// dotenv: Loads environment variables from a .env file
// bcrypt: For password hashing and security
// readline: Enables interactive command-line input
import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
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

// Function to generate a random password
function generateRandomPassword(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// Function to create the admin user
const createAdminUser = async () => {
    const client = await pool.connect();

    try {
        // Check database connection
        await checkDatabaseConnection(client);

        // Check if users table exists
        await checkUsersTableExists(client);

        // Start transaction
        console.log('Starting transaction...');
        await client.query('BEGIN');
        console.log('Transaction started.');

        // Admin user details
        const adminUsername = 'admin';
        const adminEmail = 'admin@ankiassistant.com';
        const adminPassword = generateRandomPassword(8);
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

        // Check if admin user already exists
        const adminUserRes = await client.query('SELECT id FROM users WHERE username = $1 OR email = $2', [adminUsername, adminEmail]);
        if (adminUserRes.rows.length === 0) {
            try {
                const adminUser = await client.query(`
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES ($1, $2, $3, 'admin')
                    RETURNING id
                `, [adminUsername, adminEmail, adminPasswordHash]);

                // Create default settings for admin
                await client.query(`
                    INSERT INTO user_settings 
                    (user_id, preferred_language, theme, native_language, target_language, selected_api_service, selected_tts_service, selected_llm, selected_voice)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (user_id) DO NOTHING; -- Prevents duplicate settings creation if user_id already exists
                `, [
                    adminUser.rows[0].id, // user_id
                    'english',           // preferred_language
                    'light',             // theme
                    'en-US', // native_language
                    'en-US',   // target_language
                    'openrouter',        // selected_api_service
                    'google',            // selected_tts_service
                    'qwen/qwen-2.5-72b-instruct', // selected_llm
                    'en-US-Wavenet-A'    // selected_voice
                ]);

                console.log('Default admin user created successfully!');
                console.log('Admin credentials:');
                console.log(`Username: ${adminUsername}`);
                console.log(`Email: ${adminEmail}`);
                console.log(`Password: ${adminPassword}`);
            } catch (error) {
                console.error('Error creating default admin user:', error);
                await client.query('ROLLBACK');
                process.exit(1);
            }
        } else {
            console.log('Default admin user already exists');
        }

        // Commit transaction
        console.log('Committing transaction...');
        await client.query('COMMIT');
        console.log('Transaction committed.');
    } catch (error) {
        // Rollback transaction in case of error
        console.error('Error creating admin user, rolling back transaction:', error);
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
    createAdminUser();
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to create the admin user? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            createAdminUser();
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
