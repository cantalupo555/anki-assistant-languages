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
    // Replace token parameter with callApiWithAuth function
    callApiWithAuth: (url: string, options?: RequestInit) => Promise<Response>
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
    // No need for explicit token check here, callApiWithAuth handles it implicitly

    // Generate definitions - Pass callApiWithAuth down
    const definitionsTokenCount = await handleGenerateDefinitions(setDefinitions, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word, callApiWithAuth);

    // Generate sentences - Pass callApiWithAuth down
    const sentencesTokenCount = await handleGenerateSentences(setSentences, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word, callApiWithAuth);

    // Log request details for debugging
    console.log('Request payload for total token count:', {
      definitionsTokens: definitionsTokenCount,
      sentencesTokens: sentencesTokenCount,
      translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } // Assuming translation is not part of initial submit
    });

    // Calculate total token count using callApiWithAuth
    const totalTokenCountResponse = await callApiWithAuth(`/token/sum`, { // Use relative path and callApiWithAuth
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header is handled by callApiWithAuth
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
