import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../utils/useAuth';
import * as S from '../styles/HeaderStyles';
import { LogoutButton, HomeButton } from '../styles/ButtonStyles';

const Header: React.FC = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <S.AppHeader>
      <h1>📚📖🔖 Anki Assistant Languages</h1>
      {isAuthenticated && (
        <HomeButton as={Link} to="/">Home</HomeButton>
      )}
      <nav>
        <ul>
          <li><Link to="/">Card Generator</Link></li>
          <li><Link to="/">Saved Items</Link></li>
          <li><Link to="/stats">Stats</Link></li>
        </ul>
      </nav>
      {isAuthenticated && (
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      )}
    </S.AppHeader>
  );
};

export default Header;
