// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';

// Import token validation utility
import { validateAndRefreshToken } from '../utils/validateAndRefreshToken';

// Import internal components
import Login from './Login';
import Register from './Register';

// Import internal utility functions
import useAuth from '../utils/useAuth';

// Define the props for the AuthWrapper component
interface AuthWrapperProps {
    children: React.ReactNode;
}

// Define the AuthWrapper component
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    // Get authentication state and functions from useAuth hook
    const { 
        isAuthenticated, 
        isCheckingAuth, 
        handleLogin,
        handleLogout
    } = useAuth();
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

    // Avoid rendering until initial auth check is complete
    if (isCheckingAuth) {
        return <div className="loading-screen"><p>Loading...</p></div>;
    }

    useEffect(() => {
        const validateSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await validateAndRefreshToken();
                }
            } catch (error) {
                handleLogout();
            }
        };

        validateSession();
        const interval = setInterval(validateSession, 300000);
        return () => clearInterval(interval);
    }, [isAuthenticated, handleLogout]); // Correct dependencies

    return (
        <>
            {isAuthenticated ? (
                children
            ) : (
                isRegistering 
                    ? <Register onRegister={() => setIsRegistering(false)} /> 
                    : <Login onLogin={handleLogin} onRegisterClick={() => setIsRegistering(true)} />
            )}
        </>
    );
};

export default AuthWrapper;
