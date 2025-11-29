import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { decodeJwt } from '../utils/jwtUtils'; // We will create this utility next

const AUTH_TOKEN_KEY = 'yetta_auth_token';
const USER_KEY = 'yetta_user';

export const AuthProvider = ({ children }) => {
    // Check local storage for initial state
    const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const initialUser = JSON.parse(localStorage.getItem(USER_KEY));

    const [user, setUser] = useState(initialUser);
    const [token, setToken] = useState(initialToken);
    const [loading, setLoading] = useState(true);

    // Function to handle login (save token and user data)
    const login = (newToken, userData) => {
        // Save to state
        setToken(newToken);
        setUser(userData);

        // Save to persistent storage
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        setLoading(false);
    };

    // Function to handle logout
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
    };

    // Effect to handle initial load/token validation (simple check)
    useEffect(() => {
        // If a token exists, we check if it's expired (optional but recommended)
        if (initialToken) {
            const decoded = decodeJwt(initialToken);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                // Token is valid and user data should already be present.
                // Re-validate that the user object is also present.
                if (!initialUser) {
                    // This could happen if user storage was cleared but token wasn't.
                    // For now, we assume if token is there, the user is 'logged in'.
                    // console.log("Token found but user data missing. Proceeding with stored token.");
                }
            } else {
                // Token is expired or invalid, force logout
                // console.log("Token expired or invalid. Logging out.");
                logout();
            }
        }
        setLoading(false);
    }, [initialToken, initialUser]);


    const contextValue = {
        user,
        token,
        isLoggedIn: !!user, // Simple check: user object exists
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};