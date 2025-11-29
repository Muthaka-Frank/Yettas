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

/**
 * Fetches the user's order history.
 */
export const fetchOrders = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL.replace('/auth', '/orders')}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to fetch orders.' };
    }
};

/**
 * Fetches the user's favorites.
 */
export const fetchFavorites = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL.replace('/auth', '/favorites')}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to fetch favorites.' };
    }
};

/**
 * Adds an item to favorites.
 */
export const addFavorite = async (token, itemId) => {
    try {
        await axios.post(`${API_BASE_URL.replace('/auth', '/favorites')}`, { item_id: itemId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to add favorite.' };
    }
};

/**
 * Removes an item from favorites.
 */
export const removeFavorite = async (token, itemId) => {
    try {
        await axios.delete(`${API_BASE_URL.replace('/auth', '/favorites')}/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to remove favorite.' };
    }
};

/**
 * Processes the checkout.
 */
export const checkout = async (token, checkoutData) => {
    try {
        const response = await axios.post(`${API_BASE_URL.replace('/auth', '/cart')}/checkout`, checkoutData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, ...response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Checkout failed.' };
    }
};