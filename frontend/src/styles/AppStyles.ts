import styled from 'styled-components';
import { AppHeader } from './HeaderStyles';

export const GlobalStyles = styled.div`
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #f8f9fa;
  --text-color: #333;
  --border-color: #dee2e6;
  --save-color: #28a745;
  --export-color: #17a2b8;
  --remove-color: #dc3545;
  --clear-color: #ffc107;
  --generate-color: #0b7e73;
  --translate-color: #007bff;
  --hover-transition: 0.3s ease;
  --box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
  }
`;

export const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export const MainContent = styled.main`
  padding: 2rem 0;
`;

export const Section = styled.section`
  margin-bottom: 2rem;

  h2 {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 0.5rem;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const Form = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: block;
  }

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
`;

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

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
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

export const TranslateButton = styled(Button)`
  background-color: var(--translate-color);

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

export const ResultContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: var(--box-shadow);
`;

export const ResultSection = styled.div`
  margin-bottom: 2rem;

  h4 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
`;

export const SentenceList = styled.ul`
  list-style-type: none;

  li {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 1rem;
    padding: 1rem;
    transition: all var(--hover-transition);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover, &.selected {
      background-color: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  button {
    background-color: var(--secondary-color);

    &:hover {
      background-color: #5a6268;
    }
  }
`;

export const SavedItemsList = styled.ul`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: var(--box-shadow);

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }
`;

export const SavedItemContent = styled.div`
  flex-grow: 1;
`;

export const ActionButtons = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

export const ExportButton = styled(Button)`
  background-color: var(--export-color);
`;

export const ClearAllButton = styled(Button)`
  background-color: var(--clear-color);
`;

export const TokenInfo = styled.div`
  background-color: #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;

  h4 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
  }
`;

export const AppFooter = styled.footer`
  background-color: var(--primary-color);
  color: white;
  padding: 2rem 1rem;
  margin-top: 2rem;
`;

export const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

export const FooterSection = styled.div`
  flex: 1;
  margin-bottom: 1rem;
  min-width: 200px;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: white;
  }

  ul {
    list-style-type: none;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: white;
    text-decoration: none;
    transition: opacity var(--hover-transition);

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const FooterBottom = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const Error = styled.div`
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
`;

export const Notification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  animation: fadeInOut 3s ease-in-out;
  z-index: 1000;
  max-width: 90%;
  text-align: center;
  font-weight: 600;

  &.save-notification { background-color: var(--save-color); }
  &.export-notification { background-color: var(--export-color); }
  &.remove-notification { background-color: var(--remove-color); }
  &.clear-all-notification { background-color: var(--clear-color); }
  &.generate-notification { background-color: var(--generate-color); }

  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

export const ScrollToTop = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--hover-transition);
  box-shadow: var(--box-shadow);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
`;

// Responsive styles
export const ResponsiveStyles = styled.div`
  @media (max-width: 768px) {
    ${AppHeader} {
      flex-direction: column;
      text-align: center;

      nav {
        margin-top: 1rem;
      }

      nav ul {
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    ${Form}, ${ResultContainer}, ${SavedItemsList} {
      padding: 1rem;
    }

    ${ActionButtons} {
      flex-direction: column;
    }

    #language-select {
      max-width: 100%;
    }

    ${ScrollToTop} {
      width: 40px;
      height: 40px;
      font-size: 20px;
      bottom: 20px;
      right: 20px;
    }

    ${ButtonContainer} {
      flex-direction: column;
      align-items: stretch;
    }

    ${GenerateButton}, ${AnalyzeButton}, ${TranslateButton} {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  }
`;
