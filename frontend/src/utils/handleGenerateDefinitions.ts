// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, LLMOption } from './Types';

// Define the backend API URLs, using environment variables
const DEFINITIONS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/definitions';

// Function to handle generating definitions
export const handleGenerateDefinitions = async (setDefinitions: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>, setError: Dispatch<SetStateAction<string | null>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedLLM: LLMOption, word: string): Promise<TokenCount> => {
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
    setError('Please fill in all required fields.');
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  setError(null); // Clear any previous errors

  try {
    // Log request details for debugging
    console.log('Sending definitions generation request...');
    console.log('Request payload:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Send POST request to the definitions generation endpoint
    const definitionsResponse = await fetch(DEFINITIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
      },
      body: JSON.stringify({ word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
    });

    // Log response status for debugging
    console.log('Response status for definitions:', definitionsResponse.status);

    // Check if response is successful
    if (!definitionsResponse.ok) {
      const errorText = await definitionsResponse.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${definitionsResponse.status}, message: ${errorText}`);
    }

    // Parse response JSON
    const definitionsData = await definitionsResponse.json();
    console.log('Received definitions data:', definitionsData);

    // Log the definitions result
    console.log('Definitions result:', definitionsData.definitions);

    // Validate response data structure
    if (
        definitionsData.definitions && typeof definitionsData.definitions === 'object' &&
        'text' in definitionsData.definitions &&
        'tokenCount' in definitionsData.definitions &&
        typeof definitionsData.definitions.tokenCount === 'object' &&
        'inputTokens' in definitionsData.definitions.tokenCount &&
        'outputTokens' in definitionsData.definitions.tokenCount &&
        'totalTokens' in definitionsData.definitions.tokenCount
    ) {
      // Set definitions
      setDefinitions(definitionsData.definitions);
      console.log('Set definitions:', definitionsData.definitions);
      return definitionsData.definitions.tokenCount;
    } else {
      console.error('Invalid definitions data structure:', definitionsData);
      throw new Error('Received invalid definitions data from the server.');
    }
  } catch (error: unknown) {
    console.error('Error in handleGenerateDefinitions:', error);
    if (error instanceof Error) {
      setError(`An error occurred while fetching definitions: ${error.message}`);
    } else {
      setError('An unknown error occurred while fetching definitions.');
    }
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
};
