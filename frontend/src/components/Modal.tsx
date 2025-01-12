// Import necessary React components
import React from 'react';

// Import styled components
import * as S from '../styles/ModalStyles';
import { ModalCloseButton } from '../styles/ButtonStyles';

// Import type definitions
import { ModalProps } from '../utils/Types';

// Define the Modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, contentType }) => {
    // If the modal is not open, return null to not render it
    if (!isOpen) return null;

    const contentClass = `modal-content modal-content-${contentType}`;

    // Return the modal structure
    return (
        <S.ModalOverlay>
            <S.ModalContainer>
                <S.ModalHeader>
                    <S.ModalTitle>{title}</S.ModalTitle>
                    <S.ModalCloseIcon onClick={onClose}>&times;</S.ModalCloseIcon>
                </S.ModalHeader>
                <S.ModalContent className={contentClass}>
                    {children} {/* Content of the modal */}
                </S.ModalContent>
                <ModalCloseButton onClick={onClose}>Close</ModalCloseButton>
            </S.ModalContainer>
        </S.ModalOverlay>
    );
};

// Export the Modal component
export default Modal;
