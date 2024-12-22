// Import necessary React hooks and components
import React, { useState } from 'react';

// Import internal components
import Login from './Login';
import Register from './Register';
import useAuth from '../utils/useAuth';

// Define the props for the AuthWrapper component
interface AuthWrapperProps {
    children: React.ReactNode;
}

// Define the AuthWrapper component
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    // Get authentication state and login function from useAuth hook
    const { isAuthenticated, isCheckingAuth, handleLogin } = useAuth();
    // State to control the display of the registration form
    const [isRegistering, setIsRegistering] = useState(false);

    // Function to handle the registration button click
    const handleRegisterClick = () => {
        setIsRegistering(true);
    };

    // Function to handle closing the registration form
    const handleRegisterClose = () => {
        setIsRegistering(false);
    };

    // Display a loading screen while checking authentication status
    if (isCheckingAuth) {
        return <div className="loading-screen"><p>Loading...</p></div>;
    }

    // Render the appropriate content based on authentication status
    return (
        <>
            {isAuthenticated ? (
                // Render the children if the user is authenticated
                children
            ) : (
                // Render the registration or login form if the user is not authenticated
                isRegistering ? <Register onRegister={handleRegisterClose} /> : <Login onLogin={handleLogin} onRegisterClick={handleRegisterClick} />
            )}
            {!isAuthenticated && (
                // Display buttons to switch between login and registration forms
                <div className="auth-switch">
                    <button onClick={() => setIsRegistering(false)}>Go to Login</button>
                    <button onClick={() => setIsRegistering(true)}>Go to Register</button>
                </div>
            )}
        </>
    );
};

export default AuthWrapper;
