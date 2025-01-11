// Import necessary libraries
import { useState, useEffect, useCallback } from 'react';

// Define the backend API URL, using environment variables or a default value
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

// Define the useAuth hook, which manages authentication state and logic
const useAuth = () => {
    // State variable to store the authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State variable to indicate if the authentication state is being checked
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // State variable to store the user data
    const [user, setUser] = useState<any>(null);

    // Function to handle login
    const handleLogin = async (username: string, password: string) => {
        try {
            // Send a POST request to the backend to login the user
            const response = await fetch(`${BACKEND_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true); // Set the authentication status to true
                localStorage.setItem('isAuthenticated', 'true'); // Store the authentication state in localStorage
                localStorage.setItem('token', data.token); // Store the token in localStorage
                await fetchUser(); // Fetch user data after login
            } else {
                console.error('Login failed');
                setIsAuthenticated(false);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Function to handle registration
    const handleRegister = async (username: string, email: string, password: string) => {
        try {
            const response = await fetch(`${BACKEND_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password,
                    status: 'active', // Adding default status
                    role: 'user'      // Adding default role
                }),
            });

            if (response.ok) {
                 const data = await response.json();
                 setIsAuthenticated(true);
                 localStorage.setItem('isAuthenticated', 'true');
                 localStorage.setItem('token', data.token);
                 await fetchUser();
             } else {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Registration failed');
             }
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    };

    // Function to fetch user data
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`${BACKEND_API_URL}/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user data');
                    handleLogout();
                }
            } catch (error) {
                console.error('Error fetching user ', error);
                handleLogout();
            }
        }
    }, []);

    // Function to handle logout
    const handleLogout = () => {
        setIsAuthenticated(false); // Set the authentication status to false
        localStorage.removeItem('isAuthenticated'); // Remove the authentication state from localStorage
        localStorage.removeItem('token'); // Remove the token from localStorage
        localStorage.removeItem('savedItems'); // Remove saved items from localStorage
        localStorage.removeItem('audioData'); // Remove audio data from localStorage
        setUser(null); // Clear user data
    };

    // Effect to load authentication state from localStorage on component mount
    const checkAuth = useCallback(async () => {
        // Get the authentication state from localStorage
        const isAuthenticatedFromStorage = localStorage.getItem('isAuthenticated');
        const token = localStorage.getItem('token');

        // If the authentication state is true, set the authentication status to true
        if (isAuthenticatedFromStorage === 'true' && token) {
            setIsAuthenticated(true);
            await fetchUser();
        }
        setIsCheckingAuth(false); // Set checking auth to false after loading state
    }, [fetchUser]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Return the authentication state and functions
    return {
        isAuthenticated,
        isCheckingAuth,
        handleLogin,
        handleRegister,
        handleLogout,
        user,
    };
};

export default useAuth;
