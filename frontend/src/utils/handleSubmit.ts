// Import necessary dependencies and utility functions
import React, { Dispatch, SetStateAction } from 'react';
// import { validateAndRefreshToken } from './validateAndRefreshToken'; // Removed deprecated import
import { TokenCount, APIServiceOption, LLMOption, TTSOption } from './Types';
import { handleGenerateDefinitions } from './handleGenerateDefinitions';
import { handleGenerateSentences } from './handleGenerateSentences';

// Define the backend API URLs, using environment variables
// const TOKEN_SUM_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/token/sum'; // No longer needed

// Function to handle form submission
export const handleSubmit = async (
    e: React.FormEvent,
    setDefinitions: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>,
    setSentences: Dispatch<SetStateAction<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>>,
    setTotalTokenCount: Dispatch<SetStateAction<TokenCount | null>>,
    setError: Dispatch<SetStateAction<string | null>>,
    setIsGenerateLoading: Dispatch<SetStateAction<boolean>>,
    setCurrentPage: Dispatch<SetStateAction<number>>,
    updateTotalTokenCount: (tokenCount: TokenCount) => void,
    setShowGenerateNotification: Dispatch<SetStateAction<boolean>>,
    nativeLanguage: string,
    targetLanguage: string,
    selectedAPIService: APIServiceOption,
    selectedTTS: TTSOption, // selectedTTS seems unused here, consider removing if not needed for submit logic
    word: string,
    selectedLLM: LLMOption,
    token: string | null // Added token parameter
) => {
  e.preventDefault();
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !selectedTTS || !word || !selectedLLM) {
    setError('Please fill in all required fields.');
    return;
  }
  setError(null);
  setIsGenerateLoading(true);
  setCurrentPage(1);

  try {
    // Check if token is provided before proceeding
    if (!token) {
        setError('Sessão expirada ou inválida. Por favor faça login novamente.');
        setIsGenerateLoading(false); // Ensure loading state is reset
        return; // Exit if no token
    }

    // Generate definitions
    const definitionsTokenCount = await handleGenerateDefinitions(setDefinitions, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word, token); // Pass token

    // Generate sentences
    const sentencesTokenCount = await handleGenerateSentences(setSentences, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word, token); // Pass token

    // Log request details for debugging
    console.log('Request payload for total token count:', {
      definitionsTokens: definitionsTokenCount,
      sentencesTokens: sentencesTokenCount,
      translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } // Assuming translation is not part of initial submit
    });

    // Note: The 'token' variable is already available from the function parameters.
    // The check for its existence was done earlier. No need for validateAndRefreshToken() here.

    // Calculate total token count (using the already validated token)
    const totalTokenCountResponse = await fetch(`/token/sum`, { // Use relative path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
      },
      body: JSON.stringify({
        definitionsTokens: definitionsTokenCount,
        sentencesTokens: sentencesTokenCount,
        translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      }),
    });

    // Log response status for debugging
    console.log('Response status for total token count:', totalTokenCountResponse.status);

    // Check if response is successful
    if (!totalTokenCountResponse.ok) {
      const errorText = await totalTokenCountResponse.text();
      console.error('Error response for total token count:', errorText);
      throw new Error(`HTTP error! status: ${totalTokenCountResponse.status}, message: ${errorText}`);
    }

    const totalTokenCountData = await totalTokenCountResponse.json();
    setTotalTokenCount(totalTokenCountData);
    console.log('Received total token count data:', totalTokenCountData);

    setShowGenerateNotification(true);
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    if (error instanceof Error) {
      setError(`An error occurred while fetching data: ${error.message}`);
    } else {
      setError('An unknown error occurred while fetching data.');
    }
  } finally {
    setIsGenerateLoading(false);
  }
};
