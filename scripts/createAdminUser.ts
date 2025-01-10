// Import necessary dependencies
// Pool: Manages database connections
// dotenv: Loads environment variables from a .env file
// bcrypt: For password hashing and security
import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
                await client.query(`
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES ($1, $2, $3, 'admin')
                `, [adminUsername, adminEmail, adminPasswordHash]);
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

// Execute the function
createAdminUser();
