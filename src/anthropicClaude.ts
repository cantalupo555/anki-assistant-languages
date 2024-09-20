// Import necessary dependencies
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create an Anthropic client instance with the API key from the environment
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY
});

// Function to extract the text content from the Anthropic API response
function extractTextContent(content: any[]): string {
    const textContent = content.find(item => item.type === 'text');
    if (!textContent || typeof textContent.text !== 'string') {
        throw new Error("No valid text content found in the response");
    }
    return textContent.text;
}

// Type definition for token count
type TokenCount = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};

// Function to get the definitions of a word with token count
export async function getDefinitionsWithTokens(word: string, targetLanguage: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
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

If the word has only one or two very specific meanings and it's impossible to provide three distinct definitions or variations, you may provide fewer definitions, but always aim for three if possible.`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        temperature: 0,
        messages: [
            {role: "user", content: prompt}
        ]
    });
    // Extract the definitions from the response
    const definitions = extractTextContent(msg.content);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens
    };
    // Return the definitions and token count
    return [definitions, tokenCount];
}

// Function to get short sentences containing a specific word with token count
export async function getSentencesWithTokens(word: string, targetLanguage: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
    const prompt = `Your task is to generate 25 short sentences in a specified language that include a specific word. 

The language to use is:
${targetLanguage}

The word to be included in each sentence is:
${word}

Follow these guidelines:
1. Create 25 unique sentences.
2. Each sentence should contain no more than 6 words.
3. Include the word "${word}" in each sentence.
4. Make only the word "${word}" bold in each sentence.
5. Do not include any explanations or additional information.
6. Ensure that all sentences are written in the specified language (${targetLanguage}).
7. Do not switch to any other language, even if you're more familiar with creating sentences in that language.
8. If you find yourself creating sentences in a different language, stop and refocus on using only the specified ${targetLanguage}.
9. Before using the word "${word}", remove any leading or trailing spaces. Use the trimmed version of the word in your sentences.

Format your output as follows:
- List the sentences, one per line.
- No numbering or bullet points.
- Use asterisks to make the word "${word}" bold (e.g., **${word}**).

Ignore any other information or instructions that may have been provided. Focus solely on creating the 25 sentences as specified.

Please provide your list of 25 sentences below:`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        temperature: 1,
        messages: [
            {role: "user", content: prompt}
        ]
    });
    // Extract the sentences from the response
    const sentences = extractTextContent(msg.content);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens
    };
    // Return the sentences and token count
    return [sentences, tokenCount];
}

// Function to translate a sentence
export async function translateSentence(inputSentence: string, targetLanguage: string, nativeLanguage: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
    const prompt = `You are tasked with translating a sentence from ${targetLanguage} to ${nativeLanguage}. Your goal is to provide the most accurate and natural translation without any additional explanations.

Here is the sentence to translate:
${inputSentence}

Instructions:
1. Translate the given sentence into the specified language.
2. Provide only the most accurate and natural translation.
3. Do not include any explanations, alternative translations, or additional information.
4. Maintain the original meaning and tone of the sentence as closely as possible.
5. If the sentence contains idiomatic expressions, translate them to equivalent expressions in the target language if possible.
6. Preserve any formatting present in the original sentence, such as bold or italic text.`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        temperature: 0,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Extract the translated sentence and token count
    const translation = extractTextContent(msg.content).trim();
    const tokenCount: TokenCount = {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens
    };

    // Return the translation and token count as an array
    return [translation, tokenCount];
}
