// Import necessary dependencies and utility functions
import React, { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, LLMOption, TTSOption } from './Types';
import { handleGenerateDefinitions } from './handleGenerateDefinitions';
import { handleGenerateSentences } from './handleGenerateSentences';

// Define the backend API URLs, using environment variables
const TOKEN_SUM_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/token/sum';

// Function to handle form submission
export const handleSubmit = async (e: React.FormEvent, setDefinitions: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>, setSentences: Dispatch<SetStateAction<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>>, setTotalTokenCount: Dispatch<SetStateAction<TokenCount | null>>, setError: Dispatch<SetStateAction<string | null>>, setIsGenerateLoading: Dispatch<SetStateAction<boolean>>, setCurrentPage: Dispatch<SetStateAction<number>>, updateTotalTokenCount: (tokenCount: TokenCount) => void, setShowGenerateNotification: Dispatch<SetStateAction<boolean>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedTTS: TTSOption, word: string, selectedLLM: LLMOption) => {
  e.preventDefault();
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !selectedTTS || !word || !selectedLLM) {
    setError('Please fill in all required fields.');
    return;
  }
  setError(null);
  setIsGenerateLoading(true);
  setCurrentPage(1);

  try {
    // Generate definitions
    const definitionsTokenCount = await handleGenerateDefinitions(setDefinitions, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word);

    // Generate sentences
    const sentencesTokenCount = await handleGenerateSentences(setSentences, setError, nativeLanguage, targetLanguage, selectedAPIService, selectedLLM, word);

    // Log request details for debugging
    console.log('Request payload for total token count:', {
      definitionsTokens: definitionsTokenCount,
      sentencesTokens: sentencesTokenCount,
      translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    });

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Calculate total token count
    const totalTokenCountResponse = await fetch(TOKEN_SUM_URL, {
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
