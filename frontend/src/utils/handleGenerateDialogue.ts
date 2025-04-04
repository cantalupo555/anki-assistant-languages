// Import necessary dependencies and utility functions
import { Dispatch, SetStateAction } from 'react';
// import { validateAndRefreshToken } from './validateAndRefreshToken'; // Removed deprecated import
import { TokenCount, APIServiceOption, TTSOption, LLMOption } from './Types';

// Define the backend API URLs, using environment variables
// const DIALOGUE_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate/dialogue'; // No longer needed

// Function to handle generating dialogue
export const handleGenerateDialogue = async (
    setDialogue: Dispatch<SetStateAction<{ text: string; tokenCount: TokenCount } | null>>,
    setIsDialogueLoading: Dispatch<SetStateAction<boolean>>,
    setError: Dispatch<SetStateAction<string | null>>,
    updateTotalTokenCount: (tokenCount: TokenCount) => void,
    setIsDialogueModalOpen: Dispatch<SetStateAction<boolean>>,
    nativeLanguage: string,
    targetLanguage: string,
    selectedAPIService: APIServiceOption,
    selectedTTS: TTSOption, // selectedTTS seems unused here, consider removing if not needed for dialogue logic
    word: string,
    selectedLLM: LLMOption,
    // Replace token parameter with callApiWithAuth function
    callApiWithAuth: (url: string, options?: RequestInit) => Promise<Response>
) => {
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

    // No need for explicit token check here

    // Send POST request using callApiWithAuth
    const dialogueResponse = await callApiWithAuth(`/generate/dialogue`, { // Use relative path and callApiWithAuth
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header is handled by callApiWithAuth
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
        dialogueData && typeof dialogueData === 'object' &&
        dialogueData.dialogue && typeof dialogueData.dialogue === 'object' &&
        typeof dialogueData.dialogue.text === 'string' &&
        dialogueData.dialogue.tokenCount && typeof dialogueData.dialogue.tokenCount === 'object' &&
        'inputTokens' in dialogueData.dialogue.tokenCount &&
        'outputTokens' in dialogueData.dialogue.tokenCount &&
        'totalTokens' in dialogueData.dialogue.tokenCount
    ) {
      // Replace special characters with \n
      const dialogueText = dialogueData.dialogue.text.replace(/\n/g, '\n').replace(/<br\s*\/?>/g, '\n');

      // Create and set dialogue object
      const dialogue = {
        text: dialogueText,
        tokenCount: dialogueData.dialogue.tokenCount
      };
      setDialogue(dialogue);
      updateTotalTokenCount(dialogueData.dialogue.tokenCount);
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
