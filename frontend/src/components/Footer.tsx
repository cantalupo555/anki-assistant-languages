// Import necessary React components
import React from 'react';

// Import styled components
import * as S from '../styles/FooterStyles';

const Footer: React.FC = () => {
  return (
    <S.AppFooter>
      <S.FooterContent>
        <S.FooterSection>
          <h3>📚📖🔖 Anki Assistant Languages</h3>
          <p>Enhance your language learning with AI-powered flashcards</p>
        </S.FooterSection>
        <S.FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#card-generator">Card Generator</a></li>
            <li><a href="#saved-items">Saved Items</a></li>
            <li><a href={process.env.PUBLIC_URL + '/assets/AnkiAssistantLanguages.apkg'} download>Download Anki Note Type</a></li>
          </ul>
        </S.FooterSection>
        <S.FooterSection>
          <h3>Connect</h3>
          <ul>
            <li><a href="https://github.com/cantalupo555/anki-assistant-languages" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
            <li><a href="https://ankiweb.net/" target="_blank" rel="noopener noreferrer">Anki Website</a></li>
          </ul>
        </S.FooterSection>
      </S.FooterContent>
      <S.FooterBottom>
        <p>&copy; 2024 Anki Assistant Languages. This project is open source under the MIT License.</p>
      </S.FooterBottom>
    </S.AppFooter>
  );
};

export default Footer;
