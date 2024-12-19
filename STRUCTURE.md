# Project Structure

This document provides an overview of the project structure for the `anki-assistant-languages` project.

## Directory Structure

<pre>
anki-assistant-languages/
│
├── frontend/                         # Frontend application built with React
│   ├── public/
│   │   └── assets/                         # Directory for downloadable assets
│   │       └── AnkiAssistantLanguages.apkg # Anki note type file for importing cards
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Footer.tsx            # Footer component for the application
│   │   │   ├── Header.tsx            # Header component for the application
│   │   │   ├── LanguageSelector.tsx  # Component for selecting native and target languages
│   │   │   ├── Login.tsx             # Login component for user authentication
│   │   │   ├── Modal.tsx             # Reusable modal component for displaying information
│   │   │   └── Notifications.tsx     # Component for displaying notifications to the user
│   │   ├── context/
│   │   │   └── selectionContext.tsx  # Context API for managing application state (languages, API services, etc.)
│   │   ├── styles/                   # CSS stylesheets
│   │   │   ├── App.css               # Styles for the main application
│   │   │   ├── Login.css             # Styles for the login component
│   │   │   └── Modal.css             # Styles for the modal component
│   │   ├── utils/                    # Utility functions and modules
│   │   │   ├── handleAnalyzeFrequency.ts # Function to handle word frequency analysis
│   │   │   ├── handleGenerateDialogue.ts # Function to handle generating dialogue
│   │   │   ├── handleSubmit.ts         # Function to handle form submission
│   │   │   ├── handleTranslation.ts    # Function to handle translation of sentences
│   │   │   ├── languageCardExporter.ts # Exports language learning data to Anki format
│   │   │   ├── markdownStripper.ts     # Removes Markdown formatting from text before TTS processing
│   │   │   ├── Options.ts              # Configuration for available API services, LLM models, and TTS services
│   │   │   ├── Types.ts                # Type definitions for the project
│   │   │   ├── useAuth.ts              # Authentication logic and user session management
│   │   │   └── voiceOptions.ts         # Configuration for available TTS voices
│   │   └── App.tsx                   # Main React application component
│   ├── package.json                  # Frontend dependencies (yarn)
│   ├── tsconfig.json                 # TypeScript configuration
│   └── ...
│
├── scripts/                          # Scripts for development and maintenance
│   ├── checkDatabaseConnection.ts    # Script to check the database connection
│   └── createUsersTable.ts           # Script to create the users table in the database
│
├── src/                              # Backend application built with Express.js and TypeScript
│   ├── anthropicClaude.ts            # Handles interactions with the Anthropic Claude API
│   ├── azureTTS.ts                   # Handles interactions with the Azure Text-to-Speech API
│   ├── expressServer.ts              # Main Express.js server file
│   ├── googleCloudTTS.ts             # Handles interactions with the Google Cloud Text-to-Speech API
│   ├── googleGemini.ts               # Handles interactions with the Google Gemini API
│   └── openRouter.ts                 # Handles interactions with the OpenRouter API
│
├── .env                              # Environment variables (API keys, etc.) - NOT tracked in version control
├── package.json                      # Backend dependencies (yarn)
├── README.md                         # Project overview and instructions
├── STRUCTURE.md                      # Project structure documentation
├── TODO.md                           # Project task tracking list
├── tsconfig.json                     # TypeScript configuration
└── ...
</pre>

## Environment Variables

The `.env` file contains sensitive information and should **not** be committed to version control.  The following environment variables are expected:

- `ANTHROPIC_CLAUDE_API_KEY`: Anthropic Claude API key.
- `AZURE_SPEECH_REGION`: Azure Speech Region.
- `AZURE_SPEECH_RESOURCE_KEY`: Azure Speech Resource Key.
- `DB_DATABASE`: Name of the PostgreSQL database.
- `DB_HOST`: Host address for the PostgreSQL database.
- `DB_PASSWORD`: Password for the PostgreSQL database.
- `DB_PORT`: Port number for the PostgreSQL database.
- `DB_USER`: Username for the PostgreSQL database.
- `GOOGLE_CLOUD_TTS_API_KEY`: Google Cloud Text-to-Speech API key.
- `GOOGLE_GEMINI_API_KEY`: Google Cloud Gemini API Key.
- `OPENROUTER_API_KEY`: OpenRouter API Key.
- `OPENROUTER_YOUR_SITE_NAME`: OpenRouter Name of your site.
- `OPENROUTER_YOUR_SITE_URL`: OpenRouter URL of your site.

## Notes

- **README.md**: The main documentation file for the project, providing an overview, setup instructions, and usage details.
- **scripts/checkDatabaseConnection.ts**: A script to test the connection to the PostgreSQL database using the environment variables.
- **scripts/createUsersTable.ts**: A script to create the users table in the database.
- **todoList.md**: A list of tasks and features to be implemented in the project.
