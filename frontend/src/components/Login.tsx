// Import necessary React hooks and components
import React, { useState } from 'react';

// Import styled components
import * as S from '../styles/LoginStyles';
import { LoginButton, RegisterButton } from '../styles/ButtonStyles';

// Import type definitions
import { LoginProps } from '../utils/Types';

// Define the Login component
const Login: React.FC<LoginProps & { onRegisterClick: () => void }> = ({ onLogin, onRegisterClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic field validation
        if (!username || !password) {
            setError('Please fill in both username and password fields.');
            return; // Remove duplicate return
        }

        // Clear previous errors
        setError(null);

        try {
            // Call the onLogin prop (which triggers useAuth's handleLogin)
            // handleLogin will perform the fetch and handle success/error states
            await onLogin(username, password);
            // If onLogin completes without throwing an error, login was successful.
            // Navigation or further actions should be handled by the parent component (AuthWrapper)
            // based on the updated isAuthenticated state from useAuth.

        } catch (error) {
            // handleLogin in useAuth should throw an error on failure
            console.error('Error during login (caught in Login.tsx):', error);
            // Display the error message from the thrown error
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login.';
            setError(errorMessage);
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
