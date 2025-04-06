// Import necessary libraries
import { useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

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
    // State variable to store the access token's expiration timestamp (in seconds since epoch)
    const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);
    // Ref to prevent concurrent refresh token calls (used in callApiWithAuth)
    const isRefreshing = useRef(false);
    // Ref to ensure initial check runs only once despite StrictMode
    const didRunInitialCheck = useRef(false);

    // Function to handle login
    const handleLogin = async (username: string, password: string) => {
        // Removed setIsCheckingAuth(true). Login loading should be handled locally if needed.
        try {
            const response = await fetch(`/auth/login`, { // Use relative path
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
                const newAccessToken = data.accessToken;
                setAccessToken(newAccessToken); // Store access token in state (memory)
                // Decode token to get expiration time
                try {
                    const decodedToken: { exp: number } = jwtDecode(newAccessToken);
                    setAccessTokenExpiresAt(decodedToken.exp); // Store expiration timestamp (seconds)
                    console.log(`[${new Date().toISOString()}] handleLogin: New access token expires at: ${new Date(decodedToken.exp * 1000).toISOString()}`);
                } catch (decodeError) {
                    console.error("Error decoding access token:", decodeError);
                    setAccessTokenExpiresAt(null); // Clear expiration if decode fails
                }
                setIsAuthenticated(true); // Set authenticated state immediately on successful login
                setUser(data.user); // Set user data immediately
                // Refresh token is handled by HttpOnly cookie automatically
                // The initial useEffect will still run refreshToken for verification/refresh if needed
            } else {
                const errorData = await response.json();
                // Clear state on failed login
                setAccessToken(null);
                setAccessTokenExpiresAt(null); // Clear expiration on failed login
                setIsAuthenticated(false);
                setUser(null);
                throw new Error(errorData.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            // Ensure state is cleared on error
            setAccessToken(null);
            setAccessTokenExpiresAt(null); // Clear expiration on error
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
            const response = await fetch(`/auth/register`, { // Use relative path
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
                 const newAccessToken = data.accessToken;
                 setAccessToken(newAccessToken); // Store access token in state (memory)
                 // Decode token to get expiration time
                 try {
                     const decodedToken: { exp: number } = jwtDecode(newAccessToken);
                     setAccessTokenExpiresAt(decodedToken.exp); // Store expiration timestamp (seconds)
                     console.log(`[${new Date().toISOString()}] handleRegister: New access token expires at: ${new Date(decodedToken.exp * 1000).toISOString()}`);
                 } catch (decodeError) {
                     console.error("Error decoding access token:", decodeError);
                     setAccessTokenExpiresAt(null); // Clear expiration if decode fails
                 }
                 setIsAuthenticated(true); // Set authenticated state immediately on successful registration
                 setUser(data.user); // Set user data immediately
                 // Refresh token handled by HttpOnly cookie
                 // The initial useEffect will still run refreshToken for verification/refresh if needed
             } else {
                 const errorData = await response.json();
                 // Clear state on failed registration
                 setAccessToken(null);
                 setAccessTokenExpiresAt(null); // Clear expiration on failed registration
                 setIsAuthenticated(false);
                 setUser(null);
                 throw new Error(errorData.error || 'Registration failed');
             }
        } catch (error) {
            console.error('Error during registration:', error);
            // Ensure state is cleared on error
            setAccessToken(null);
            setAccessTokenExpiresAt(null); // Clear expiration on error
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
            const response = await fetch(`/auth/logout`, { // Use relative path
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
            setAccessTokenExpiresAt(null); // Clear expiration on logout
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
    // Returns the new access token string on success, or null on failure.
    const refreshToken = useCallback(async (): Promise<string | null> => {
        // *** Removed isRefreshing check and set/reset logic from here ***
        // It's now handled by the useEffect hook that calls attemptInitialRefresh.
        console.log(`[${new Date().toISOString()}] refreshToken: Entered.`);

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
                const newAccessToken = data.accessToken;
                setAccessToken(newAccessToken); // Store the new access token in state
                // Decode new token to get expiration time
                try {
                    const decodedToken: { exp: number } = jwtDecode(newAccessToken);
                    setAccessTokenExpiresAt(decodedToken.exp); // Store expiration timestamp (seconds)
                    console.log(`[${new Date().toISOString()}] refreshToken: Refreshed access token expires at: ${new Date(decodedToken.exp * 1000).toISOString()}`);
                } catch (decodeError) {
                    console.error("Error decoding refreshed access token:", decodeError);
                    setAccessTokenExpiresAt(null); // Clear expiration if decode fails
                }
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
                return data.accessToken; // Return the new access token
            } else {
                // Log based on status code
                if (response.status === 401 || response.status === 403) { // Check for 403 as well
                    console.log(`[${new Date().toISOString()}] refreshToken: Failed with status 401 (Likely no active session).`);
                } else {
                    console.error(`[${new Date().toISOString()}] refreshToken: Failed, status:`, response.status);
                }
                // If refresh fails (e.g., 401, 403 means invalid/expired refresh token), logout
                 console.log(`[${new Date().toISOString()}] refreshToken: Refresh failed, calling handleLogout...`);
                 await handleLogout(); // Use await as handleLogout is async
                // Setting isCheckingAuth(false) is handled by the caller (useEffect)
                return null; // Indicate failure by returning null
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] refreshToken: Network or other error:`, error);
             console.log(`[${new Date().toISOString()}] refreshToken: Error caught, calling handleLogout...`);
             await handleLogout(); // Logout on network or other errors
            return null; // Indicate failure by returning null
        } finally {
            // *** Removed isRefreshing reset from here ***
            console.log(`[${new Date().toISOString()}] refreshToken: FINALLY block reached.`);
       }
   }, [handleLogout]); // Add handleLogout as dependency

    // Effect to check authentication status ONCE on initial load
    useEffect(() => {
        console.log(`[${new Date().toISOString()}] useAuth: useEffect triggered. Checking didRunInitialCheck: ${didRunInitialCheck.current}`);

        // --- Prevent execution on subsequent runs (e.g., StrictMode re-mount) ---
        if (didRunInitialCheck.current) {
            console.log(`[${new Date().toISOString()}] useAuth: Skipping useEffect run (didRunInitialCheck is true).`);
            // Ensure loading state is false if we skip and it wasn't set previously
            // It should be false already from the first run's finally block, but as a safeguard:
            // setIsCheckingAuth(false); // Let the first run handle this in its finally block
            return;
        }
        // --- Mark that the initial check will now run ---
        didRunInitialCheck.current = true;
        console.log(`[${new Date().toISOString()}] useAuth: First useEffect run, setting didRunInitialCheck = true.`);

        // Define the async function to attempt token refresh
        const attemptInitialRefresh = async () => {
            console.log(`[${new Date().toISOString()}] useAuth: Attempting initial refreshToken...`);
            // isRefreshing flag is NOT used for this initial load check anymore

            try {
                await refreshToken(); // Call the refresh token logic
            } catch (e) {
                // Errors during initial refresh are handled within refreshToken (calls handleLogout)
                console.error(`[${new Date().toISOString()}] useAuth: Error during initial refreshToken attempt (caught in useEffect):`, e);
            } finally {
                // This block runs regardless of success or failure of refreshToken,
                // or if it was aborted by the isRefreshing check inside refreshToken.
                console.log(`[${new Date().toISOString()}] useAuth: Initial refresh attempt finished (useEffect finally block). Setting isCheckingAuth = false.`);
                // Crucially, set checking to false *after* the attempt is fully completed or aborted.
                setIsCheckingAuth(false);
                // *** DO NOT reset isRefreshing here (it wasn't set here) ***
                console.log(`[${new Date().toISOString()}] useAuth: Initial refresh attempt finished (useEffect finally block).`);
            }
        };

        // Execute the attempt directly. StrictMode will call this twice.
        // The isRefreshing flag inside refreshToken should prevent the second network call.
        attemptInitialRefresh();

        // No cleanup needed for this approach
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshToken]); // Add refreshToken dependency as it's used inside

    // Wrapper function for making authenticated API calls with automatic token refresh
    const callApiWithAuth = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
        let currentToken = accessToken; // Use state directly
        let currentExpiresAt = accessTokenExpiresAt; // Use state directly

        // --- Proactive Refresh Check ---
        const nowInSeconds = Date.now() / 1000;
        // Check if expiration exists and is in the past or very near future (e.g., 10 seconds buffer)
        if (currentExpiresAt && nowInSeconds >= (currentExpiresAt - 10)) {
            console.log(`[${new Date().toISOString()}] callApiWithAuth: Access token expired or expiring soon (exp: ${currentExpiresAt}, now: ${nowInSeconds}). Attempting proactive refresh.`);

            if (isRefreshing.current) {
                console.warn(`[${new Date().toISOString()}] callApiWithAuth: Aborting proactive refresh attempt as another is already in progress.`);
                // If already refreshing, we might need to wait or handle differently,
                // but for now, let's proceed and let the 401 handling catch it if needed.
                // Alternatively, could implement a waiting mechanism here.
            } else {
                 isRefreshing.current = true;
                 console.log(`[${new Date().toISOString()}] callApiWithAuth: >>> Calling refreshToken proactively... (isRefreshing = true)`);
                 const proactivelyRefreshedToken = await refreshToken();
                 isRefreshing.current = false;
                 console.log(`[${new Date().toISOString()}] callApiWithAuth: <<< Proactive refreshToken finished. New token received: ${!!proactivelyRefreshedToken}. (isRefreshing = false)`);

                 if (proactivelyRefreshedToken) {
                     currentToken = proactivelyRefreshedToken; // Update token for the upcoming call
                     // Re-read expiration from state as refreshToken updates it
                     currentExpiresAt = accessTokenExpiresAt;
                 } else {
                     console.error(`[${new Date().toISOString()}] callApiWithAuth: Proactive token refresh failed. Logout should have occurred.`);
                     // If proactive refresh fails, logout is handled by refreshToken.
                     // We should probably not proceed with the API call.
                     // Return a synthetic error response or throw.
                     return new Response(JSON.stringify({ error: 'Session refresh failed' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
                 }
            }
        }
        // --- End Proactive Refresh Check ---


        // Prepare headers
        const headers = new Headers(options.headers);
        if (currentToken) {
            headers.set('Authorization', `Bearer ${currentToken}`);
        }
        // Ensure credentials are included for refresh token cookie
        options.credentials = 'include';

        console.log(`[${new Date().toISOString()}] callApiWithAuth: >>> Initial fetch attempt to ${url} with token: ${currentToken ? currentToken.substring(0, 10) + '...' : 'null'}`);
        // Initial API call
        let response = await fetch(url, { ...options, headers });
        console.log(`[${new Date().toISOString()}] callApiWithAuth: <<< Initial fetch response status for ${url}: ${response.status}`);

        // Check if token expired (401/403)
        if (response.status === 401 || response.status === 403) {
            console.log(`[${new Date().toISOString()}] callApiWithAuth: Received ${response.status} for ${url}. Attempting token refresh.`);

            // Use a separate ref to prevent multiple concurrent *refresh* attempts triggered by *different* failed API calls
            if (isRefreshing.current) {
                 console.warn(`[${new Date().toISOString()}] callApiWithAuth: Aborting refresh attempt as another is already in progress.`);
                 // Return the original error response if refresh is already happening elsewhere
                 return response;
            }

            isRefreshing.current = true; // Mark refresh as started
            console.log(`[${new Date().toISOString()}] callApiWithAuth: >>> Calling refreshToken due to ${response.status}... (isRefreshing = true)`);
            const newToken = await refreshToken(); // Attempt to refresh
            isRefreshing.current = false; // Mark refresh as finished
            console.log(`[${new Date().toISOString()}] callApiWithAuth: <<< refreshToken finished. New token received: ${!!newToken}. (isRefreshing = false)`);


            if (newToken) {
                console.log(`[${new Date().toISOString()}] callApiWithAuth: Token refreshed successfully. Retrying original request to ${url}.`);
                // Update headers with the new token
                headers.set('Authorization', `Bearer ${newToken}`);
                console.log(`[${new Date().toISOString()}] callApiWithAuth: >>> Retrying fetch to ${url} with new token: ${newToken.substring(0, 10)}...`);
                // Retry the original request
                response = await fetch(url, { ...options, headers });
                console.log(`[${new Date().toISOString()}] callApiWithAuth: <<< Retry fetch response status for ${url}: ${response.status}`);
            } else {
                console.error(`[${new Date().toISOString()}] callApiWithAuth: Token refresh failed. Logout should have been triggered by refreshToken.`);
                // Logout is handled within refreshToken failure, just return the original error response
                // Or potentially throw a new error to signal catastrophic failure
                // throw new Error('Session expired or invalid.');
                return response; // Return original 401/403 response
            }
        }

        // Return the final response (either from initial call or retry)
        return response;

    }, [accessToken, refreshToken, accessTokenExpiresAt]); // Dependencies: Added accessTokenExpiresAt for proactive check

    // The logic previously in this effect is now handled by:
    // 1. refreshToken success: Sets isAuthenticated and user.
    // 2. refreshToken failure: Calls handleLogout, which clears state.
    // 3. handleLogout: Clears state.

    // Return the authentication state and functions
    return {
        isAuthenticated,
        isCheckingAuth,
        user,
        accessToken, // Expose accessToken (though direct use discouraged)
        // accessTokenExpiresAt, // Probably don't need to expose this
        handleLogin,
        handleRegister,
        handleLogout,
        refreshToken, // Expose core refresh function
        callApiWithAuth // Expose the wrapped fetch function
    };
};

// Function type for token validation (might not be needed anymore)
export type TokenValidator = () => Promise<string | null>;

export default useAuth;
