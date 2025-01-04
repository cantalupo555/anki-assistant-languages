// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
import { TokenCount, APIServiceOption, TTSOption, LLMOption } from './Types';

// Define the backend API URLs, using environment variables
const DIALOGUE_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/dialogue';

// Function to handle generating dialogue
export const handleGenerateDialogue = async (setDialogue: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>, setIsDialogueLoading: Dispatch<SetStateAction<boolean>>, setError: Dispatch<SetStateAction<string | null>>, updateTotalTokenCount: (tokenCount: TokenCount) => void, setIsDialogueModalOpen: Dispatch<SetStateAction<boolean>>, nativeLanguage: string, targetLanguage: string, selectedAPIService: APIServiceOption, selectedTTS: TTSOption, word: string, selectedLLM: LLMOption) => {
  if (!nativeLanguage || !targetLanguage || !selectedAPIService || !selectedTTS || !word || selectedLLM.value === '') {
    setError('Please fill in all required fields.');
    return;
  }

  setError(null); // Clear any previous errors
  setIsDialogueLoading(true); // Set loading state

  try {
    // Log request details for debugging
    console.log('Sending dialogue generation request...');
    console.log('Request payload:', { word, targetLanguage, nativeLanguage, apiService: selectedAPIService.value, llm: selectedLLM.value });

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Send POST request to the dialogue generation endpoint
    const dialogueResponse = await fetch(DIALOGUE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
      },
      body: JSON.stringify({
        word: word,
        targetLanguage: targetLanguage,
        nativeLanguage: nativeLanguage,
        apiService: selectedAPIService.value,
        llm: selectedLLM.value
      }),
    });

    // Log response status for debugging
    console.log('Response status for dialogue:', dialogueResponse.status);

    // Check if response is successful
    if (!dialogueResponse.ok) {
      const errorText = await dialogueResponse.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${dialogueResponse.status}, message: ${errorText}`);
    }

    // Parse response JSON
    const dialogueData = await dialogueResponse.json();
    console.log('Received dialogue data:', dialogueData);

    // Log the dialogue result
    console.log('Dialogue result:', dialogueData.dialogue);

    // Validate response data structure
    if (
        dialogueData.dialogue && typeof dialogueData.dialogue === 'string' &&
        dialogueData.tokenCount && typeof dialogueData.tokenCount === 'object' &&
        'inputTokens' in dialogueData.tokenCount &&
        'outputTokens' in dialogueData.tokenCount &&
        'totalTokens' in dialogueData.tokenCount
    ) {
      // Replace special characters with \n
      const dialogueText = dialogueData.dialogue.replace(/\n/g, '\n').replace(/<br\s*\/?>/g, '\n');

      // Create and set dialogue object
      const dialogue = {
        text: dialogueText,
        tokenCount: dialogueData.tokenCount
      };
      setDialogue(dialogue);
      updateTotalTokenCount(dialogueData.tokenCount);
      console.log('Set dialogue:', dialogue);
      setIsDialogueModalOpen(true); // Open dialogue modal
    } else {
      console.error('Invalid dialogue data structure:', dialogueData);
      throw new Error('Received invalid dialogue data from the server.');
    }
  } catch (error: unknown) {
    console.error('Error in handleGenerateDialogue:', error);
    if (error instanceof Error) {
      setError(`An error occurred while fetching dialogue: ${error.message}`);
    } else {
      setError('An unknown error occurred while fetching dialogue.');
    }
  } finally {
    setIsDialogueLoading(false); // Reset loading state
  }
};
