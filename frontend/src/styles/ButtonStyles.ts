// Import styled-components for creating styled components
import styled from 'styled-components';

// Base button style
export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--hover-transition);
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
  }
`;

// Button for generating content
export const GenerateButton = styled(Button)`
  background-color: var(--primary-color);
  flex: 0 0 auto;

  &:hover {
    background-color: #0056b3;
  }
`;

// Button for generating dialogue
export const DialogueButton = styled(Button)`
  background-color: var(--generate-color);

  &:hover {
    background-color: #096259;
  }

  &:disabled {
    background-color: var(--secondary-color);
  }
`;

// Button for analyzing frequency
export const AnalyzeButton = styled(Button)`
  background-color: var(--primary-color);
  flex: 0 0 auto;

  &:hover {
    background-color: #0056b3;
  }
`;

// Button for login
export const LoginButton = styled(Button)`
  width: 100%;
`;

// Button for register
export const RegisterButton = styled(Button)`
  background-color: var(--secondary-color);
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

// Button for closing modal
export const ModalCloseButton = styled(Button)`
  padding: 15px;
  background: #f44336;
  border-radius: 0 0 12px 12px;
  width: 100%;

  &:hover {
    background: #d32f2f;
  }
`;

// Button for logout
export const LogoutButton = styled(Button)`
  background-color: var(--remove-color);
  margin-left: 1rem;

  &:hover {
    background-color: #c82333;
  }
`;

// Button for listening to TTS
export const ListenButton = styled(Button)`
  background-color: var(--primary-color);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;

  &:hover {
    background-color: #0056b3;
  }
`;

// Button for pagination
export const PaginationButton = styled(Button)`
  background-color: var(--secondary-color);
  padding: 0.5rem 1rem;
  min-width: 80px;

  &:hover {
    background-color: #5a6268;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Button for saving items
export const SaveButton = styled(Button)`
  background-color: var(--save-color);
  margin-top: 1rem;

  &:hover {
    background-color: #218838;
  }
`;

// Button for translating text
export const TranslateButton = styled(Button)`
  background-color: var(--translate-color);
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: var(--secondary-color);
    opacity: 0.7;
  }

  &.translating {
    background-color: #17a2b8;
    cursor: wait;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

// Button for navigating to the home page
export const HomeButton = styled(Button)`
  background-color: var(--home-color);
  margin-right: 0.5rem;

  &:hover {
    background-color: #0056b3;
  }
`;
