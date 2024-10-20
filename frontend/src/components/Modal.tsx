// Import necessary libraries
// React: Core library for building user interfaces
import React from 'react';
import '../styles/Modal.css';
import { ModalProps } from '../utils/Types';

// Define the Modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, contentType }) => {
    // If the modal is not open, return null to not render it
    if (!isOpen) return null;

    const contentClass = `modal-content modal-content-${contentType}`;

    // Return the modal structure
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <span className="modal-close-icon" onClick={onClose}>&times;</span>
                </div>
                <div className={contentClass}>
                    {children} {/* Content of the modal */}
                </div>
                <button className="modal-close-button" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

// Export the Modal component
export default Modal;
