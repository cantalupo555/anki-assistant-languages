// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
// import { validateAndRefreshToken } from './validateAndRefreshToken'; // Removed deprecated import
import { TokenCount, APIServiceOption, LLMOption } from './Types';

// Define the backend API URLs, using environment variables
// const SENTENCES_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/sentences'; // No longer needed

// Function to handle generating sentences
export const handleGenerateSentences = async (
    setSentences: Dispatch<SetStateAction<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>>,
    setError: Dispatch<SetStateAction<string | null>>,
    nativeLanguage: string,
    targetLanguage: string,
    selectedAPIService: APIServiceOption,
    selectedLLM: LLMOption,
    word: string,
    // Replace token parameter with callApiWithAuth function
    callApiWithAuth: (url: string, options?: RequestInit) => Promise<Response>
): Promise<TokenCount> => {
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
    setError('Please fill in all required fields.');
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  setError(null); // Clear any previous errors

  try {
    // Log request details for debugging
    console.log('Sending sentences generation request...');
    console.log('Request payload:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // No need to check for token here, callApiWithAuth handles Authorization header

    // Send POST request using the wrapped function
    const sentencesResponse = await callApiWithAuth(`/generate/sentences`, { // Use relative path and callApiWithAuth
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header is now handled by callApiWithAuth
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
