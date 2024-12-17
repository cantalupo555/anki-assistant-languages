import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function testDatabaseConnection() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432', 10),
    });

    try {
        await client.connect();
        console.log('Database connection established successfully!');

        // Optional: Execute a simple query to verify everything is working
        const res = await client.query('SELECT NOW()');
        console.log('Database date and time:', res.rows[0].now);

    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally {
        await client.end(); // Close the connection
    }
}

async function main() {
    try {
        await testDatabaseConnection();
    } catch (error) {
        console.error("Error during testDatabaseConnection:", error);
    }
}

main();
