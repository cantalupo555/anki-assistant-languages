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

// Function to clean the database
const cleanDatabase = async (dryRun: boolean = false) => {
    const client = await pool.connect();

    try {
        // Check if we are in a production environment
        if (process.env.NODE_ENV === 'production') {
            console.error('Cannot clean database in production environment!');
            process.exit(1);
        }

        // Start transaction
        await client.query('BEGIN');

        // Get all tables in the database
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
            await client.query('ROLLBACK');
            return;
        }

        // Drop all tables
        for (const table of tables) {
            console.log(`Dropping table: ${table}`);
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        }

        // Drop the pgcrypto extension
        console.log('Dropping extension: pgcrypto');
        await client.query('DROP EXTENSION IF EXISTS pgcrypto CASCADE;');

        // Drop all custom functions
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

        for (const func of functions) {
            console.log(`Dropping function: ${func.name}(${func.args})`);
            await client.query(`DROP FUNCTION IF EXISTS ${func.name}(${func.args}) CASCADE;`);
        }

        // Drop all triggers
        const triggersRes = await client.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public';
        `);

        const triggers = triggersRes.rows.map(row => ({
            name: row.trigger_name,
            table: row.event_object_table,
        }));

        for (const trigger of triggers) {
            console.log(`Dropping trigger: ${trigger.name} on table ${trigger.table}`);
            await client.query(`DROP TRIGGER IF EXISTS ${trigger.name} ON ${trigger.table} CASCADE;`);
        }

        // Recreate the pgcrypto extension
        console.log('Recreating extension: pgcrypto');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Commit transaction
        await client.query('COMMIT');
        console.log('Database cleaned successfully!');
    }   catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error cleaning database:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Parse command-line arguments
const dryRun = process.argv.includes('--dry-run');

// Execute the function
cleanDatabase(dryRun);
