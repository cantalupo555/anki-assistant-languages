// Import necessary dependencies
// Client: Manages database connections
// dotenv: Loads environment variables from a .env file
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

// Configure database connection
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    connectionTimeoutMillis: 5000, // 5 seconds timeout
});

// Function to test the database connection
async function testDatabaseConnection() {
    try {
        // Connect to the database
        await client.connect();
        console.log('Database connection established successfully!');

        // Log connection details
        console.log('Connected to database:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
        });

        // Check PostgreSQL version
        const versionRes = await client.query('SHOW server_version;');
        const version = versionRes.rows[0].server_version;
        console.log('PostgreSQL version:', version);

        const minVersion = '12.0'; // Minimum required version
        if (parseFloat(version) < parseFloat(minVersion)) {
            console.error(`PostgreSQL version ${version} is below the minimum required version ${minVersion}`);
            process.exit(1);
        }

        // Check required extensions
        const requiredExtensions = ['pgcrypto'];
        for (const extension of requiredExtensions) {
            const res = await client.query(`SELECT * FROM pg_extension WHERE extname = '${extension}';`);
            if (res.rows.length === 0) {
                console.error(`Required extension '${extension}' is not installed`);
                process.exit(1);
            }
        }

        // Check required tables
        const requiredTables = ['users', 'user_tokens', 'tokens_context', 'user_settings'];
        for (const table of requiredTables) {
            const res = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = '${table}');`);
            if (!res.rows[0].exists) {
                console.error(`Required table '${table}' does not exist`);
                process.exit(1);
            }
        }

        // Check user permissions
        const permissionsRes = await client.query(`
            SELECT has_table_privilege('user_settings', 'CREATE') AS can_create,
                   has_table_privilege('user_settings', 'INSERT') AS can_insert,
                   has_table_privilege('user_settings', 'UPDATE') AS can_update,
                   has_table_privilege('user_settings', 'DELETE') AS can_delete;
        `);
        const permissions = permissionsRes.rows[0];
        if (!permissions.can_create || !permissions.can_insert || !permissions.can_update || !permissions.can_delete) {
            console.error('Database user does not have required permissions:', permissions);
            process.exit(1);
        }

        // Execute a simple query to verify everything is working
        const nowRes = await client.query('SELECT NOW()');
        console.log('Database date and time:', nowRes.rows[0].now);

    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    } finally {
        // Close the connection
        await client.end();
    }
}

// Execute the function
testDatabaseConnection();
