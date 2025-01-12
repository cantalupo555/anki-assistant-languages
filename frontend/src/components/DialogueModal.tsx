// Import necessary React components
import React from 'react';

// Import internal components
import Modal from './Modal';

// Import external libraries
import ReactMarkdown from 'react-markdown';

// Import type definitions
import { TokenCount } from '../utils/Types';

// Define the props for the DialogueModal component
interface DialogueModalProps {
    isOpen: boolean;
    onClose: () => void;
    dialogue: { text: string; tokenCount: TokenCount } | null;
}

// Define the DialogueModal component
const DialogueModal: React.FC<DialogueModalProps> = ({ isOpen, onClose, dialogue }) => {
    // Render the modal
    return (
        <Modal
            isOpen={isOpen} // Pass the isOpen prop to the Modal component
            onClose={onClose} // Pass the onClose prop to the Modal component
            title="Generated Dialogue" // Set the title of the modal
            contentType="dialogue" // Set the content type of the modal
        >
            {/* Check if dialogue data is available */}
            {dialogue ? (
                <div className="dialogue">
                    {/* Render the dialogue text using ReactMarkdown */}
                    <ReactMarkdown>{dialogue.text}</ReactMarkdown>
                </div>
            ) : (
                // Display a message if no dialogue data is available
                <p>No dialogue data available.</p>
            )}
        </Modal>
    );
};

// Export the DialogueModal component
export default DialogueModal;
