# Project Structure

This document provides an overview of the project structure for the `anki-assistant-languages` project.

## Directory Structure

<pre>
anki-assistant-languages/
│
├── frontend/                         # Frontend application built with React
│   ├── public/
│   │   ├── assets/                   # Directory for downloadable assets
│   │   │   └── AnkiAssistantLanguages.apkg # Anki note type file for importing cards
│   │   ├── favicon.ico               # Website favicon
│   │   ├── index.html                # Main HTML template
│   │   ├── logo192.png               # Application logo (192x192)
│   │   ├── logo512.png               # Application logo (512x512)
│   │   ├── manifest.json             # PWA manifest
│   │   └── robots.txt                # Robots exclusion file
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── AuthWrapper.tsx       # Authentication wrapper component
│   │   │   ├── DialogueModal.tsx     # Modal for displaying generated dialogues
│   │   │   ├── Footer.tsx            # Footer component
│   │   │   ├── FrequencyAnalysisModal.tsx # Modal for frequency analysis results
│   │   │   ├── Header.tsx            # Header component
│   │   │   ├── LanguageSelector.tsx  # Language selection component
│   │   │   ├── Login.tsx             # Login form component
│   │   │   ├── Modal.tsx             # Base modal component
│   │   │   ├── Notifications.tsx     # Notification system
│   │   │   ├── Preloader.tsx         # Loading indicator component
│   │   │   ├── Register.tsx          # User registration form
│   │   │   └── Stats.tsx             # Statistics display component
│   │   ├── context/
│   │   │   └── selectionContext.tsx  # Context API for managing application state
│   │   ├── styles/                   # Styled-components and CSS modules
│   │   │   ├── AppStyles.ts          # Main application styles
│   │   │   ├── ButtonStyles.ts       # Button component styles
│   │   │   ├── CssVariables.ts       # CSS variables configuration
│   │   │   ├── FooterStyles.ts       # Footer styles
│   │   │   ├── GlobalStyles.ts       # Global styles
│   │   │   ├── HeaderStyles.ts       # Header styles
│   │   │   ├── LoginStyles.ts        # Login form styles
│   │   │   └── ModalStyles.ts        # Modal styles
│   │   ├── utils/                    # Utility functions and modules
│   │   │   ├── handleAnalyzeFrequency.ts # Word frequency analysis
│   │   │   ├── handleGenerateDefinitions.ts # Definition generation
│   │   │   ├── handleGenerateDialogue.ts # Dialogue generation
│   │   │   ├── handleGenerateSentences.ts # Sentence generation
│   │   │   ├── handleGenerateTTS.ts  # Text-to-speech generation
│   │   │   ├── handleSubmit.ts       # Form submission handling
│   │   │   ├── handleTranslation.ts  # Translation handling
│   │   │   ├── languageCardExporter.ts # Anki card export
│   │   │   ├── markdownStripper.ts   # Markdown formatting removal
│   │   │   ├── Options.ts            # API service configurations
│   │   │   ├── Types.ts              # Type definitions
│   │   │   ├── useAuth.ts            # Authentication hooks
│   │   │   └── voiceOptions.ts       # TTS voice configurations
│   │   ├── App.tsx                   # Main application component
│   │   ├── AppInner.tsx              # Inner application layout
│   │   ├── index.tsx                 # Application entry point
│   │   └── logo.svg                  # Application logo
│   ├── package.json                  # Frontend dependencies
│   └── tsconfig.json                 # TypeScript configuration
│
├── scripts/                          # Database and maintenance scripts
│   ├── checkDatabaseConnection.ts    # Database connection test
│   ├── cleanDatabase.ts              # Database cleanup script
│   ├── createAdminUser.ts            # Admin user creation
│   ├── createTokensContextTable.ts   # Tokens context table creation
│   ├── createTokensTable.ts          # Tokens table creation
│   ├── createUserSettingsTable.ts    # User settings table creation
│   ├── createUsersTable.ts           # Users table creation
│   └── README.md                     # Documentation for database scripts
│
├── src/                              # Backend application
│   ├── middlewares/                  # Express middlewares
│   │   └── authMiddleware.ts         # Authentication middleware
│   ├── anthropicClaude.ts            # Anthropic Claude API handler
│   ├── azureTTS.ts                   # Azure Text-to-Speech handler
│   ├── expressServer.ts              # Express server configuration
│   ├── googleCloudTTS.ts             # Google Cloud TTS handler
│   ├── googleGemini.ts               # Google Gemini API handler
│   └── openRouter.ts                 # OpenRouter API handler
│
├── .env.tmp                          # Environment variables template
├── .gitignore                        # Git ignore rules
├── CONVENTIONS.md                    # Code conventions
├── package.json                      # Backend dependencies
├── README.md                         # Project documentation
├── STRUCTURE.md                      # Project structure documentation
├── TODO.md                           # Task tracking
└── tsconfig.json                     # TypeScript configuration
</pre>

## Environment Variables

The `.env` file (created from `.env.tmp`) contains sensitive information and should **not** be committed to version control. Required variables include:

- `ANTHROPIC_CLAUDE_API_KEY`: Anthropic Claude API key
- `AZURE_SPEECH_REGION`: Azure Speech Region
- `AZURE_SPEECH_RESOURCE_KEY`: Azure Speech Resource Key
- `DB_DATABASE`: PostgreSQL database name
- `DB_HOST`: Database host address
- `DB_PASSWORD`: Database password
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `GOOGLE_CLOUD_TTS_API_KEY`: Google Cloud TTS API key
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API key
- `OPENROUTER_API_KEY`: OpenRouter API key
- `OPENROUTER_YOUR_SITE_NAME`: OpenRouter site name
- `OPENROUTER_YOUR_SITE_URL`: OpenRouter site URL

## Notes

- **Frontend**: Built with React using functional components and hooks. Uses Context API for state management and styled-components for styling.
- **Backend**: Built with Express.js and TypeScript. Includes handlers for multiple AI APIs and TTS services.
- **Database**: PostgreSQL with scripts for table creation and maintenance.
- **Testing**: Follows the conventions outlined in CONVENTIONS.md for unit and integration tests.
- **Documentation**: Maintained through README.md, CONVENTIONS.md, and STRUCTURE.md files.
