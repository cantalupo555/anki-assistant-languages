
```
anki-assistant-languages/
│
├── frontend/                         # Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/               # Directory for React components
│   │   │   ├── Notifications.tsx     # Notifications component
│   │   │   └── languageSelector.tsx  # New LanguageSelector component
│   │   ├── utils/                    # Directory for utility modules
│   │   │   ├── languageCardExporter.ts # Module for exporting data to Anki
│   │   │   ├── markdownStripper.ts     # Module for removing Markdown formatting for TTS
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
│   ├── googleCloudTTS.ts             # Interaction with Google Cloud TTS
│   └── expressServer.ts              # Express server
├── package.json                      # Backend dependencies
├── tsconfig.json                     # TypeScript configuration
├── ...
├── README.md                         # README
└── .env                              # Environment variables file (API key)
```
