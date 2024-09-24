
```
anki-assistant-languages/
│
├── frontend/                         # Frontend
│   ├── public/
│   │   ├── assets/                   # Directory for downloadable assets
│   │   │   └── AnkiAssistantLanguages.apkg # Anki note type file for importing cards
│   ├── src/
│   │   ├── components/               # Directory for React components
│   │   │   ├── languageSelector.tsx  # LanguageSelector component
│   │   │   └── Notifications.tsx     # Notifications component
│   │   ├── context/
│   │   │   └── selectionContext.tsx  # Manages the context for language and service selections
│   │   ├── utils/                    # Directory for utility modules
│   │   │   ├── languageCardExporter.ts # Module for exporting data to Anki
│   │   │   ├── markdownStripper.ts     # Module for removing Markdown formatting for TTS
│   │   │   ├── Types.ts                # Contains type definitions for the project
│   │   │   └── voiceOptions.ts         # Module for voice options for Google Cloud TTS and Azure Speech
│   │   ├── App.tsx                   # Main React component
│   │   └── App.css                   # CSS styles for the App.tsx component
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
