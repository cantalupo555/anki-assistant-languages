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
        
        // Basic field validation
        if (!username || !password) {
            setError('Please fill in both username and password fields.');
            return;
        }

        try {
            // Make a POST request to the login endpoint
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST', // Use POST method for login
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify({ 
                    username, // Send username from form
                    password  // Send password from form
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store authentication information
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', data.token);
                
                // Store user information
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role,
                    status: data.user.status
                }));

                // Call login function with required information
                onLogin(username, password);
                
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred during login. Please try again.');
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
