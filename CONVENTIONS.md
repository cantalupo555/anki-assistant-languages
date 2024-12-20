# Code Conventions

This file defines the code conventions that should be followed in this project. The goal is to maintain consistency, readability, and facilitate collaboration.

## General

-   **Language:** Use TypeScript for both frontend and backend.
-   **Formatting:** Use Prettier for automatic code formatting.
-   **Linting:** Use ESLint for static code analysis and error detection.
-   **File Names:** Use `camelCase` for file and folder names (e.g., `myFolder`, `myFile.tsx`).
-   **Variable and Function Names:** Use `camelCase` for variable and function names (e.g., `myVariable`, `myFunction()`).
-   **React Component Names:** Use `PascalCase` for React component names (e.g., `MyComponent`).
-   **Comments:** Comment the code clearly and concisely, explaining the purpose of complex code blocks.
-   **Imports:** Organize imports alphabetically and separate imports from external libraries from internal imports.
-   **Typing:** Use strong typing whenever possible, especially in TypeScript.

## Frontend (React/TypeScript)

-   **Components:** Create reusable components and keep them small and focused on a single responsibility.
-   **State Management:** Use React's Context API for global state management.
-   **Styling:** Use CSS Modules for component styling.
-   **Hooks:** Use hooks for state logic and side effects.
-   **Tests:** Write unit and integration tests for important routes and functions.
    -   **Tools:** Use Jest and React Testing Library for unit tests.
    -   **Folder Structure:** Create test files with the extension `.test.tsx` or `.test.ts` in the `__tests__` directory within each module to group related tests.
-   **Test Types**
    -   **Unit Tests:** Test individual units of code (functions, components).
    -   **Integration Tests:** Test the interaction between different parts of the system.
    -   **End-to-End (E2E) Tests:** Test the complete system, simulating user interaction.
        -   **Tools:** Use Cypress or Playwright for E2E tests.
-   **Logs:** Use logs to monitor the application's behavior.
    -   **Frontend:** Use `console` or libraries like `loglevel` to record logs.
        -   **Log Levels**
            -   Use the following log levels:
                -   `debug`: For detailed information during development.
                -   `info`: For general information about the application's operation.
                -   `warn`: For situations that may cause problems.
                -   `error`: For errors that prevent the application from working.
    -   **Log Format**
        -   Use a consistent log format, including timestamp, log level, and message.
        -   Example: `[2023-10-27 10:00:00] INFO: User logged in successfully`.
-   **Error Handling:** Implement error handling to display user-friendly messages and record errors for debugging. Use `try...catch` to catch errors and display appropriate error messages in the user interface.
-   **Folder Structure:**
    -   `src`: Frontend source code.
    -   `src/components`: Reusable components.
    -   `src/context`: React contexts.
    -   `src/styles`: CSS styles.
    -   `src/utils`: Utility functions.
    -   `src/assets`: Images, fonts, and other static files.

## Backend (Node.js/TypeScript)

-   **Database:** Use direct SQL queries with `pg` to interact with the database.
    -   **Database System:** PostgreSQL
    -   **SQL Queries:** Construct SQL queries carefully to prevent SQL injection vulnerabilities. Use parameterized queries with `pg` to safely handle user inputs.
      ```typescript
      const query = 'SELECT * FROM users WHERE email = $1';
      const values = [email];
      client.query(query, values, (err, res) => {
          if (err) {
              console.error('Error executing query', err.stack);
              return;
          }
          console.log(res.rows);
      });
      ```
    -   **Transactions:** Use database transactions to ensure data consistency when performing multiple operations.
      ```typescript
      client.query('BEGIN', (err) => {
          if (err) {
              console.error('Error starting transaction', err.stack);
              return;
          }
          client.query('INSERT INTO users(name) VALUES($1)', ['Alice'], (err) => {
              if (err) {
                  console.error('Error inserting user', err.stack);
                  client.query('ROLLBACK', (err) => {
                      if (err) {
                          console.error('Error rolling back transaction', err.stack);
                      }
                  });
                  return;
              }
              client.query('COMMIT', (err) => {
                  if (err) {
                      console.error('Error committing transaction', err.stack);
                      return;
                  }
                  console.log('Transaction completed successfully');
              });
          });
      });
      ```
    -   **Query Organization:** Consider organizing SQL queries in separate files or modules for better maintainability.
      ```typescript
      // queries/userQueries.ts
      export const getUserByEmail = 'SELECT * FROM users WHERE email = $1';
      export const insertUser = 'INSERT INTO users(name, email) VALUES($1, $2)';
      ```
    -   **Error Handling:** Implement proper error handling when executing database queries. Log errors and return appropriate error messages to the client.
      ```typescript
      client.query(query, values, (err, res) => {
          if (err) {
              console.error('Error executing query', err.stack);
              // Retorne uma mensagem de erro genérica ao cliente
              return res.status(500).json({ error: 'Internal Server Error' });
          }
          // Processar o resultado da consulta
          res.json(res.rows);
      });
      ```
-   **Routes:** Organize routes logically and use middlewares for authentication and validation.
    -   **Folder Structure:** Create a `routes` directory to group routes by functionality.
    -   **Middlewares:** Create a `middlewares` directory to group middlewares.
-   **Tests:** Write unit and integration tests for important routes and functions.
    -   **Tools:** Use Jest for unit tests and Supertest for integration tests.
    -   **Folder Structure:** Create test files with the extension `.test.ts` in the `__tests__` directory within each module to group related tests.
-   **Test Types**
    -   **Unit Tests:** Test individual units of code (functions, components).
    -   **Integration Tests:** Test the interaction between different parts of the system.
    -   **End-to-End (E2E) Tests:** Test the complete system, simulating user interaction.
-   **Environment Variables:** Use `.env` files to store environment variables.
-   **Error Handling:** Implement error handling to catch unexpected errors and return appropriate error responses to the client. Use `try...catch` to catch errors and return appropriate HTTP status codes (e.g., 500 for internal server errors) with detailed error messages in JSON.
-   **Security:** Implement security measures such as input data validation, protection against XSS and CSRF attacks, and use HTTPS for secure communication.
-   **Logs:** Use logs to monitor the application's behavior.
    -   **Backend:** Use `console` or libraries like `winston` to record logs in a structured and flexible way.
        -   **Log Levels**
            -   Use the following log levels:
                -   `debug`: For detailed information during development.
                -   `info`: For general information about the application's operation.
                -   `warn`: For situations that may cause problems.
                -   `error`: For errors that prevent the application from working.
    -   **Log Format**
        -   Use a consistent log format, including timestamp, log level, and message.
        -   Example: `[2023-10-27 10:00:00] INFO: User logged in successfully`.
-   **Folder Structure:**
    -   `src`: Backend source code.
    -   `src/routes`: Routes grouped by functionality.
    -   `src/middlewares`: Middlewares for authentication and validation.
    -   `scripts`: Scripts for tasks such as creating database tables.

## API

-   **Data Format:** Use JSON for communication between frontend and backend.
-   **Endpoint Names:** Use descriptive names for API endpoints.
-   **HTTP Status Codes:** Use appropriate HTTP status codes to indicate the result of requests.
-   **Authentication:** Use a secure authentication system (such as JWT).
-   **API Versioning:** Use API versioning in the endpoint path (e.g., `/v1/users`, `/v2/products`).
    -   **Compatibility:** When introducing changes to the API, maintain compatibility with previous versions whenever possible. If a change breaks compatibility, create a new version of the API.
-   **Documentation:** Keep the API documentation up to date, using tools like Swagger or OpenAPI to generate documentation automatically.

## Tools

-   **IDE:** Use an IDE (Integrated Development Environment) with support for TypeScript, automatic formatting, and static code analysis. We recommend IntelliJ IDEA or WebStorm due to their native integration with Git (VCS), Prettier, and ESLint.
-   **Git:** Use Git for version control and follow an appropriate workflow (e.g., Gitflow). The version control system (VCS) is integrated into the IDE.
-   **Prettier:** Use Prettier for automatic code formatting (integrated into the IDE).
-   **ESLint:** Use ESLint for static code analysis and error detection (integrated into the IDE).
-   **Yarn:** Use Yarn for dependency management.

## Git

### Git Workflow (Gitflow)
-   **`main` (or `master`):** Main branch containing the production code.
-   **`develop`:** Main branch for integrating new features.
-   **`feature/*`:** Branches for developing new features. Create a branch for each new feature from `develop`.
-   **`release/*`:** Branches for preparing releases. Create a branch from `develop` when you are ready to release a new version.
-   **`hotfix/*`:** Branches for urgent fixes in production. Create a branch from `main` when you need to fix an urgent bug.

### Commit Messages
-   Use clear and concise commit messages, explaining the purpose of the change.
-   Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for commit messages.
-   If necessary, you can include a description for the commit. The format of the commit message should be:
    ```markdown
    [Commit title]

    [Commit description with commit details]
    ```
-   Example:
    ```markdown
    feat: Add login functionality

    Implements the login screen with user and password validation.
    Uses JWT for authentication.
    ```

    or

    ```markdown
    fix: Fix bug on registration screen

    Fixes the bug that prevented new users from registering.
    Adds validation to ensure all fields are filled.
    ```

-   **Code Highlighting in Commit Messages:** When mentioning file names, functions, variables, or similar code elements within commit messages, always highlight them using backticks.
-   Example:
    ```markdown
    feat: Update `Login.tsx` component

    This commit updates the `handleLogin` function in the `Login.tsx` component to use the new authentication service.
    ```

## Environment Variables

-   **`.env` File:** The `.env` file must be created from the `.env.tmp` file provided in the repository. To do this, follow the steps below:
    1. Copy the `.env.tmp` file to a new file named `.env`.
    2. Replace the example values with your own credentials and settings.
    3. Make sure the `.env` file is not added to version control, as it contains sensitive information.

-   **Required Environment Variables:**
    -   `ANTHROPIC_CLAUDE_API_KEY`: Anthropic Claude API key.
    -   `AZURE_SPEECH_REGION`: Azure Speech Region.
    -   `AZURE_SPEECH_RESOURCE_KEY`: Azure Speech Resource Key.
    -   `DB_DATABASE`: Name of the PostgreSQL database.
    -   `DB_HOST`: Host address for the PostgreSQL database.
    -   `DB_PASSWORD`: Password for the PostgreSQL database.
    -   `DB_PORT`: Port number for the PostgreSQL database.
    -   `DB_USER`: Username for the PostgreSQL database.
    -   `GOOGLE_CLOUD_TTS_API_KEY`: Google Cloud Text-to-Speech API key.
    -   `GOOGLE_GEMINI_API_KEY`: Google Cloud Gemini API Key.
    -   `OPENROUTER_API_KEY`: OpenRouter API Key.
    -   `OPENROUTER_YOUR_SITE_NAME`: OpenRouter Name of your site.
    -   `OPENROUTER_YOUR_SITE_URL`: OpenRouter URL of your site.

## Notes

-   This file should be updated as needed to reflect changes in project conventions.
-   Feel free to add or modify conventions to better suit the project's needs.
-   If in doubt, consult this file or ask other team members.
