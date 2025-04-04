// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
// import { validateAndRefreshToken } from './validateAndRefreshToken'; // Removed deprecated import
import { TokenCount } from './Types';

// Define the backend API URLs, using environment variables
// const TRANSLATION_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/translate'; // No longer needed

// Function to handle the translation of a given sentence
export const handleTranslation = async (
    sentence: string,
    setError: Dispatch<SetStateAction<string | null>>,
    setIsTranslateLoading: Dispatch<SetStateAction<boolean>>,
    updateTotalTokenCount: (tokenCount: TokenCount) => void,
    setTranslation: Dispatch<SetStateAction<string | null>>,
    isTranslateLoading: boolean,
    nativeLanguage: string,
    targetLanguage: string,
    selectedAPIService: string,
    selectedLLM: string,
    // Replace token parameter with callApiWithAuth function
    callApiWithAuth: (url: string, options?: RequestInit) => Promise<Response>
): Promise<string> => {
  if (isTranslateLoading) return ''; // Prevent multiple clicks while translating

  try {
    setIsTranslateLoading(true); // Set loading state

    // Log request details for debugging
    console.log('Sending translation request...');
    console.log('Request payload:', {
      text: sentence,
      nativeLanguage: nativeLanguage,
      targetLanguage: targetLanguage,
      apiService: selectedAPIService,
      llm: selectedLLM
    });

    // No need for explicit token check here

    // Send POST request using callApiWithAuth
    const response = await callApiWithAuth(`/translate`, { // Use relative path and callApiWithAuth
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header is handled by callApiWithAuth
      },
      body: JSON.stringify({
        text: sentence,
        nativeLanguage: nativeLanguage,
        targetLanguage: targetLanguage,
        apiService: selectedAPIService,
        llm: selectedLLM
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
    setTranslation(data.translation.text);
    if (data.translation.tokenCount) {
      updateTotalTokenCount(data.translation.tokenCount);
    }

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
