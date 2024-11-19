// Import necessary dependencies and utility functions
import React, { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, LLMOption, TTSOption } from './Types';

// Define the backend API URLs, using environment variables
const DEFINITIONS_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/definitions';
const SENTENCES_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/sentences';
const TOKEN_SUM_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/token/sum';

// Function to handle form submission
export const handleSubmit = async (e: React.FormEvent, setDefinitions: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>, setSentences: Dispatch<SetStateAction<{ text: string[]; tokenCount: TokenCount; totalPages: number } | null>>, setTotalTokenCount: Dispatch<SetStateAction<TokenCount | null>>, setError: Dispatch<SetStateAction<string | null>>, setIsGenerateLoading: Dispatch<SetStateAction<boolean>>, setCurrentPage: Dispatch<SetStateAction<number>>, updateTotalTokenCount: (tokenCount: TokenCount) => void, setShowGenerateNotification: Dispatch<SetStateAction<boolean>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedTTS: TTSOption, word: string, selectedLLM: LLMOption, TTS_URL: string) => {
  e.preventDefault();
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !selectedTTS || !word || !selectedLLM) {
    setError('Please fill in all required fields.');
    return;
  }
  setError(null);
  setIsGenerateLoading(true);
  setCurrentPage(1);

  try {
    // Log request details for debugging
    console.log('Submitting form...');
    console.log('Request payload for definitions:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Fetch definitions
    const definitionsResponse = await fetch(DEFINITIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
    });

    // Log response status for debugging
    console.log('Response status for definitions:', definitionsResponse.status);

    // Check if response is successful
    if (!definitionsResponse.ok) {
      const errorText = await definitionsResponse.text();
      console.error('Error response for definitions:', errorText);
      throw new Error(`HTTP error! status: ${definitionsResponse.status}, message: ${errorText}`);
    }

    const definitionsData = await definitionsResponse.json();
    setDefinitions(definitionsData.definitions);
    console.log('Received definitions data:', definitionsData);

    // Log request details for debugging
    console.log('Request payload for sentences:', { word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Fetch sentences
    const sentencesResponse = await fetch(SENTENCES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, language: targetLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
    });

    // Log response status for debugging
    console.log('Response status for sentences:', sentencesResponse.status);

    // Check if response is successful
    if (!sentencesResponse.ok) {
      const errorText = await sentencesResponse.text();
      console.error('Error response for sentences:', errorText);
      throw new Error(`HTTP error! status: ${sentencesResponse.status}, message: ${errorText}`);
    }

    const sentencesData = await sentencesResponse.json();
    setSentences(sentencesData.sentences);
    console.log('Received sentences data:', sentencesData);

    // Log request details for debugging
    console.log('Request payload for total token count:', {
      definitionsTokens: definitionsData.definitions.tokenCount,
      sentencesTokens: sentencesData.sentences.tokenCount,
      translationTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    });

    // Calculate total token count
    const totalTokenCountResponse = await fetch(TOKEN_SUM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        definitionsTokens: definitionsData.definitions.tokenCount,
        sentencesTokens: sentencesData.sentences.tokenCount,
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
