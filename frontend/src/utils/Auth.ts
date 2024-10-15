// Import necessary libraries
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Function to handle login
    const handleLogin = (username: string, password: string) => {
        if (username === 'test' && password === 'test') {
            console.log('User:', username, 'Password:', password);
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true'); // Store the authentication state
            setIsCheckingAuth(false);
        } else {
            console.log('Invalid credentials');
            setIsCheckingAuth(false);
        }
    };

    // Function to handle logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('savedItems');
        localStorage.removeItem('audioData');
    };

    // Effect to load authentication state from localStorage on component mount
    useEffect(() => {
        const isAuthenticatedFromStorage = localStorage.getItem('isAuthenticated');

        if (isAuthenticatedFromStorage === 'true') {
            setIsAuthenticated(true);
        }
        setIsCheckingAuth(false); // Set checking auth to false after loading state
    }, []);

    return {
        isAuthenticated,
        isCheckingAuth,
        handleLogin,
        handleLogout,
    };
};

export default useAuth;
