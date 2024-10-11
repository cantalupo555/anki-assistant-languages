// Import necessary libraries
// React: Core library for building user interfaces
import React, { useState } from 'react';
import '../styles/Login.css';
import { LoginProps } from '../utils/Types';

// Define the Login component
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate the username and password inputs
    if (username && password) {
      onLogin(username, password); // Call the onLogin function passed as a prop
      localStorage.setItem('isAuthenticated', 'true'); // Store the authentication state in localStorage
    } else {
      setError('Please fill in both username and password.'); // Set an error message if inputs are empty
    }
  };

  // Render the login form
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
                  onChange={(e) => setUsername(e.target.value)} // Update the username state on input change
                  required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update the password state on input change
                  required
              />
            </div>
            {error && <div className="error">{error}</div>} {/* Display the error message if it exists */}
            <button type="submit" className="login-button">Log in</button>
          </form>
        </div>
      </div>
  );
};

// Export the Login component
export default Login;
