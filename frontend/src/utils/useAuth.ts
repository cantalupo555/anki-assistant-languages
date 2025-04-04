// Import necessary libraries
import { useState, useEffect, useCallback, useRef } from 'react';

// Define the backend API URL, using environment variables or a default value
// const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000'; // No longer needed for relative paths

// Define the useAuth hook, which manages authentication state and logic
const useAuth = () => {
    // State variable to store the authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State variable to indicate if the authentication state is being checked
    console.log(`[${new Date().toISOString()}] useAuth: Initializing state, isCheckingAuth = true`);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // State variable to store the user data
    const [user, setUser] = useState<any>(null);
    // State variable to store the access token IN MEMORY
    const [accessToken, setAccessToken] = useState<string | null>(null);
    // Ref to track if the initial auth check has run (to prevent StrictMode double execution)
    const didInitialize = useRef(false);
    // Ref to prevent concurrent refresh token calls
    const isRefreshing = useRef(false);

    // Function to handle login
    const handleLogin = async (username: string, password: string) => {
        // Removed setIsCheckingAuth(true). Login loading should be handled locally if needed.
        try {
            const response = await fetch(`/login`, { // Use relative path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                }),
                credentials: 'include' // Send cookies if any exist, needed for potential future session checks
            });

            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.accessToken); // Store access token in state (memory)
                setIsAuthenticated(true); // Set authenticated state immediately on successful login
                setUser(data.user); // Set user data immediately
                // Refresh token is handled by HttpOnly cookie automatically
                // The initial useEffect will still run refreshToken for verification/refresh if needed
            } else {
                const errorData = await response.json();
                // Clear state on failed login
                setAccessToken(null);
                setIsAuthenticated(false);
                setUser(null);
                throw new Error(errorData.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            // Ensure state is cleared on error
            setAccessToken(null);
            setIsAuthenticated(false);
            setUser(null);
            // Clean up any potential leftover local storage items from previous versions
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error; // Re-throw error for the component to handle
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Function to handle registration
    const handleRegister = async (username: string, email: string, password: string) => {
        // Removed setIsCheckingAuth(true). Registration loading should be handled locally if needed.
        try {
            const response = await fetch(`/register`, { // Use relative path
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
                credentials: 'include' // Send cookies if any exist
            });

            if (response.ok) {
                 const data = await response.json();
                 setAccessToken(data.accessToken); // Store access token in state (memory)
                 setIsAuthenticated(true); // Set authenticated state immediately on successful registration
                 setUser(data.user); // Set user data immediately
                 // Refresh token handled by HttpOnly cookie
                 // The initial useEffect will still run refreshToken for verification/refresh if needed
             } else {
                 const errorData = await response.json();
                 // Clear state on failed registration
                 setAccessToken(null);
                 setIsAuthenticated(false);
                 setUser(null);
                 throw new Error(errorData.error || 'Registration failed');
             }
        } catch (error) {
            console.error('Error during registration:', error);
            // Ensure state is cleared on error
            setAccessToken(null);
            setIsAuthenticated(false);
            setUser(null);
            throw error; // Re-throw error
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Function to handle logout (Moved Here)
    const handleLogout = useCallback(async () => {
        console.log("handleLogout: Initiating logout...");
        // Removed setIsCheckingAuth(false). Logout shouldn't affect initial loading state.
        // Call backend logout first to invalidate refresh token and clear cookie
        try {
            const response = await fetch(`/logout`, { // Use relative path
                method: 'POST',
                credentials: 'include', // Necessary to send cookie for backend invalidation
            });
            if (!response.ok) {
                console.warn("handleLogout: Backend logout call failed with status:", response.status);
            } else {
                console.log("handleLogout: Backend logout successful.");
            }
        } catch (error) {
            console.error("handleLogout: Error calling backend logout:", error);
            // Proceed with frontend logout even if backend call fails
        } finally {
            // Clear frontend state regardless of backend response
            console.log(`[${new Date().toISOString()}] handleLogout: FINALLY block. Clearing state.`);
            setAccessToken(null);
            setIsAuthenticated(false);
            setUser(null);
            // Clear any legacy localStorage items just in case
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token'); // Remove old token key
            localStorage.removeItem('savedItems');
            localStorage.removeItem('audioData');
            localStorage.removeItem('user');
            console.log("handleLogout: Frontend state cleared.");
            // Optionally redirect to login page
            // window.location.href = '/login';
        }
    }, []); // No dependencies needed

    // Function to attempt refreshing the access token
    const refreshToken = useCallback(async (): Promise<boolean> => {
        // *** Stricter check: Immediately exit if already refreshing ***
        if (isRefreshing.current) {
            console.warn(`[${new Date().toISOString()}] refreshToken: Aborted! Refresh operation already in progress.`);
            // Return a resolved promise indicating no action was taken, or potentially the expected outcome
            // For simplicity, let's return false, indicating no successful refresh occurred *in this specific call*.
            return false;
        }

        isRefreshing.current = true; // Mark refresh as started *only if* not already in progress
        console.log(`[${new Date().toISOString()}] refreshToken: Attempting... (isRefreshing = true)`);

        try {
            const fetchOptions = {
                method: 'POST',
                credentials: 'include' as RequestCredentials, // Ensure type correctness
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            console.log(`[${new Date().toISOString()}] refreshToken: Calling fetch /auth/refresh with options:`, fetchOptions); // Log fetch options
            const response = await fetch(`/auth/refresh`, fetchOptions); // Use relative path

            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.accessToken); // Store the new access token in state
                setIsAuthenticated(true); // Mark as authenticated
                // Update user data directly from refresh response
                if (data.user) {
                    setUser(data.user);
                    console.log(`[${new Date().toISOString()}] refreshToken: User state updated from refresh response:`, data.user);
                } else {
                    // This shouldn't happen if backend always returns user on success
                    console.warn(`[${new Date().toISOString()}] refreshToken: Success response received, but no user data found.`);
                    // Optionally call fetchUser here as a fallback, but ideally backend should provide it
                    // await fetchUser(data.accessToken); // Example fallback
                }
                console.log(`[${new Date().toISOString()}] refreshToken: Success.`);
                return true; // Indicate success
            } else {
                // Log based on status code
                if (response.status === 401) {
                    console.log(`[${new Date().toISOString()}] refreshToken: Failed with status 401 (Likely no active session).`);
                } else {
                    console.error(`[${new Date().toISOString()}] refreshToken: Failed, status:`, response.status);
                }
                // If refresh fails (e.g., 401, 403 means invalid/expired refresh token), logout
                 console.log(`[${new Date().toISOString()}] refreshToken: Refresh failed, calling handleLogout...`);
                 await handleLogout(); // Use await as handleLogout is async
                // Setting isCheckingAuth(false) is handled in finally
                return false; // Indicate failure
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] refreshToken: Network or other error:`, error);
             console.log(`[${new Date().toISOString()}] refreshToken: Error caught, calling handleLogout...`);
             await handleLogout(); // Logout on network or other errors
            return false; // Indicate failure
        } finally {
             console.log(`[${new Date().toISOString()}] refreshToken: FINALLY block reached.`);
             isRefreshing.current = false; // Mark refresh as finished
             console.log(`[${new Date().toISOString()}] refreshToken: FINALLY block (isRefreshing = false)`);
        }
    }, [handleLogout]); // Add handleLogout as dependency

    // Effect to check authentication status on initial load
    useEffect(() => {
        // This ref ensures the core logic runs only once.
        if (!didInitialize.current) {
            didInitialize.current = true;
            console.log(`[${new Date().toISOString()}] useAuth: Initializing - First Run (didInitialize set).`);

            const attemptInitialRefresh = async () => {
                console.log(`[${new Date().toISOString()}] useAuth: Attempting initial refreshToken...`);
                try {
                    await refreshToken(); // Call the refresh token logic
                } catch (e) {
                    // Errors during initial refresh are handled within refreshToken (calls handleLogout)
                    console.error(`[${new Date().toISOString()}] useAuth: Error during initial refreshToken attempt:`, e);
                } finally {
                    // This block runs regardless of success or failure of refreshToken
                    console.log(`[${new Date().toISOString()}] useAuth: Initial refreshToken attempt finished (finally block). Setting isCheckingAuth = false.`);
                    // Crucially, set checking to false *only* after the first attempt is fully completed.
                    setIsCheckingAuth(false);
                }
            };

            // Execute the attempt.
            attemptInitialRefresh();

        } else {
            // Log subsequent renders (e.g., StrictMode) but don't re-run the core logic or setIsCheckingAuth.
            console.log(`[${new Date().toISOString()}] useAuth: Skipping initialization (already run or StrictMode re-run).`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Keep empty dependency array for mount-only execution.

    // The logic previously in this effect is now handled by:
    // 1. refreshToken success: Sets isAuthenticated and user.
    // 2. refreshToken failure: Calls handleLogout, which clears state.
    // 3. handleLogout: Clears state.

    // Return the authentication state and functions
    return {
        isAuthenticated,
        isCheckingAuth,
        user,
        accessToken, // Expose accessToken for API call wrappers
        handleLogin,
        handleRegister,
        handleLogout,
        refreshToken, // Expose refresh function if needed
        // attemptRefreshOrLogout // This helper might be less needed now
    };
};

// Function type for token validation (might not be needed anymore)
export type TokenValidator = () => Promise<string | null>;

export default useAuth;
