// Import necessary libraries
import { useState, useEffect } from 'react';

// Define the backend API URL, using environment variables or a default value
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

// Define the useAuth hook, which manages authentication state and logic
const useAuth = () => {
    // State variable to store the authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State variable to indicate if the authentication state is being checked
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Function to handle login
    const handleLogin = (username: string, password: string) => {
        // Check if the username and password match the test credentials
        if (username === 'test' && password === 'test') {
            console.log('User:', username, 'Password:', password);
            setIsAuthenticated(true); // Set the authentication status to true
            localStorage.setItem('isAuthenticated', 'true'); // Store the authentication state in localStorage
            setIsCheckingAuth(false); // Set the checking auth state to false
        } else {
            console.log('Invalid credentials');
            setIsCheckingAuth(false); // Set the checking auth state to false
        }
    };

    // Function to handle registration
    const handleRegister = async (username: string, email: string, password: string) => {
        try {
            // Send a POST request to the backend to register the user
            const response = await fetch(`${BACKEND_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                // Registration successful, you might want to automatically log the user in
                handleLogin(username, password);
            } else {
                console.error('Registration failed');
                // Handle registration error (e.g., display error message)
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    // Function to handle logout
    const handleLogout = () => {
        setIsAuthenticated(false); // Set the authentication status to false
        localStorage.removeItem('isAuthenticated'); // Remove the authentication state from localStorage
        localStorage.removeItem('savedItems'); // Remove saved items from localStorage
        localStorage.removeItem('audioData'); // Remove audio data from localStorage
    };

    // Effect to load authentication state from localStorage on component mount
    useEffect(() => {
        // Get the authentication state from localStorage
        const isAuthenticatedFromStorage = localStorage.getItem('isAuthenticated');

        // If the authentication state is true, set the authentication status to true
        if (isAuthenticatedFromStorage === 'true') {
            setIsAuthenticated(true);
        }
        setIsCheckingAuth(false); // Set checking auth to false after loading state
    }, []);

    // Return the authentication state and functions
    return {
        isAuthenticated,
        isCheckingAuth,
        handleLogin,
        handleRegister,
        handleLogout,
    };
};

export default useAuth;
