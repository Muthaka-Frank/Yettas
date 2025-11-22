// src/services/api.js
import axios from 'axios';

// 🛑 IMPORTANT: This MUST match the address and port where your Rust/Actix server runs.
const API_BASE_URL = 'http://localhost:8080/api/auth';

/**
 * Handles communication with the Rust backend for email/password login.
 */
export const loginWithEmail = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

        // Expected successful Rust response: { token: '...', user: {...} }
        return { success: true, ...response.data };
    } catch (error) {
        // Rust server should return 401 (Unauthorized) or 400 (Bad Request)
        const errorMessage = error.response?.data?.message || 'Login failed. Server is unreachable or responded incorrectly.';
        return { success: false, message: errorMessage };
    }
};

/**
 * Handles communication with the Rust backend for email/password signup.
 */
export const signupWithEmail = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, { name, email, password });

        // Expected successful Rust response: { token: '...', user: {...} }
        return { success: true, ...response.data };
    } catch (error) {
        // Rust server should return 409 (Conflict) for existing user or 400
        const errorMessage = error.response?.data?.message || 'Signup failed. Server is unreachable or responded incorrectly.';
        return { success: false, message: errorMessage };
    }
};

/**
 * Handles Google credential verification via the Rust backend.
 */
export const verifyGoogleToken = async (credential) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/google`, { credential });

        // Expected successful Rust response: { token: '...', user: {...} }
        return { success: true, ...response.data };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Google authentication failed. Server error.';
        return { success: false, message: errorMessage };
    }
};

// You do not need to change the AuthPage.jsx component; it uses these exported functions.

/**
 * Sends a password reset link to the user's email.
 */
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
        return { success: true, ...response.data };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Request failed. Server error.';
        return { success: false, message: errorMessage };
    }
};

/**
 * Resets the user's password using the provided token.
 */
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/reset-password`, { token, new_password: newPassword });
        return { success: true, ...response.data };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Reset failed. Server error.';
        return { success: false, message: errorMessage };
    }
};