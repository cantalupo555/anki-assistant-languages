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

// Function to drop all tables
async function dropAllTables(client: PoolClient, dryRun: boolean): Promise<void> {
    try {
        const tablesRes = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE';
        `);

        const tables = tablesRes.rows.map(row => row.table_name);

        if (dryRun) {
            console.log('Dry run: The following tables would be dropped:');
            console.log(tables.join(', '));
            return;
        }

        for (const table of tables) {
            console.log(`Dropping table: ${table}`);
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        }
    } catch (error) {
        console.error('Error dropping tables:', error);
        throw error;
    }
}

// Function to drop the pgcrypto extension
async function dropPgcryptoExtension(client: PoolClient, dryRun: boolean): Promise<void> {
    try {
        if (dryRun) {
            console.log('Dry run: The pgcrypto extension would be dropped.');
            return;
        }
        console.log('Dropping extension: pgcrypto');
        await client.query('DROP EXTENSION IF EXISTS pgcrypto CASCADE;');
    } catch (error) {
        console.error('Error dropping pgcrypto extension:', error);
        throw error;
    }
}

// Function to drop all custom functions
async function dropAllFunctions(client: PoolClient, dryRun: boolean): Promise<void> {
    try {
        const functionsRes = await client.query(`
            SELECT p.proname as routine_name, pg_get_function_identity_arguments(p.oid) as args
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
        `);

        const functions = functionsRes.rows.map(row => ({
            name: row.routine_name,
            args: row.args
        }));

        if (dryRun) {
            console.log('Dry run: The following functions would be dropped:');
            functions.forEach(func => console.log(`- ${func.name}(${func.args})`));
            return;
        }

        for (const func of functions) {
            console.log(`Dropping function: ${func.name}(${func.args})`);
            await client.query(`DROP FUNCTION IF EXISTS ${func.name}(${func.args}) CASCADE;`);
        }
    } catch (error) {
        console.error('Error dropping functions:', error);
        throw error;
    }
}

// Function to drop all triggers
async function dropAllTriggers(client: PoolClient, dryRun: boolean): Promise<void> {
    try {
        const triggersRes = await client.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public';
        `);

        const triggers = triggersRes.rows.map(row => ({
            name: row.trigger_name,
            table: row.event_object_table,
        }));

        if (dryRun) {
            console.log('Dry run: The following triggers would be dropped:');
            triggers.forEach(trigger => console.log(`- ${trigger.name} on table ${trigger.table}`));
            return;
        }

        for (const trigger of triggers) {
            console.log(`Dropping trigger: ${trigger.name} on table ${trigger.table}`);
            await client.query(`DROP TRIGGER IF EXISTS ${trigger.name} ON ${trigger.table} CASCADE;`);
        }
    } catch (error) {
        console.error('Error dropping triggers:', error);
        throw error;
    }
}

// Function to recreate the pgcrypto extension
async function recreatePgcryptoExtension(client: PoolClient, dryRun: boolean): Promise<void> {
    try {
        if (dryRun) {
            console.log('Dry run: The pgcrypto extension would be recreated.');
            return;
        }
        console.log('Recreating extension: pgcrypto');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    } catch (error) {
        console.error('Error recreating pgcrypto extension:', error);
        throw error;
    }
}

// Function to clean the database
const cleanDatabase = async (dryRun: boolean = false) => {
    const client = await pool.connect();

    try {
        // Check if we are in a production environment
        if (process.env.NODE_ENV === 'production') {
            console.error('Cannot clean database in production environment!');
            process.exit(1);
        }

        // Check if cleanup is allowed
        if (process.env.ALLOW_DATABASE_CLEANUP !== 'true') {
            console.error('Database cleanup is not allowed. Set ALLOW_DATABASE_CLEANUP=true to enable.');
            process.exit(1);
        }

        // Confirm database cleanup
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const confirmation = await new Promise<string>((resolve) => {
            rl.question('Are you sure you want to clean the database? (yes/no) ', (answer) => {
                resolve(answer.toLowerCase());
                rl.close();
            });
        });

        if (confirmation !== 'yes') {
            console.log('Database cleanup cancelled.');
            process.exit(0);
        }

        // Check database connection
        await checkDatabaseConnection(client);

        // Start transaction
        await client.query('BEGIN');

        // Drop all tables
        await dropAllTables(client, dryRun);

        // Drop the pgcrypto extension
        await dropPgcryptoExtension(client, dryRun);

        // Drop all custom functions
        await dropAllFunctions(client, dryRun);

        // Drop all triggers
        await dropAllTriggers(client, dryRun);

        // Recreate the pgcrypto extension
        await recreatePgcryptoExtension(client, dryRun);

        // Commit transaction
        await client.query('COMMIT');
        console.log('Database cleaned successfully!');
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error cleaning database, rolling back transaction:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Parse command-line arguments
const dryRun = process.argv.includes('--dry-run');

// Check for non-interactive flag
const nonInteractive = process.argv.includes('--non-interactive');

if (nonInteractive) {
    // Run directly without confirmation
    cleanDatabase(dryRun);
} else {
    // Interactive confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Are you sure you want to clean the database? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            cleanDatabase(dryRun);
        } else {
            console.log('Operation cancelled.');
            process.exit(0);
        }
        rl.close();
    });
}
