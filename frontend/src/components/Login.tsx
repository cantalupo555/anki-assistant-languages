// Import necessary libraries
// React: Core library for building user interfaces
import React, { useState } from 'react';
import * as S from '../styles/LoginStyles';
import { LoginButton, RegisterButton } from '../styles/ButtonStyles';
import { LoginProps } from '../utils/Types';

// Define the Login component
const Login: React.FC<LoginProps & { onRegisterClick: () => void }> = ({ onLogin, onRegisterClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate the username and password inputs
        if (!username || !password) {
            setError('Please fill in both username and password.'); // Set an error message if inputs are empty
            return;
        }

        try {
            // Send a POST request to the backend to login the user
            const response = await fetch('http://localhost:5000/login', { // Use the correct backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Call the onLogin function passed as a prop with the username and password
                onLogin(username, password);
                localStorage.setItem('isAuthenticated', 'true'); // Store the authentication state in localStorage
                localStorage.setItem('token', data.token); // Store the token in localStorage
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed. Please try again.'); // Set an error message if login fails
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Login failed. Please try again.'); // Set a generic error message if an error occurs
        }
    };

    // Function to handle registration button click
    const handleRegisterClick = () => {
        onRegisterClick(); // Call the onRegisterClick function passed as a prop
    };

    // Render the login form
    return (
        <S.LoginContainer>
            <S.LoginForm>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                    <S.FormGroup>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // Update the username state on input change
                            required
                        />
                    </S.FormGroup>
                    <S.FormGroup>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Update the password state on input change
                            required
                        />
                    </S.FormGroup>
                    {error && <S.ErrorMessage>{error}</S.ErrorMessage>} {/* Display the error message if it exists */}
                    <LoginButton type="submit">Log in</LoginButton>
                </form>
                <RegisterButton type="button" onClick={handleRegisterClick}>Register</RegisterButton> {/* Add the register button */}
            </S.LoginForm>
        </S.LoginContainer>
    );
};

// Export the Login component
export default Login;
