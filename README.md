# Anki Assistant Languages

## Description

Anki Assistant Languages is a web application that assists in the creation of flashcards for Anki, focused on language learning. Using Anthropic's Claude API or OpenRouter API, the system generates definitions and example sentences in multiple languages for the desired word or expression. Additionally, it offers Text-to-Speech (TTS) support with Google Cloud and Azure APIs, allowing the addition of audio to the cards. The application also includes features for analyzing the frequency and generating a short dialogue using the word or expression.

## Features

* **Definition and Sentence Generation:** Provide a word or expression and the target language, and the system automatically generates definitions and example sentences using the Claude API.
* **TTS Support:** Add audio to your cards with TTS. Choose between Google Cloud or Azure voices and customize the speed and tone of the speech.
* **Sentence Translation:** Translate the generated sentences into your native language for better understanding.
* **Analyze Frequency:** Get an analysis of the frequency of use for a given word or expression in the target language, including information about its usage in different contexts.
* **Generate Dialogue:** Create a short dialogue in the target language that demonstrates the use of a given word or idiomatic expression.
* **Export to Anki:** Export the generated sentences and definitions, along with audio (optional), in a format compatible with Anki.
* **User-friendly Interface:** Intuitive and easy-to-use web interface for quick and efficient flashcard creation.
* **Language Customization:** Select your native language and the language you are learning.

## How to Use

1. **Access the Application:** Open the web application in your browser.
2. **Select Languages:** Choose your native language and the target language you are learning.
3. **Type the Word or Expression:** Enter the word or expression you want to add to Anki.
4. **Generate Sentences and Definitions:** Click the "Generate" button to generate the definitions and example sentences.
5. **Listen TTS (Optional):** Select the desired TTS service and voice, and click the "Listen" button to hear the sentence.
6. **Translate the Sentence (Optional):** Click the "Translate this sentence" button to translate the sentence into your native language.
7. **Analyze Frequency (Optional):** Click the "Analyze Frequency" button to get an analysis of the frequency of use for the word or expression in the target language.
8. **Generate Dialogue (Optional):** Click the "Generate Dialogue" button to create a short dialogue in the target language that demonstrates the use of the word or expression.
9. **Save the Sentences:** Select the sentences you want to save and click the "Save Sentence" button.
10. **Export to Anki:** Click the "Export" button to download a .zip file containing the sentences, definitions, and audio files (if any) in a format compatible with Anki.

## Installation and Setup

**Prerequisites:**

* Clone the Anki Assistant Languages repository from GitHub.
* Node.js, npm and yarn installed.
* API keys for Claude, OpenRouter, Google Cloud TTS, and Azure TTS.

**Frontend:**

1. Navigate to the `frontend` folder.
2. Run `yarn install` to install the dependencies.
3. Run `yarn run start` to start the development server.

**Backend**

1. Navigate to the project's root folder.
2. Run `yarn install` to install the dependencies.
3. **Edit the `.env` file in the project's root folder and add the API keys.**
4. Run `yarn run start` to start the backend server.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.
