// Import necessary dependencies and utility functions
import React, { Dispatch, SetStateAction } from 'react';
import { TokenCount } from './Types';
import { stripMarkdown } from './markdownStripper';

// Define the backend API URLs, using environment variables
const TRANSLATION_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/translate';

// Function to handle the translation of a given sentence
export const handleTranslation = async (sentence: string, setError: Dispatch<SetStateAction<string | null>>, setIsTranslateLoading: Dispatch<SetStateAction<boolean>>, updateTotalTokenCount: (tokenCount: TokenCount) => void, setTranslation: Dispatch<SetStateAction<string | null>>, isTranslateLoading: boolean): Promise<string> => {
  if (isTranslateLoading) return ''; // Prevent multiple clicks while translating

  try {
    setIsTranslateLoading(true); // Set loading state

    // Log request details for debugging
    console.log('Sending translation request...');
    console.log('Request payload:', {
      text: sentence,
      nativeLanguage: 'English (United States)', // Assuming native language is always English for this example
      targetLanguage: 'Spanish (Spain)', // Assuming target language is always Spanish for this example
      apiService: 'openrouter', // Assuming API service is always OpenRouter for this example
      llm: 'meta-llama/llama-3.1-70b-instruct:free' // Assuming LLM is always Llama-3.1 70B Instruct for this example
    });

    // Send POST request to the translation API endpoint
    const response = await fetch(TRANSLATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sentence,
        nativeLanguage: 'English (United States)', // Assuming native language is always English for this example
        targetLanguage: 'Spanish (Spain)', // Assuming target language is always Spanish for this example
        apiService: 'openrouter', // Assuming API service is always OpenRouter for this example
        llm: 'meta-llama/llama-3.1-70b-instruct:free' // Assuming LLM is always Llama-3.1 70B Instruct for this example
      }),
    });

    // Log response status for debugging
    console.log('Response status for translation:', response.status);

    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Parse response JSON
    const data = await response.json();
    console.log('Received translation data:', data);

    // Log the translation result
    console.log('Translation result:', data.translation);

    // Set the state for the translation
    setTranslation(data.translation);
    updateTotalTokenCount(data.tokenCount);

    return data.translation; // Return the translation
  } catch (error) {
    console.error('Error in handleTranslation:', error);
    if (error instanceof Error) {
      setError(`An error occurred while translating the sentence: ${error.message}`);
    } else {
      setError('An unknown error occurred while translating the sentence. Please try again.');
    }
    return ''; // Return an empty string or some default value in case of error
  } finally {
    setIsTranslateLoading(false); // Reset loading state
  }
};
