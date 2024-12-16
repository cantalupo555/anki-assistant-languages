// Import necessary libraries
// Import the Anthropic SDK to interact with the Anthropic API
// dotenv: Used to load environment variables from a .env file
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
    // Remove the content within the <definition_analysis> tag
    let text = textContent.text.replace(/<definition_analysis>.*?<\/definition_analysis>/s, '');
    return text;
}

// Type definition for token count
type TokenCount = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};

// Function to get the definitions of a word with token count
export async function getDefinitionsAnthropicClaude(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
    const prompt = `You are a linguistic expert tasked with providing comprehensive dictionary-style definitions for words. Your goal is to offer three essential meanings of a given word in a specified target language, as they would appear in a monolingual dictionary.

Here is the target language for the definitions:
<target_language>
${targetLanguage}
</target_language>

Here is the word you need to define:
<word>
${word}
</word>

Instructions:
1. Read the given word carefully, removing any leading or trailing spaces.
2. In your thinking process, consider the following for each definition:
   - The word's part of speech
   - Its most common usage contexts
   - Any nuances or connotations associated with the word
   - How it differs from similar words or synonyms

3. Identify three fundamental definitions or closely related meanings of the word in the specified language.
4. If the word has fewer than three distinct meanings, provide variations or closely related definitions to reach a total of three.
5. Ensure that each definition is comprehensive and informative, avoiding overly brief or single-word explanations.
6. Ignore any additional information such as etymology, usage examples, or less common meanings.
7. Present your answer in the following format:
   **[word]**: 1. [your first basic definition] | 2. [your second basic definition] | 3. [your third basic definition]

Remember:
- Provide exactly three basic definitions or closely related meanings.
- Do not include any information beyond the fundamental meanings.
- The word itself should be in bold before the colon.
- Do not mix languages or provide translations unless explicitly instructed to do so.
- All definitions must be in the specified target language.
- Aim for clear, informative definitions that capture the essence of the word's usage.

Before providing your final output, analyze each definition inside <definition_analysis> tags:

1. List potential parts of speech for the word.
2. Brainstorm at least three common usage contexts for this definition.
3. Note any nuances or connotations associated with this usage.
4. Compare this definition to the others to ensure it's distinct and captures a different aspect of the word's meaning.

This analysis will help ensure that your definitions are sufficiently detailed and comprehensive.

Example output structure (note that this is a generic example and should not influence the content of your definitions):

<definition_analysis>
Definition 1:
- Parts of speech: [list potential parts of speech]
- Usage contexts: [list at least three contexts]
- Nuances/connotations: [note any important nuances]
- Distinctness: [compare to other definitions]

Definition 2:
[Repeat the above structure]

Definition 3:
[Repeat the above structure]
</definition_analysis>

**[word]**: 1. [Comprehensive definition 1] | 2. [Comprehensive definition 2] | 3. [Comprehensive definition 3]

Please proceed with defining the given word in the specified target language.`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: llm,
        max_tokens: 1024,
        temperature: 0,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', msg);

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
export async function getSentencesAnthropicClaude(word: string, targetLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
    const prompt = `You are a language expert tasked with creating example sentences for language learners. Your goal is to generate 25 short, meaningful sentences in a specific language, each incorporating a given word.

Here are the key parameters for this task:

Target Language:
<target_language>
${targetLanguage}
</target_language>

Word to include:
<word>
${word}
</word>

Instructions:
1. Generate 25 unique sentences in the specified target language.
2. Each sentence must:
   - Contain no more than 12 words.
   - Include the given word.
   - Be grammatically correct.
   - Form a complete and coherent thought.
   - Be contextually meaningful and varied in structure.
3. Formatting requirements:
   - List sentences one per line, without numbering or bullet points.
   - Make only the given word bold using asterisks (e.g., **word**).
   - Capitalize the first letter of each sentence, including when the given word starts the sentence.
   - Use the given word in lowercase when it's not the first word in the sentence.

Before generating the sentences, wrap your thought process in <brainstorming> tags. In this section:
1. List at least 5 diverse contexts or themes for the sentences (e.g., daily life, work, hobbies, nature, emotions).
2. Note different grammatical structures to use (e.g., simple present, past tense, future tense, questions, imperatives).
3. Consider various sentence positions for the given word (beginning, middle, end).
4. Brainstorm colloquial or idiomatic uses of the word, if applicable.
5. Plan how to vary the complexity of the sentences while keeping them concise.
6. Consider how to make each sentence a complete thought that provides clear context for the word's usage.
This will help ensure variety and meaningfulness in your output.

After generating the sentences, review them to ensure they meet all criteria and are not overly simple or generic. Refine as necessary.

Example output format:
The cat likes to play with the **ball**.
I enjoy drinking **coffee** in the morning.
**Happiness** is contagious among friends.

Please proceed with your brainstorming process and then generate the 25 sentences.`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: llm,
        max_tokens: 4096,
        temperature: 1,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', msg);

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
export async function translateSentenceAnthropicClaude(inputSentence: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
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
6. Preserve any formatting present in the original sentence, such as bold or italic text.
7. Maintain the formality or informality of the original sentence in the translation.`;

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: llm,
        max_tokens: 1024,
        temperature: 0,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', msg);

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

// Function to get a short dialogue using a given word or idiomatic expression
export async function getDialogueAnthropicClaude(word: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
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

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: llm,
        max_tokens: 1024,
        temperature: 1,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', msg);

    // Extract the dialogue from the response
    const dialogue = extractTextContent(msg.content);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens
    };
    // Return the dialogue and token count
    return [dialogue, tokenCount];
}

// Function to analyze the frequency of use of a word in the target language and translate the response
export async function analyzeFrequencyAnthropicClaude(word: string, targetLanguage: string, nativeLanguage: string, llm: string): Promise<[string, TokenCount]> {
    // Construct the prompt for the Anthropic API
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

    // Send the prompt to the Anthropic API and get the response
    const msg = await anthropic.messages.create({
        model: llm,
        max_tokens: 4096,
        temperature: 0,
        messages: [
            {role: "user", content: prompt}
        ]
    });

    // Uncomment the line below to log the full API response to the console (useful for debugging)
    // console.log('API Response:', msg);

    // Extract the analysis from the response
    const analysis = extractTextContent(msg.content);
    // Calculate the token count
    const tokenCount: TokenCount = {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens
    };
    // Return the analysis and token count
    return [analysis, tokenCount];
}
