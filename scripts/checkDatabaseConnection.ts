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
    connectionTimeoutMillis: 5000, // 5 seconds timeout
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

// Function to check PostgreSQL version
async function checkPostgresVersion(client: PoolClient): Promise<void> {
    try {
        console.log('Checking PostgreSQL version...');
        const versionRes = await client.query('SHOW server_version;');
        const version = versionRes.rows[0].server_version;
        console.log('PostgreSQL version:', version);

        const minVersion = '17.0'; // Minimum required version
        if (parseFloat(version) < parseFloat(minVersion)) {
            console.error(`PostgreSQL version ${version} is below the minimum required version ${minVersion}`);
            process.exit(1);
        }
        console.log('PostgreSQL version is valid.');
    } catch (error) {
        console.error('Error checking PostgreSQL version:', error);
        throw error;
    }
}

// Function to check required extensions
async function checkRequiredExtensions(client: PoolClient): Promise<void> {
    try {
        console.log('Checking required extensions...');
        const requiredExtensions = ['pgcrypto'];
        for (const extension of requiredExtensions) {
            const res = await client.query(`SELECT * FROM pg_extension WHERE extname = '${extension}';`);
            if (res.rows.length === 0) {
                console.log(`Required extension '${extension}' is not installed. Attempting to install...`);
                try {
                    await client.query(`CREATE EXTENSION ${extension};`);
                    console.log(`Extension '${extension}' installed successfully.`);
                } catch (error) {
                    console.error(`Error installing extension '${extension}':`, error);
                    console.error(`Please ensure you have the necessary permissions to install extensions.`);
                    process.exit(1);
                }
            } else {
                console.log(`Extension '${extension}' is installed.`);
            }
        }
        console.log('Required extensions are valid.');
    } catch (error) {
        console.error('Error checking required extensions:', error);
        throw error;
    }
}

// Function to check required tables
async function checkRequiredTables(client: PoolClient): Promise<void> {
    try {
        console.log('Checking required tables...');
        const requiredTables = [
            { name: 'users', createScript: 'yarn create-users-table' },
            { name: 'user_sessions', createScript: 'yarn create-user-sessions-table' },
            { name: 'user_settings', createScript: 'yarn create-user-settings-table' },
            { name: 'tokens_context', createScript: 'yarn create-tokens-context-table' },
            { name: 'user_tokens', createScript: 'yarn create-tokens-table' },
        ];
        const missingTables: string[] = [];

        for (const table of requiredTables) {
            const res = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = '${table.name}');`);
            if (!res.rows[0].exists) {
                missingTables.push(table.name);
            }
        }

        if (missingTables.length > 0) {
            console.warn('The following required tables do not exist:');
            console.warn('These tables are necessary for the project to function correctly.');
            console.warn('Please run the corresponding scripts to create them.');
            missingTables.forEach(table => {
                const tableInfo = requiredTables.find(t => t.name === table);
                if (tableInfo) {
                    console.warn(`- '${table}': For example, run: ${tableInfo.createScript}`);
                }
            });
            console.warn('This is not a critical error. You can create the tables using the setup-database script:');
            console.warn('yarn setup-database');
        } else {
            console.log('All required tables exist.');
        }
    } catch (error) {
        console.error('Error checking required tables:', error);
        throw error;
    }
}

// Function to check user permissions
async function checkUserPermissions(client: PoolClient): Promise<void> {
    try {
        console.log('Checking user permissions...');
        let permissions = { can_create: false, can_insert: false, can_update: false, can_delete: false };
        try {
            // Create a temporary table
            await client.query('CREATE TEMP TABLE temp_permissions_check (id UUID PRIMARY KEY DEFAULT gen_random_uuid())');

            // Check permissions
            const permissionsRes = await client.query(`
                SELECT
                    has_table_privilege('temp_permissions_check', 'INSERT') AS can_insert,
                    has_table_privilege('temp_permissions_check', 'UPDATE') AS can_update,
                    has_table_privilege('temp_permissions_check', 'DELETE') AS can_delete;
            `);
            permissions = permissionsRes.rows[0];
            permissions.can_create = true; // We already know we can create the table

            // Drop the temporary table
            await client.query('DROP TABLE temp_permissions_check');
        } catch (error) {
            console.error('Error checking user permissions:', error);
            throw error;
        }
        console.log('User permissions:', permissions);

        if (!permissions.can_create || !permissions.can_insert || !permissions.can_update || !permissions.can_delete) {
            console.error('Database user does not have required table permissions:', permissions);
            process.exit(1);
        }
        console.log('User permissions are valid.');
    } catch (error) {
        console.error('Error checking user permissions:', error);
        throw error;
    }
}

// Function to test the database connection
const testDatabaseConnection = async () => {
    const client = await pool.connect();
    try {
        // Check database connection
        await checkDatabaseConnection(client);

        // Log connection details
        console.log('Connected to database:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
        });

        // Check PostgreSQL version
        await checkPostgresVersion(client);

        // Check required extensions
        await checkRequiredExtensions(client);

        // Check required tables
        await checkRequiredTables(client);

        // Check user permissions
        await checkUserPermissions(client);

        // Execute a simple query to verify everything is working
        const nowRes = await client.query('SELECT NOW()');
        console.log('Database date and time:', nowRes.rows[0].now);

        console.log('Database connection and setup are valid.');
    } catch (error) {
        console.error('Error during database connection test:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute the function
testDatabaseConnection();
