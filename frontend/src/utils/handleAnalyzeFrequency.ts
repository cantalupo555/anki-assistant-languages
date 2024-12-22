// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, LLMOption, FrequencyAnalysis } from './Types';

// Define the backend API URLs, using environment variables
const ANALYZE_FREQUENCY_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/analyze/frequency';

// Function to handle word frequency analysis
export const handleAnalyzeFrequency = async (setFrequencyAnalysis: Dispatch<SetStateAction<FrequencyAnalysis | null>>, setIsAnalyzeLoading: Dispatch<SetStateAction<boolean>>, setError: Dispatch<SetStateAction<string | null>>, updateTotalTokenCount: (tokenCount: TokenCount) => void, setIsFrequencyModalOpen: Dispatch<SetStateAction<boolean>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedLLM: LLMOption, word: string) => {
  // Validate required fields
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !word || selectedLLM.value === '') {
    setError('Please fill in all required fields.');
    return;
  }

  setError(null); // Clear any previous errors
  setIsAnalyzeLoading(true); // Set loading state

  try {
    // Log request details for debugging
    console.log('Sending frequency analysis request...');
    console.log('Request payload:', { word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Send POST request to the frequency analysis endpoint
    const analysisResponse = await fetch(ANALYZE_FREQUENCY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
      },
      body: JSON.stringify({ word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value }),
    });

    // Log response status for debugging
    console.log('Response status for analysis:', analysisResponse.status);

    // Check if response is successful
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${analysisResponse.status}, message: ${errorText}`);
    }

    // Parse response JSON
    const analysisData = await analysisResponse.json();
    console.log('Received analysis data:', analysisData);

    // Log the analysis result
    console.log('Analysis result:', analysisData.analysis);

    // Validate response data structure
    if (
        analysisData.analysis && typeof analysisData.analysis === 'string' &&
        analysisData.tokenCount && typeof analysisData.tokenCount === 'object' &&
        'inputTokens' in analysisData.tokenCount &&
        'outputTokens' in analysisData.tokenCount &&
        'totalTokens' in analysisData.tokenCount
    ) {
      // Create and set frequency analysis object
      const analysis: FrequencyAnalysis = {
        text: analysisData.analysis,
        tokenCount: analysisData.tokenCount
      };
      setFrequencyAnalysis(analysis);
      updateTotalTokenCount(analysisData.tokenCount);
      console.log('Set frequency analysis:', analysis);
      setIsFrequencyModalOpen(true); // Open frequency analysis modal
    } else {
      console.error('Invalid analysis data structure:', analysisData);
      throw new Error('Received invalid analysis data from the server.');
    }
  } catch (error: unknown) {
    console.error('Error in handleAnalyzeFrequency:', error);
    if (error instanceof Error) {
      setError(`An error occurred while fetching frequency analysis: ${error.message}`);
    } else {
      setError('An unknown error occurred while fetching frequency analysis.');
    }
  } finally {
    setIsAnalyzeLoading(false); // Reset loading state
  }
};
