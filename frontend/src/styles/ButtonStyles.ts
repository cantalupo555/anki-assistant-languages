import styled from 'styled-components';

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

export const GenerateButton = styled(Button)`
  background-color: var(--primary-color);
  flex: 0 0 auto;

  &:hover {
    background-color: #0056b3;
  }
`;

export const DialogueButton = styled(Button)`
  background-color: var(--generate-color);

  &:hover {
    background-color: #096259;
  }

  &:disabled {
    background-color: var(--secondary-color);
  }
`;

export const AnalyzeButton = styled(Button)`
  background-color: var(--primary-color);
  flex: 0 0 auto;

  &:hover {
    background-color: #0056b3;
  }
`;

export const LoginButton = styled(Button)`
  width: 100%;
`;

export const RegisterButton = styled(Button)`
  background-color: var(--secondary-color);
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

export const ModalCloseButton = styled(Button)`
  padding: 15px;
  background: #f44336;
  border-radius: 0 0 12px 12px;
  width: 100%;

  &:hover {
    background: #d32f2f;
  }
`;

export const LogoutButton = styled(Button)`
  background-color: var(--remove-color);
  margin-left: 1rem;

  &:hover {
    background-color: #c82333;
  }
`;

export const ListenButton = styled(Button)`
  background-color: var(--primary-color);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;

  &:hover {
    background-color: #0056b3;
  }
`;

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

export const SaveButton = styled(Button)`
  background-color: var(--save-color);
  margin-top: 1rem;

  &:hover {
    background-color: #218838;
  }
`;

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
