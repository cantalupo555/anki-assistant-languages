// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, LLMOption } from './Types';

// Define the backend API URLs, using environment variables
const SENTENCES_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/sentences';

// Function to handle generating sentences
export const handleGenerateSentences = async (setSentences: Dispatch<SetStateAction<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>>, setError: Dispatch<SetStateAction<string | null>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedLLM: LLMOption, word: string): Promise<TokenCount> => {
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
    setError('Please fill in all required fields.');
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  setError(null); // Clear any previous errors

  try {
    // Log request details for debugging
    console.log('Sending sentences generation request...');
    console.log('Request payload:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Send POST request to the sentences generation endpoint
    const sentencesResponse = await fetch(SENTENCES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
      },
      body: JSON.stringify({
        word: word,
        language: targetLanguage,
        nativeLanguage: nativeLanguage,
        apiService: selectedAPIService.value,
        llm: selectedLLM.value
      }),
    });

    // Log response status for debugging
    console.log('Response status for sentences:', sentencesResponse.status);

    // Check if response is successful
    if (!sentencesResponse.ok) {
      const errorText = await sentencesResponse.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${sentencesResponse.status}, message: ${errorText}`);
    }

    const sentencesData = await sentencesResponse.json();
    console.log('Received sentences data:', sentencesData);

    // Log the sentences result
    console.log('Sentences result:', sentencesData.sentences);

    // Validate response data structure
    if (
        sentencesData.sentences && typeof sentencesData.sentences === 'object' &&
        'text' in sentencesData.sentences &&
        'tokenCount' in sentencesData.sentences &&
        typeof sentencesData.sentences.tokenCount === 'object' &&
        'inputTokens' in sentencesData.sentences.tokenCount &&
        'outputTokens' in sentencesData.sentences.tokenCount &&
        'totalTokens' in sentencesData.sentences.tokenCount &&
        'totalPages' in sentencesData.sentences
    ) {
      // Set sentences
      setSentences(sentencesData.sentences);
      console.log('Set sentences:', sentencesData.sentences);
      return sentencesData.sentences.tokenCount;
    } else {
      console.error('Invalid sentences data structure:', sentencesData);
      throw new Error('Received invalid sentences data from the server.');
    }
  } catch (error: unknown) {
    console.error('Error in handleGenerateSentences:', error);
    if (error instanceof Error) {
      setError(`An error occurred while fetching sentences: ${error.message}`);
    } else {
      setError('An unknown error occurred while fetching sentences.');
    }
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
};
