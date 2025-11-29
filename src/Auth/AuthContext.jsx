import { createContext, useContext } from 'react';
import React from 'react';

// Define the shape of the context state
const AuthContext = createContext({
    user: null, // Stores { id, name, email }
    token: null, // Stores the JWT
    isLoggedIn: false,
    login: () => { },
    logout: () => { },
    loading: true, // Indicates if the initial token check is complete
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// 💡 NOTE: The AuthProvider logic will be placed in the separate file, AuthProvider.jsx,
// to maintain separation of concerns and keep this file focused on the Context definition.

export default AuthContext;