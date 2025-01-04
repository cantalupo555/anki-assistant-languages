import styled from 'styled-components';
import { Button } from './ButtonStyles';

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

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
`;

export const LoginForm = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 400px;

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
  }
`;

export const ErrorMessage = styled.div`
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
`;

export const AuthSwitch = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color var(--hover-transition);

    &:hover {
      background-color: var(--primary-color);
    }
  }
`;
