import React from 'react';
import useAuth from '../utils/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <header className="app-header">
      <h1>📚📖🔖 Anki Assistant Languages</h1>
      <nav>
        <ul>
          <li><a href="#card-generator">Card Generator</a></li>
          <li><a href="#saved-items">Saved Items</a></li>
        </ul>
      </nav>
      {isAuthenticated && (
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      )}
    </header>
  );
};

export default Header;
