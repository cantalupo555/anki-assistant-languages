import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

// Interface to define the format of the result
interface Result {
  word: string;
  translation: { text: string; tokenCount: TokenCount };
  definitions: { text: string; tokenCount: TokenCount };
  sentences: { text: string[]; tokenCount: TokenCount; totalPages: number };
  totalTokenCount: TokenCount;
}

// Interface to define the format of the TokenCount
interface TokenCount {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// New interface for saved items
interface SavedItem {
  sentence: string;
  definition: string;
}

// Backend API URL, with a default value if the environment variable is not set
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate';

export default function App() {
  // State to store the word entered by the user
  const [word, setWord] = useState('');
  // State to store the result from the API
  const [result, setResult] = useState<Result | null>(null);
  // State to store a possible error
  const [error, setError] = useState<string | null>(null);
  // State to indicate if the request is in progress
  const [isLoading, setIsLoading] = useState(false);
  // State to store the selected sentence
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  // State to store the current page number
  const [currentPage, setCurrentPage] = useState(1);
  // New state to store saved sentences with definitions
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Effect to load saved items from localStorage on component mount
  useEffect(() => {
    const savedItemsFromStorage = localStorage.getItem('savedItems');
    if (savedItemsFromStorage) {
      setSavedItems(JSON.parse(savedItemsFromStorage));
    }
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setCurrentPage(1);
    try {
      // Send the request to the API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the data from the API response
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle clicking on a sentence
  const handleSentenceClick = (sentence: string) => {
    setSelectedSentence(sentence);
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to get current page sentences
  const getCurrentPageSentences = () => {
    if (!result) return [];
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    return result.sentences.text.slice(startIndex, endIndex);
  };

  // New function to save the selected sentence with definition
  const handleSaveItem = () => {
    if (selectedSentence && result) {
      const newItem: SavedItem = {
        sentence: selectedSentence,
        definition: result.definitions.text
      };
      if (!savedItems.some(item => item.sentence === newItem.sentence)) {
        const newSavedItems = [...savedItems, newItem];
        setSavedItems(newSavedItems);
        localStorage.setItem('savedItems', JSON.stringify(newSavedItems));
      }
    }
  };

  // New function to remove a saved item
  const handleRemoveSavedItem = (itemToRemove: SavedItem) => {
    const newSavedItems = savedItems.filter(item => item.sentence !== itemToRemove.sentence);
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify(newSavedItems));
  };

  return (
      <div>
        {/* Form for entering the word */}
        <form onSubmit={handleSubmit}>
          <label htmlFor="word-input">Enter a word:</label>
          <input
              id="word-input"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {/* Display the error, if any */}
        {error && <div role="alert">{error}</div>}

        {/* Display the results, if any */}
        {result && (
            <div>
              <h2>Results for: {result.word}</h2>
              <h3>Translation:</h3>
              <ReactMarkdown>{result.translation.text}</ReactMarkdown>
              <h3>Definitions:</h3>
              <ReactMarkdown>{result.definitions.text}</ReactMarkdown>
              <h3>Select 1 Sentence:</h3>
              <ul>
                {getCurrentPageSentences().map((sentence, index) => (
                    <li
                        key={index}
                        onClick={() => handleSentenceClick(sentence)}
                        style={{
                          backgroundColor:
                              selectedSentence === sentence ? 'lightgray' : 'transparent',
                          cursor: 'pointer',
                        }}
                    >
                      <ReactMarkdown>{sentence}</ReactMarkdown>
                    </li>
                ))}
              </ul>

              {/* Pagination controls */}
              <div>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {result.sentences.totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === result.sentences.totalPages}
                >
                  Next
                </button>
              </div>

              {/* Display the selected sentence, if any */}
              {selectedSentence && (
                  <div>
                    <h3>Selected Sentence:</h3>
                    <ReactMarkdown>{selectedSentence}</ReactMarkdown>
                    <button onClick={handleSaveItem}>Save Sentence with Definition</button>
                  </div>
              )}

              <div>
                <p>
                  <b>Total Tokens</b>
                  <br/>
                  Input: {result.totalTokenCount.inputTokens}
                  <br/>
                  Output: {result.totalTokenCount.outputTokens}
                  <br/>
                  Total: {result.totalTokenCount.totalTokens}
                </p>
              </div>
            </div>
        )}

        {/* Display saved items */}
        <div>
          <h3>Saved Sentences with Definitions:</h3>
          <ul>
            {savedItems.map((item, index) => (
                <li key={index}>
                  {item.sentence};{item.definition}
                  <button onClick={() => handleRemoveSavedItem(item)}>Remove</button>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}
