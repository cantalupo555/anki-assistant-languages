// Import necessary dependencies
// child_process: Provides the 'exec' function for shell commands
// readline: Enables interactive command-line input
import { exec } from 'child_process';
import * as readline from 'readline';

/**
 * Executes a Yarn command and returns a Promise
 * @param command - The Yarn command to execute
 * @returns Promise that resolves when command completes
 * @throws Will throw an error if command fails
 */
function runYarnCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Add --non-interactive flag to prevent individual confirmations
        const fullCommand = `${command} --non-interactive`;
        console.log(`Executing: yarn ${fullCommand}`);
        exec(`yarn ${fullCommand}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing 'yarn ${fullCommand}':`, stderr);
                reject(error);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
}

/**
 * Main function to set up the database by running all required scripts in order
 * Prompts for confirmation before executing
 * Handles errors and exits with appropriate status codes
 */
const setupDatabase = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Interactive confirmation before proceeding
    const confirmation = await new Promise<string>((resolve) => {
        rl.question('Are you sure you want to set up the database? (yes/no) ', (answer) => {
            resolve(answer.toLowerCase());
            rl.close();
        });
    });

    if (confirmation !== 'yes') {
        console.log('Database setup cancelled.');
        process.exit(0);
    }

    try {
        // 1. Verify database connection
        await runYarnCommand('check-db-connection');

        // 2. Create users table
        await runYarnCommand('create-users-table');

        // 3. Create user settings table 
        await runYarnCommand('create-user-settings-table');

        // 4. Create tokens context table
        await runYarnCommand('create-tokens-context-table');

        // 5. Create user tokens table
        await runYarnCommand('create-tokens-table');

        // 6. Create admin user
        await runYarnCommand('create-admin-user');

        console.log('Database set up successfully!');
    } catch (error) {
        console.error('Error during database setup:', error);
        process.exit(1);
    }
};

// Execute the main setup function
setupDatabase();
