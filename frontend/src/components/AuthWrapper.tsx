// Import necessary React hooks and components
import React, { useState } from 'react'; // Removed unused useEffect

// Import internal components
import Login from './Login';
import Register from './Register';
import { Preloader } from './Preloader'; // Re-added import

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
        handleLogin
        // handleLogout // Removed unused handleLogout
    } = useAuth();
    // State to control the display of the registration form
    const [isRegistering, setIsRegistering] = useState(false);
    // We no longer need validateAndRefreshToken here, useAuth handles it internally now.

    // Function to handle the registration button click
    const handleRegisterClick = () => {
        setIsRegistering(true);
    };

    // Function to handle closing the registration form or successful registration
    const handleRegisterClose = () => {
        setIsRegistering(false);
    };

    // Avoid rendering children until initial auth check is complete
    // --- RE-ENABLED ---
    if (isCheckingAuth) {
        console.log(`[${new Date().toISOString()}] AuthWrapper: Rendering Preloader (isCheckingAuth: ${isCheckingAuth})`);
        // Display the Preloader component while checking auth status
        // Ensure Preloader is imported if uncommenting: import { Preloader } from './Preloader';
         return <Preloader />; // Uncommented this line
    } else {
         console.log(`[${new Date().toISOString()}] AuthWrapper: Rendering content (isCheckingAuth: ${isCheckingAuth}, isAuthenticated: ${isAuthenticated})`);
    }
    // --- END RE-ENABLED ---
    // console.log(`[${new Date().toISOString()}] AuthWrapper: Rendering content (Preloader disabled) (isCheckingAuth: ${isCheckingAuth}, isAuthenticated: ${isAuthenticated})`); // Keep this commented/remove

    // No longer need the useEffect for validateAndRefreshToken or interval checks here.
    // useAuth handles the initial check and potentially background refresh logic if needed.

    // Log state values just before returning JSX
    console.log(`[${new Date().toISOString()}] AuthWrapper: Final Render Check - isCheckingAuth: ${isCheckingAuth}, isAuthenticated: ${isAuthenticated}, isRegistering: ${isRegistering}`);

    return (
        <>
            {/* Render children if authenticated, otherwise show Login or Register */}
            {isAuthenticated ? (
                children // Render the main application content if authenticated
            ) : (
                isRegistering
                    ? <Register onRegister={handleRegisterClose} /> // Show Register form
                    : <Login onLogin={handleLogin} onRegisterClick={handleRegisterClick} /> // Show Login form
            )}
        </>
    );
};

export default AuthWrapper;
