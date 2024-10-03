// Import necessary libraries
// dotenv: Used to load environment variables from a .env file
// axios: Used to make HTTP requests to the OpenRouter
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env file
dotenv.config();

// Get the OpenRouter API key, site URL, and site name from the environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_YOUR_SITE_URL = process.env.OPENROUTER_YOUR_SITE_URL;
const OPENROUTER_YOUR_SITE_NAME = process.env.OPENROUTER_YOUR_SITE_NAME;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Function to extract the text content from the OpenRouter API response
function extractTextContent(choices: any[]): string {
    const textContent = choices.find(choice => choice.message.role === 'assistant');
    if (!textContent || typeof textContent.message.content !== 'string') {
        throw new Error('No valid text content found in the response');
    }
    return textContent.message.content;
}

// Type definition for token count
type TokenCount = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};

// Function to get the definitions of a word with token count using OpenRouter
export async function getDefinitionsOpenRouter(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the OpenRouter API
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

    // Send the prompt to the OpenRouter API and get the response
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: llm,
            messages: [
                { role: 'user', content: prompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': `${OPENROUTER_YOUR_SITE_URL}`,
                'X-Title': `${OPENROUTER_YOUR_SITE_NAME}`,
                'Content-Type': 'application/json'
            }
        }
    );

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', response.data);

    // Extract the definitions from the response
    const definitions = extractTextContent(response.data.choices);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
    };
    // Return the definitions and token count
    return [definitions, tokenCount];
}

// Function to get short sentences containing a specific word with token count using OpenRouter
export async function getSentencesOpenRouter(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the OpenRouter API
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

    // Send the prompt to the OpenRouter API and get the response
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: llm,
            messages: [
                { role: 'user', content: prompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': `${OPENROUTER_YOUR_SITE_URL}`,
                'X-Title': `${OPENROUTER_YOUR_SITE_NAME}`,
                'Content-Type': 'application/json'
            }
        }
    );

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', response.data);

    // Extract the sentences from the response
    const sentences = extractTextContent(response.data.choices);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
    };
    // Return the sentences and token count
    return [sentences, tokenCount];
}

// Function to translate a sentence using OpenRouter
export async function translateSentenceOpenRouter(inputSentence: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the OpenRouter API
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

    // Send the prompt to the OpenRouter API and get the response
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: llm,
            messages: [
                { role: 'user', content: prompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': `${OPENROUTER_YOUR_SITE_URL}`,
                'X-Title': `${OPENROUTER_YOUR_SITE_NAME}`,
                'Content-Type': 'application/json'
            }
        }
    );

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', response.data);

    // Extract the translated sentence and token count
    const translation = extractTextContent(response.data.choices).trim();
    const tokenCount: TokenCount = {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
    };

    // Return the translation and token count as an array
    return [translation, tokenCount];
}

// Function to analyze the frequency of use of a word in the target language and translate the response
export async function analyzeWordFrequencyOpenRouter(word: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the OpenRouter API
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

    // Send the prompt to the OpenRouter API and get the response
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: llm,
            messages: [
                { role: 'user', content: prompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': `${OPENROUTER_YOUR_SITE_URL}`,
                'X-Title': `${OPENROUTER_YOUR_SITE_NAME}`,
                'Content-Type': 'application/json'
            }
        }
    );

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', response.data);

    // Extract the analysis from the response
    const analysis = extractTextContent(response.data.choices);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
    };
    // Return the analysis and token count
    return [analysis, tokenCount];
}
