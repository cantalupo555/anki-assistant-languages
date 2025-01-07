// Import necessary dependencies
// Pool: Manages database connections
// dotenv: Loads environment variables from a .env file
// bcrypt: For password hashing and security
import { Pool } from 'pg';
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
        // Check if users table exists
        const usersTableRes = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users');`);
        if (!usersTableRes.rows[0].exists) {
            console.error('Required table "users" does not exist. Please run createUsersTable.ts first.');
            process.exit(1);
        }

        // Admin user details
        const adminUsername = 'admin';
        const adminEmail = 'admin@ankiassistant.com';
        const adminPassword = generateRandomPassword(8); // Senha aleatória de 8 caracteres
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10); // Hash da senha

        // Check if admin user already exists
        const adminUserRes = await client.query('SELECT id FROM users WHERE username = $1 OR email = $2', [adminUsername, adminEmail]);
        if (adminUserRes.rows.length === 0) {
            await client.query('BEGIN');
            try {
                await client.query(`
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES ($1, $2, $3, 'admin')
                `, [adminUsername, adminEmail, adminPasswordHash]);
                await client.query('COMMIT');
                console.log('Default admin user created successfully!');
                console.log('Admin credentials:');
                console.log(`Username: ${adminUsername}`);
                console.log(`Email: ${adminEmail}`);
                console.log(`Password: ${adminPassword}`);
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error creating default admin user:', error);
                process.exit(1);
            }
        } else {
            console.log('Default admin user already exists');
        }
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function
createAdminUser();
