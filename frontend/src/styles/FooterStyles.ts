// Import styled-components for creating styled components
import styled from 'styled-components';

// Styled component for the application footer
export const AppFooter = styled.footer`
  background-color: var(--primary-color);
  color: white;
  padding: 2rem 1rem;
  margin-top: 2rem;
`;

// Styled component for the footer content container
export const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

// Styled component for a section within the footer
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

// Styled component for the bottom section of the footer
export const FooterBottom = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;
