# Database Setup Scripts

This directory contains scripts to configure and initialize the project's database. Below is a description of each script and the correct execution order.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Available Scripts](#available-scripts)
3. [Script Dependencies](#script-dependencies)
4. [Script Options](#script-options)
5. [CI/CD Note](#cicd-note)
6. [Required Environment Variables](#required-environment-variables)
7. [Usage Examples](#usage-examples)
8. [Dependencies](#dependencies)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)
11. [Security Considerations](#security-considerations)

---

## Quick Start

To set up the database with default configurations, run:
```bash
yarn setup-database
```

This will execute all required scripts in the correct order without requiring manual confirmation.

---

## Available Scripts

### 1. `checkDatabaseConnection.ts`
- **Description**: Verifies the database connection and validates the existence of required tables, extensions, and permissions.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn check-db-connection
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 2. `createUsersTable.ts`
- **Description**: Creates the `users` table and configures related indexes, triggers, and functions.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn create-users-table
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 3. `createUserSettingsTable.ts`
- **Description**: Creates the `user_settings` table and configures indexes, triggers, and related functions.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-user-settings-table
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 4. `createTokensContextTable.ts`
- **Description**: Creates the `tokens_context` table and configures indexes.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-tokens-context-table
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 5. `createTokensTable.ts`
- **Description**: Creates the `user_tokens` table and configures indexes and foreign keys.
- **Dependencies**: The `users` and `tokens_context` tables must exist.
- **Command**:
  ```bash
  yarn create-tokens-table
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 6. `createAdminUser.ts`
- **Description**: Creates the default admin user with random credentials.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-admin-user
  ```
- **Options**:
  - `--non-interactive`: Runs without confirmation prompts

### 7. `cleanDatabase.ts`
- **Description**: Cleans the database by dropping all tables, functions, and triggers. Includes a dry-run mode for safety checks.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn clean-database
  ```
- **Options**:
  - `--dry-run`: Lists what would be cleaned without executing the operations
  - `--non-interactive`: Runs without confirmation prompts
- **Safety**: Prevents execution in production environments

### 8. `setupDatabase.ts`
- **Description**: Automates the complete database setup process by running all required scripts in the correct order.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn setup-database
  ```
- **Options**:
  - `--non-interactive`: Runs all scripts without confirmation prompts

---

## Script Dependencies

```plaintext
check-db-connection
       ↓
create-users-table
       ↓
create-user-settings-table
       ↓
create-tokens-context-table
       ↓
create-tokens-table
       ↓
create-admin-user
```

- **Independent Scripts**: `clean-database`, `setup-database`

---

## Script Options

### Non-Interactive Mode (`--non-interactive`)
- **Purpose**: Automates script execution without requiring user confirmation.
- **Use Case**: Ideal for CI/CD pipelines or automated environments.
- **Example**:
  ```bash
  yarn create-users-table --non-interactive
  ```

### Dry-Run Mode (`--dry-run`)
- **Purpose**: Simulates script execution without making changes to the database.
- **Use Case**: Useful for testing or verifying what changes would be made.
- **Example**:
  ```bash
  yarn clean-database --dry-run
  ```

---

## CI/CD Note

The `setupDatabase.ts` script is already prepared to run in CI/CD pipelines. 
Just ensure that the necessary environment variables are configured in the CI/CD environment.

## Required Environment Variables

Make sure to configure the following environment variables before running any script:

- `DB_USER`
- `DB_HOST`
- `DB_DATABASE`
- `DB_PASSWORD`
- `DB_PORT`

## Usage Examples

### Manual Execution
```bash
yarn setup-database
```

### CI/CD Execution
```bash
yarn setup-database --non-interactive
```

---

## Required Environment Variables

Make sure to configure the following environment variables in the `.env` file before running the scripts:

- `DB_USER`: Database username.
- `DB_HOST`: Database host address.
- `DB_DATABASE`: Database name.
- `DB_PASSWORD`: Database password.
- `DB_PORT`: Database port (default: `5432`).

### Environment Variables Template

Create a `.env` file from the following template:

```env
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

Ensure this file is not committed to version control by adding it to `.gitignore`.

---

## Dependencies

- **bcrypt**: For generating the admin user's password hash.
  ```bash
  yarn add bcrypt
  yarn add -D @types/bcrypt
  ```

- **pg**: For PostgreSQL connection.
  ```bash
  yarn add pg
  yarn add -D @types/pg
  ```

- **dotenv**: For loading environment variables.
  ```bash
  yarn add dotenv
  ```

---

## Troubleshooting

### Database Connection Issues
- **Error**: `Error: Connection refused`
  - **Solution**: Verify that the database is running and that the connection details in `.env` are correct.

### Missing Tables or Extensions
- **Error**: `Error: relation "users" does not exist`
  - **Solution**: Ensure the required tables are created by running the setup script:
    ```bash
    yarn setup-database
    ```

### Permission Denied Errors
- **Error**: `Error: permission denied for table users`
  - **Solution**: Verify that the database user has the necessary permissions (CREATE, INSERT, UPDATE, DELETE).

---

## Best Practices
- **Environment Variables**: Always store sensitive information (e.g., database credentials) in `.env` files and ensure they are not committed to version control.
- **Backups**: Before running destructive operations (e.g., `clean-database`), ensure you have a recent backup of your database.
- **Testing**: Use the `--dry-run` flag to test scripts before executing them in production environments.
- **Documentation**: Keep the README.md updated with any changes to the database schema or scripts.
- **Version Control**: Commit database schema changes along with the corresponding code changes.

## Security Considerations
- **Admin User**: 
  - Change the default admin credentials after initial setup
  - Use strong, randomly generated passwords
  - Enable two-factor authentication if possible
- **Production Environment**: 
  - Avoid running `clean-database` or `create-admin-user` in production unless absolutely necessary
  - Restrict database access to only necessary IPs and users
  - Regularly rotate database credentials
  - Use SSL/TLS for database connections
  - Implement proper user role permissions

---

For more information or adjustments, consult the project documentation or contact the development team.
