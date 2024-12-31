import styled from 'styled-components';
import { Button } from '../styles/AppStyles'; // Import the base Button style

export const AppHeader = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--box-shadow);

  h1 {
    font-size: 1.8rem;
    font-weight: bold;
  }

  nav ul {
    list-style-type: none;
    display: flex;
    gap: 1.5rem;
  }

  nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity var(--hover-transition);

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const LogoutButton = styled(Button)`
  background-color: var(--remove-color);
  margin-left: 1rem;

  &:hover {
    background-color: #c82333;
  }
`;
