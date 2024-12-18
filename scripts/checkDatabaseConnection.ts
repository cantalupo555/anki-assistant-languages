// Import necessary dependencies
// Client: Manages database connections
// dotenv: Loads environment variables from a .env file
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to test the database connection
async function testDatabaseConnection() {
    // Configure database connection
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432', 10),
    });

    try {
        // Connect to the database
        await client.connect();
        console.log('Database connection established successfully!');

        // Optional: Execute a simple query to verify everything is working
        const res = await client.query('SELECT NOW()');
        console.log('Database date and time:', res.rows[0].now);

    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally {
        // Close the connection
        await client.end();
    }
}

// Main function to execute the database connection test
async function main() {
    try {
        await testDatabaseConnection();
    } catch (error) {
        console.error("Error during testDatabaseConnection:", error);
    }
}

// Execute the main function
main();
