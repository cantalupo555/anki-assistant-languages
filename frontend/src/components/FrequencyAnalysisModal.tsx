// Import necessary libraries
// React: Core library for building user interfaces
import React from 'react';
// Modal: Reusable modal component
import Modal from './Modal';
// ReactMarkdown: Component to render Markdown as React components
import ReactMarkdown from 'react-markdown';
// FrequencyAnalysis: Type definition for frequency analysis data
import { FrequencyAnalysis } from '../utils/Types';

// Define the props for the FrequencyAnalysisModal component
interface FrequencyAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    frequencyAnalysis: FrequencyAnalysis | null;
}

// Define the FrequencyAnalysisModal component
const FrequencyAnalysisModal: React.FC<FrequencyAnalysisModalProps> = ({ isOpen, onClose, frequencyAnalysis }) => {
    // Render the modal
    return (
        <Modal
            isOpen={isOpen} // Pass the isOpen prop to the Modal component
            onClose={onClose} // Pass the onClose prop to the Modal component
            title="Frequency Analysis" // Set the title of the modal
            contentType="analysis" // Set the content type of the modal
        >
            {/* Check if frequency analysis data is available */}
            {frequencyAnalysis ? (
                <div className="frequency-analysis">
                    {/* Render the frequency analysis text using ReactMarkdown */}
                    <ReactMarkdown>{frequencyAnalysis.text}</ReactMarkdown>
                </div>
            ) : (
                // Display a message if no analysis data is available
                <p>No analysis data available.</p>
            )}
        </Modal>
    );
};

// Export the FrequencyAnalysisModal component
export default FrequencyAnalysisModal;
