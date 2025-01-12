import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../utils/useAuth';
import * as S from '../styles/HeaderStyles';
import { LogoutButton, HomeButton } from '../styles/ButtonStyles';

// Define the Header component
const Header: React.FC = () => {
  // Get authentication status and logout handler from useAuth hook
  const { isAuthenticated, handleLogout } = useAuth();

  // Render the header
  return (
    <S.AppHeader>
      {/* Application title */}
      <h1>📚📖🔖 Anki Assistant Languages</h1>
      {/* Home button, only visible when the user is authenticated */}
      {isAuthenticated && (
        <HomeButton as={Link} to="/">Home</HomeButton>
      )}
      {/* Navigation menu */}
      <nav>
        <ul>
          {/* Navigation links */}
          <li><Link to="/">Card Generator</Link></li>
          <li><Link to="/">Saved Items</Link></li>
          <li><Link to="/stats">Stats</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
      {/* Logout button, only visible when the user is authenticated */}
      {isAuthenticated && (
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      )}
    </S.AppHeader>
  );
};

export default Header;
