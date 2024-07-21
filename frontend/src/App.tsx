import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

// Backend API URL, with a default value if the environment variable is not set
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/generate';

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

// Interface for saved items
interface SavedItem {
  sentence: string;
  definition: string;
}

export default function App() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [showRemoveNotification, setShowRemoveNotification] = useState(false);
  const [showClearAllNotification, setShowClearAllNotification] = useState(false);
  const [showGenerateNotification, setShowGenerateNotification] = useState(false);

  // Effect to load saved items from localStorage on component mount
  useEffect(() => {
    const savedItemsFromStorage = localStorage.getItem('savedItems');
    if (savedItemsFromStorage) {
      setSavedItems(JSON.parse(savedItemsFromStorage));
    }
  }, []);

  useEffect(() => {
    if (showSaveNotification || showExportNotification || showRemoveNotification || showClearAllNotification || showGenerateNotification) {
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
        setShowExportNotification(false);
        setShowRemoveNotification(false);
        setShowClearAllNotification(false);
        setShowGenerateNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSaveNotification, showExportNotification, showRemoveNotification, showClearAllNotification, showGenerateNotification]);

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
      setShowGenerateNotification(true);
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

  // Function to save the selected sentence with definition
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
        setShowSaveNotification(true);
      }
    }
  };

  // Function to remove a saved item
  const handleRemoveSavedItem = (itemToRemove: SavedItem) => {
    const newSavedItems = savedItems.filter(item => item.sentence !== itemToRemove.sentence);
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify(newSavedItems));
    setShowRemoveNotification(true);
  };

  // Function to clear all saved items
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved items? This action cannot be undone.')) {
      setSavedItems([]);
      localStorage.removeItem('savedItems');
      setShowClearAllNotification(true);
    }
  };

  // Function to handle exporting saved items
  const handleExport = () => {
    if (savedItems.length === 0) {
      alert('No items to export.');
      return;
    }

    const exportContent = savedItems.map(item => `${item.sentence};${item.definition}`).join('\n');
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved_sentences_and_definitions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportNotification(true);
  };

  return (
      <div className="app-container">
        <header className="app-header">
          <h1>📚📖🔖 Anki Assistant Languages</h1>
          <nav>
            <ul>
              <li><a href="#generator">Word Generator</a></li>
              <li><a href="#saved-items">Saved Items</a></li>
            </ul>
          </nav>
        </header>

        <main>
          <section id="generator">
            <h2>Word Generator</h2>
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

            {error && <div className="error" role="alert">{error}</div>}

            {result && (
                <div className="result-container">
                  <h3>Results for: {result.word}</h3>
                  <div className="result-section">
                    <h4>Translation:</h4>
                    <ReactMarkdown>{result.translation.text}</ReactMarkdown>
                  </div>
                  <div className="result-section">
                    <h4>Definitions:</h4>
                    <ReactMarkdown>{result.definitions.text}</ReactMarkdown>
                  </div>
                  <div className="result-section">
                    <h4>Select 1 Sentence:</h4>
                    <ul className="sentence-list">
                      {getCurrentPageSentences().map((sentence, index) => (
                          <li
                              key={index}
                              onClick={() => handleSentenceClick(sentence)}
                              className={selectedSentence === sentence ? 'selected' : ''}
                          >
                            <ReactMarkdown>{sentence}</ReactMarkdown>
                          </li>
                      ))}
                    </ul>

                    <div className="pagination">
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

                    {selectedSentence && (
                        <div className="selected-sentence">
                          <h4>Selected Sentence:</h4>
                          <ReactMarkdown>{selectedSentence}</ReactMarkdown>
                          <button onClick={handleSaveItem}>Save Sentence with Definition</button>
                        </div>
                    )}
                  </div>

                  <div className="token-info">
                    <h4>Token Information:</h4>
                    <p>
                      Input: {result.totalTokenCount.inputTokens}<br />
                      Output: {result.totalTokenCount.outputTokens}<br />
                      Total: {result.totalTokenCount.totalTokens}
                    </p>
                  </div>
                </div>
            )}
          </section>

          <section id="saved-items">
            <h2>Saved Sentences with Definitions</h2>
            {savedItems.length > 0 ? (
                <>
                  <ul className="saved-items-list">
                    {savedItems.map((item, index) => (
                        <li key={index}>
                          <div className="saved-item-content">
                            <ReactMarkdown>{item.sentence}</ReactMarkdown>
                            <ReactMarkdown>{item.definition}</ReactMarkdown>
                          </div>
                          <button onClick={() => handleRemoveSavedItem(item)}>Remove</button>
                        </li>
                    ))}
                  </ul>
                  <div className="action-buttons">
                    <button onClick={handleExport} className="export-button">Export</button>
                    <button onClick={handleClearAll} className="clear-all-button">Clear All</button>
                  </div>
                </>
            ) : (
                <p>No saved items yet. Generate some words and save sentences to see them here!</p>
            )}
          </section>
        </main>

        <footer>
          <p>
            📚📖🔖 Anki Assistant Languages |{' '}
            <a href="https://github.com/cantalupo555/anki-assistant-languages" target="_blank" rel="noopener noreferrer">
              GitHub Repository
            </a>
          </p>
        </footer>

        // Notifications
        {showSaveNotification && (
            <div className="notification save-notification">
              Sentence and definition saved successfully!
            </div>
        )}

        {showExportNotification && (
            <div className="notification export-notification">
              Items exported successfully!
            </div>
        )}

        {showRemoveNotification && (
            <div className="notification remove-notification">
              Item removed successfully!
            </div>
        )}

        {showClearAllNotification && (
            <div className="notification clear-all-notification">
              All items cleared successfully!
            </div>
        )}

        {showGenerateNotification && (
            <div className="notification generate-notification">
              Word generated successfully!
            </div>
        )}
      </div>
  );
}
