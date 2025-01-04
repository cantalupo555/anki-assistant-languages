import styled from 'styled-components';
import { Button } from './ButtonStyles';

export const ModalCloseButton = styled(Button)`
  padding: 15px;
  background: #f44336;
  border-radius: 0 0 12px 12px;
  width: 100%;

  &:hover {
    background: #d32f2f;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  transition: opacity 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export const ModalHeader = styled.div`
  background: #2196F3;
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

export const ModalTitle = styled.h2`
  font-size: 1.4em;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
`;

export const ModalCloseIcon = styled.span`
  cursor: pointer;
  font-size: 1.5em;
  transition: color 0.3s ease;

  &:hover {
    color: #e0e0e0;
  }
`;

export const ModalContent = styled.div`
  padding: 30px;
  overflow-y: auto;
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.6;

  &.modal-content-dialogue {
    white-space: pre-wrap;
  }

  &.modal-content-analysis {
    p {
      margin-bottom: 15px;
    }

    ul, ol {
      padding-left: 20px;
      margin-bottom: 15px;
    }

    li {
      margin-bottom: 10px;
    }
  }

  h2 {
    color: #333;
    border-bottom: 2px solid #2196F3;
    padding-bottom: 10px;
    margin-top: 0;
    margin-bottom: 20px;
  }

  p {
    margin-bottom: 15px;
    color: #555;
  }

  ol {
    padding-left: 20px;
  }

  li {
    margin-bottom: 10px;
  }

  strong {
    color: #2196F3;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export const ResponsiveModal = styled.div`
  @media (max-width: 768px) {
    ${ModalContainer} {
      width: 95%;
      margin: 10px;
    }

    ${ModalHeader} {
      padding: 15px;
    }

    ${ModalContent} {
      padding: 20px;
      font-size: 14px;
    }
  }
`;
