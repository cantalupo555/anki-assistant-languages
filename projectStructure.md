# Project Structure

This document provides an overview of the project structure for the `anki-assistant-languages` project.

## Directory Structure

```
anki-assistant-languages/
│
├── frontend/                         # Frontend
│   ├── public/
│   │   └── assets/                         # Directory for downloadable assets
│   │       └── AnkiAssistantLanguages.apkg # Anki note type file for importing cards
│   ├── src/
│   │   ├── components/               # Directory for React components
│   │   │   ├── languageSelector.tsx  # LanguageSelector component
│   │   │   ├── Login.tsx             # Login component
│   │   │   ├── Modal.tsx             # Modal component
│   │   │   └── Notifications.tsx     # Notifications component
│   │   ├── context/
│   │   │   └── selectionContext.tsx  # Manages the context for language and service selections
│   │   ├── styles/                   # Directory for global CSS styles
│   │   │   ├── App.css               # CSS styles for the App.tsx component
│   │   │   ├── Login.css             # CSS styles for the Login component
│   │   │   └── Modal.css             # CSS styles for the Modal component
│   │   ├── utils/                    # Directory for utility modules
│   │   │   ├── languageCardExporter.ts # Module for exporting data to Anki
│   │   │   ├── markdownStripper.ts     # Module for removing Markdown formatting for TTS
│   │   │   ├── Types.ts                # Contains type definitions for the project
│   │   │   └── voiceOptions.ts         # Module for voice options for Google Cloud TTS and Azure Speech
│   │   └── App.tsx                   # Main React component
│   ├── package.json                  # Frontend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   └── ...
│
├── src/                              # Backend
│   ├── anthropicClaude.ts            # Interaction with Claude
│   ├── azureTTS.ts                   # Interaction with Azure Speech
│   ├── expressServer.ts              # Express server
│   ├── googleCloudTTS.ts             # Interaction with Google Cloud TTS
│   └── openRouter.ts                 # Interaction with OpenRouter
├── .env                              # Environment variables file (API key)
├── package.json                      # Backend dependencies
├── tsconfig.json                     # TypeScript configuration
├── ...
├── projectStructure.md               # Project structure documentation
├── README.md                         # README
├── todoList.md                       # Project task tracking list
└── ...
```

## Notes

- **.env**: This file contains environment variables, such as API keys, that are used by the application. It is not included in version control for security reasons.
- **README.md**: The main documentation file for the project, providing an overview, setup instructions, and usage details.
- **todoList.md**: A list of tasks and features to be implemented in the project.
