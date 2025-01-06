// Import styled-components for creating styled components
import styled from 'styled-components';

// Styled component for the application header
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
    margin: 0 1rem; /* Add spacing around nav items */
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

