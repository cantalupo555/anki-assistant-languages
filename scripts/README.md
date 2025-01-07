# Database Setup Scripts

This directory contains scripts to configure and initialize the project's database. Below is a description of each script and the correct execution order.

---

## Available Scripts

### 1. `checkDatabaseConnection.ts`
- **Description**: Verifies the database connection and validates the existence of required tables, extensions, and permissions.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn check-db-connection
  ```

### 2. `createUsersTable.ts`
- **Description**: Creates the `users` table and configures related indexes, triggers, and functions.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn create-users-table
  ```

### 3. `createUserSettingsTable.ts`
- **Description**: Creates the `user_settings` table and configures indexes, triggers, and related functions.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-user-settings-table
  ```

### 4. `createTokensContextTable.ts`
- **Description**: Creates the `tokens_context` table and configures indexes.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-tokens-context-table
  ```

### 5. `createTokensTable.ts`
- **Description**: Creates the `user_tokens` table and configures indexes and foreign keys.
- **Dependencies**: The `users` and `tokens_context` tables must exist.
- **Command**:
  ```bash
  yarn create-tokens-table
  ```

### 6. `createAdminUser.ts`
- **Description**: Creates the default admin user with random credentials.
- **Dependencies**: The `users` table must exist.
- **Command**:
  ```bash
  yarn create-admin-user
  ```

### 7. `cleanDatabase.ts`
- **Description**: Cleans the database by dropping all tables, functions, and triggers. Includes a dry-run mode for safety checks.
- **Dependencies**: None.
- **Command**:
  ```bash
  yarn clean-database
  ```
  - **Dry-Run Mode**: Use the `--dry-run` flag to list what would be cleaned without executing the operations.
    ```bash
    yarn clean-database --dry-run
    ```
  - **Safety**: Prevents execution in production environments.

---

## Recommended Execution Order

Run the scripts in the following order:

1. **`check-db-connection`**: Verifies the database connection before proceeding with any operations.
   ```bash
   yarn check-db-connection
   ```

2. **`create-users-table`**: Creates the `users` table, which is the foundation for all other tables.
   ```bash
   yarn create-users-table
   ```

3. **`create-user-settings-table`**: Creates the `user_settings` table, which depends only on the `users` table.
   ```bash
   yarn create-user-settings-table
   ```

4. **`create-tokens-context-table`**: Creates the `tokens_context` table, which depends only on the `users` table.
   ```bash
   yarn create-tokens-context-table
   ```

5. **`create-tokens-table`**: Creates the `user_tokens` table, which depends on the `users` and `tokens_context` tables.
   ```bash
   yarn create-tokens-table
   ```

6. **`create-admin-user`**: Creates the default admin user, which depends on the `users` table.
   ```bash
   yarn create-admin-user
   ```

7. **`clean-database`**: Use this script to reset the database during development. **Use with caution!**
   ```bash
   yarn clean-database
   ```

After execution, you can use the `check-db-connection` script again to validate if everything was set up correctly.

---

## Required Environment Variables

Make sure to configure the following environment variables in the `.env` file before running the scripts:

- `DB_USER`: Database username.
- `DB_HOST`: Database host address.
- `DB_DATABASE`: Database name.
- `DB_PASSWORD`: Database password.
- `DB_PORT`: Database port (default: `5432`).

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

## Notes

- **Production Environment**: In production, consider securing the admin user credentials and avoiding automatic execution of the `createAdminUser.ts` and `cleanDatabase.ts` scripts.
- **Logs**: The admin user credentials are displayed in the log after running the `createAdminUser.ts` script. Make sure to log this information in a secure location.
- **Clean Database**: Use the `cleanDatabase.ts` script only during development. It is a destructive operation and should not be used in production.

---

For more information or adjustments, consult the project documentation or contact the development team.
