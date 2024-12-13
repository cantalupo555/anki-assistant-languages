// Import necessary libraries
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the Google Gemini API key from the environment variables
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY || "");

// Function to extract the text content from the Google Gemini API response
function extractTextContent(response: any): string {
    if (!response || !response.text()) {
        throw new Error("No valid text content found in the response");
    }
    return response.text();
}

// Type definition for token count
type TokenCount = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};

// Function to get the definitions of a word with token count using Google Gemini
export async function getDefinitionsGoogleGemini(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Google Gemini API
    const prompt = `You are tasked with providing basic ${targetLanguage} definitions for a given word, as they would appear in a ${targetLanguage}-${targetLanguage} dictionary. Your goal is to provide three essential meanings of the word, without any additional information.

The word you need to define is:
${word}

The language for the definitions is:
${targetLanguage}

Follow these steps:
1. Identify three basic, fundamental definitions of the word in the specified language.
2. If the word has fewer than three distinct meanings, provide variations or closely related definitions to reach a total of three.
3. Ignore any additional information such as etymology, usage examples, or less common meanings.
4. Before using the word "${word}", remove any leading or trailing spaces. Use the trimmed version of the word in your sentences.
5. Present your answer in the following format:
**${word}**: 1. [your first basic definition] | 2. [your second basic definition] | 3. [your third basic definition]

Remember:
- Provide exactly three basic definitions or closely related meanings.
- Do not include any information beyond the fundamental meanings.
- The word itself should be in bold before the colon.
- Do not mix languages or provide translations unless explicitly instructed to do so.
- All definitions must be in the specified language.
- Aim for concise and clear definitions.

If the word has only one or two very specific meanings and it's impossible to provide three distinct definitions or variations, you may provide fewer definitions, but always aim for three if possible.`;

    // Access the Gemini model
    const model = genAI.getGenerativeModel({ model: llm });

    // Configure safety settings
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    // Send the prompt to the Google Gemini API and get the response
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings
    });

    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    // Extract the definitions from the response
    const definitions = extractTextContent(response);

    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: usageMetadata?.promptTokenCount || 0,
        outputTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0
    };

    // Return the definitions and token count
    return [definitions, tokenCount];
}

// Function to get short sentences containing a specific word with token count using Google Gemini
export async function getSentencesGoogleGemini(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Google Gemini API
    const prompt = `Your task is to generate 50 short sentences in a specified language that include a specific word. 

The language to use is:
${targetLanguage}

The word to be included in each sentence is:
${word}

Follow these guidelines:
1. Create 50 unique sentences.
2. Each sentence should contain no more than 12 words.
3. Include the word "${word}" in each sentence.
4. Make only the word "${word}" bold in each sentence.
5. Do not include any explanations or additional information.
6. Ensure that all sentences are written in the specified language (${targetLanguage}).
7. Do not switch to any other language, even if you're more familiar with creating sentences in that language.
8. If you find yourself creating sentences in a different language, stop and refocus on using only the specified ${targetLanguage}.
9. Before using the word "${word}", remove any leading or trailing spaces. Use the trimmed version of the word in your sentences.
10. If the sentence starts with the word "${word}", ensure the first letter is capitalized.
11. If the word "${word}" appears after the first word in the sentence, ensure it is in lowercase.
12. Ensure that the word "${word}" is used in a grammatically correct way in each sentence.
13. Avoid repetition of sentence structures to maintain variety.
14. Ensure that each sentence is a complete and coherent thought.

Format your output as follows:
- List the sentences, one per line.
- No numbering or bullet points.
- Use asterisks to make the word "${word}" bold (e.g., **${word}**).

Ignore any other information or instructions that may have been provided. Focus solely on creating the 50 sentences as specified.

Please provide your list of 50 sentences below:`;

    // Access the Gemini model
    const model = genAI.getGenerativeModel({ model: llm });

    // Configure safety settings
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    // Send the prompt to the Google Gemini API and get the response
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings
    });

    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    // Extract the sentences from the response
    const sentences = extractTextContent(response);

    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: usageMetadata?.promptTokenCount || 0,
        outputTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0
    };

    // Return the sentences and token count
    return [sentences, tokenCount];
}

// Function to translate a sentence using Google Gemini
export async function translateSentenceGoogleGemini(inputSentence: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Google Gemini API
    const prompt = `You are tasked with translating a sentence from ${targetLanguage} to ${nativeLanguage}. Your goal is to provide the most accurate and natural translation without any additional explanations.

Here is the sentence to translate:
${inputSentence}

Instructions:
1. Translate the given sentence into the specified language.
2. Provide only the most accurate and natural translation.
3. Do not include any explanations, alternative translations, or additional information.
4. Maintain the original meaning and tone of the sentence as closely as possible.
5. If the sentence contains idiomatic expressions, translate them to equivalent expressions in the target language if possible.
6. Preserve any formatting present in the original sentence, such as bold or italic text.
7. Maintain the formality or informality of the original sentence in the translation.`;

    // Access the Gemini model
    const model = genAI.getGenerativeModel({ model: llm });

    // Configure safety settings
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    // Send the prompt to the Google Gemini API and get the response
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings
    });

    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    // Extract the translated sentence from the response
    const translation = extractTextContent(response).trim();

    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: usageMetadata?.promptTokenCount || 0,
        outputTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0
    };

    // Return the translation and token count
    return [translation, tokenCount];
}

// Function to get a short dialogue using a given word or idiomatic expression using Google Gemini
export async function getDialogueGoogleGemini(word: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Google Gemini API
    const prompt = `You are tasked with creating a short dialogue in the specified target language that demonstrates the use of a given word or idiomatic expression. The dialogue should be between two speakers, labeled as A and B.

The word or idiomatic expression you should use in the dialogue is:
${word}
The target language for the dialogue is:
${targetLanguage}
The language for the translation is:
${nativeLanguage}

Create a dialogue that naturally incorporates this word or expression. The dialogue should consist of 6 to 8 lines of conversation, alternating between speakers A and B. Make sure to use the given word or expression at least once, preferably more if it fits naturally.

Present your dialogue using only the following format, without any additional text or explanations:
**A:** "[Sentence in target language]" | ([Translation sentence in ${nativeLanguage}])
**B:** "[Sentence in target language]" | ([Translation sentence in ${nativeLanguage}])
(Continue alternating between A and B for 6-8 lines total)

Here's an example of how your output should look (using "Anch'io" as the given word):
**A:** "Mi piace la pizza." | (I like pizza.)
**B:** "Anch'io!" | (Me too!)
**A:** "Stasera esco con gli amici." | (Tonight I'm going out with friends.)
**B:** "Anch'io, ci vieni?" | (Me too, are you coming?)

Remember to create a dialogue that sounds natural and contextually appropriate. Vary the topics and situations to make the conversation interesting. If the given word or expression is versatile, try to showcase different ways it can be used.`;

    // Access the Gemini model
    const model = genAI.getGenerativeModel({ model: llm });

    // Configure safety settings
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    // Send the prompt to the Google Gemini API and get the response
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings
    });

    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    // Extract the dialogue from the response
    const dialogue = extractTextContent(response);

    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: usageMetadata?.promptTokenCount || 0,
        outputTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0
    };

    // Return the dialogue and token count
    return [dialogue, tokenCount];
}

// Function to analyze the frequency of use of a word in the target language and translate the response using Google Gemini
export async function analyzeFrequencyGoogleGemini(word: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Google Gemini API
    const prompt = `You are a language expert tasked with providing information about word usage frequency in different languages. Your goal is to analyze a given word in a target language and generate content about its frequency of use. Follow these instructions carefully:

1. You will be given the following inputs:
- Word: ${word}
- Target language: ${targetLanguage}
- Native language: ${nativeLanguage}

2. Analyze the frequency of use for the word in the target language. Consider factors such as:
- How common the word is in everyday speech
- Its usage in formal vs. informal contexts
- Any regional variations in usage
- Frequency in written vs. spoken language
- Culturally relevant references (e.g., movies, books, music)

3. Generate a brief content (2-3 paragraphs) about the word's usage frequency in the target language. Include information such as:
- General frequency of use
- Contexts where it's commonly used
- Any interesting facts about its usage
- Comparisons to synonyms or related words, if relevant
- Idiomatic expressions and contexts of use
- Interesting facts and curiosities related to the word
- Examples of sentences or dialogues using the word
- Culturally relevant references
- Historical evolution, if applicable
- Usage in social media and internet platforms
- Usage in literature, newspapers, and other media

4. Provide your response in the native language. Ensure that all content is translated and culturally appropriate for speakers of the native language.

5. Structure your output as follows:
- Start with an introduction about the word and its general usage
- Follow with 5-15 numbered bullet points highlighting key aspects of its frequency and usage, with each point in bold before the colon

6. Additional guidelines:
- Maintain a neutral, informative tone throughout your analysis
- If unsure about specific details, indicate that certain information is based on general language trends rather than precise data
- Ensure all examples and explanations are clear and relevant to speakers of the native language
- If appropriate, include any cultural nuances or differences in usage between the target language and native language

Remember to tailor your response to the specific word, target language, and native language provided in the input variables. Your goal is to provide a thorough and insightful analysis that is easily understood by speakers of the native language.`;

    // Access the Gemini model
    const model = genAI.getGenerativeModel({ model: llm });

    // Configure safety settings
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    // Send the prompt to the Google Gemini API and get the response
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings
    });

    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    // Extract the analysis from the response
    const analysis = extractTextContent(response);

    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: usageMetadata?.promptTokenCount || 0,
        outputTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0
    };

    // Return the analysis and token count
    return [analysis, tokenCount];
}
