import React from 'react';
import useAuth from '../utils/useAuth';
import * as S from '../styles/HeaderStyles';

const Header: React.FC = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <S.AppHeader>
      <h1>📚📖🔖 Anki Assistant Languages</h1>
      <nav>
        <ul>
          <li><a href="#card-generator">Card Generator</a></li>
          <li><a href="#saved-items">Saved Items</a></li>
        </ul>
      </nav>
      {isAuthenticated && (
        <S.LogoutButton onClick={handleLogout}>Logout</S.LogoutButton>
      )}
    </S.AppHeader>
  );
};

export default Header;
