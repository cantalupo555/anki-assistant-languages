import React, { useState } from 'react';
import '../styles/Login.css';
import { LoginProps } from '../utils/Types';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    } else {
      setError('Please fill in both username and password.');
    }
  };

  return (
      <div className="login-container">
        <div className="login-form">
          <h2>Log in</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-button">Log in</button>
          </form>
        </div>
      </div>
  );
};

export default Login;
