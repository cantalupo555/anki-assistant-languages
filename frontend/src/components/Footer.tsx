import React from 'react';
import '../styles/App.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>📚📖🔖 Anki Assistant Languages</h3>
          <p>Enhance your language learning with AI-powered flashcards</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#card-generator">Card Generator</a></li>
            <li><a href="#saved-items">Saved Items</a></li>
            <li><a href={process.env.PUBLIC_URL + '/assets/AnkiAssistantLanguages.apkg'} download>Download Anki Note Type</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="https://github.com/cantalupo555/anki-assistant-languages" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
            <li><a href="https://ankiweb.net/" target="_blank" rel="noopener noreferrer">Anki Website</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Anki Assistant Languages. This project is open source under the MIT License.</p>
      </div>
    </footer>
  );
};

export default Footer;
