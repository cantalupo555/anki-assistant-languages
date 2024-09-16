# Anki Assistant Languages

## Description

Anki Assistant Languages is a web application that assists in the creation of flashcards for Anki, focused on language learning. Using Anthropic's Claude API, the system generates definitions and example sentences in multiple languages for the desired word. Furthermore, it offers Text-to-Speech (TTS) support with Google Cloud and Azure APIs, allowing the addition of audio to the cards.

## Features

* **Generation of definitions and sentences:** You provide a word and the target language, and the system automatically generates definitions and example sentences using the Claude API.
* **TTS support:** Add audio to your cards with the TTS feature. Choose between Google Cloud or Azure voices and personalize the speed and tone of the speech.
* **Sentence translation:** Translate the generated sentences into your native language for a better understanding.
* **Export to Anki:** Export the generated sentences and definitions, along with audio (optional), in a format compatible with Anki.
* **User-friendly interface:** Intuitive and easy-to-use web interface, enabling quick and efficient flashcard creation.
* **Language customization:** Select your native language and the language you are learning.

## How to Use

1. **Access the application:** Open the web application in your browser.
2. **Select the languages:** Choose your native language and the target language you are learning.
3. **Type the word:** Enter the word you want to add to Anki.
4. **Generate sentences and definitions:** Click the "Generate" button to generate the definitions and example sentences.
5. **Add audio (optional):** Select the desired TTS service and voice and click the "Listen" button to hear the sentence.
6. **Translate the sentence (optional):** Click the "Translate this sentence" button to translate the sentence into your native language.
7. **Save the sentences:** Select the sentences you want to save and click the "Save Sentence" button.
8. **Export to Anki:** Click the "Export" button to download a .zip file containing the sentences, definitions, and audio files (if any) in a format compatible with Anki.

## Installation and Execution (for Developers)

**Prerequisites:**

* Node.js and npm installed.
* API keys for Claude, Google Cloud TTS, and Azure TTS.

**Frontend:**

1. Navigate to the `frontend` folder.
2. Run `yarn install` to install the dependencies.
3. Run `yarn run start` to start the development server.

**Backend:**

1. Navigate to the project's root folder.
2. Run `npm install` to install the dependencies.
3. **Edit the `.env` file in the project's root folder and add the API keys.**
4. Run `npm run start` to start the backend server.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
