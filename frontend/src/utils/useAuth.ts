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
            const response = await fetch(`${BACKEND_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                
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

                await fetchUser();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
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
    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('savedItems');
        localStorage.removeItem('audioData');
        setUser(null);
    }, [setIsAuthenticated, setUser]); // Add stable dependencies

    // Effect to load authentication state from localStorage on component mount
    const validateToken = async (token: string) => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/auth/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) throw new Error('Invalid token');
        return await response.json();
      } catch (error) {
        throw new Error('Token validation failed');
      }
    };

    const refreshToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token available');
        
        const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to refresh token');
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.token;
      } catch (error) {
        handleLogout();
        throw error;
      }
    };

    const checkAuth = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { isValid } = await validateToken(token);
          if (!isValid) {
            await refreshToken();
          }
          setIsAuthenticated(true);
          await fetchUser();
        } catch (error) {
          handleLogout();
        }
      }
      setIsCheckingAuth(false);
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

// Function type for token validation
export type TokenValidator = () => Promise<string | null>;

export default useAuth;
