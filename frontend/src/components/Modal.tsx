// Import necessary libraries
// React: Core library for building user interfaces
import React from 'react';
import * as S from '../styles/ModalStyles';
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
                <S.ModalCloseButton onClick={onClose}>Close</S.ModalCloseButton>
            </S.ModalContainer>
        </S.ModalOverlay>
    );
};

// Export the Modal component
export default Modal;
