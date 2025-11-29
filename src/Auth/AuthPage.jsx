import React, { useState } from 'react';
// 💡 FIX: Import GoogleOAuthProvider
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import * as api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext.jsx'; // 👈 Import useAuth

import '../Home/App.css';
import '../Home/index.css';

// Get the Client ID from environment variables
// IMPORTANT: You must create a .env.local file in your frontend root 
// and set VITE_GOOGLE_CLIENT_ID="YOUR_COPIED_CLIENT_ID"
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Component containing the actual authentication logic and UI
const AuthPageContent = () => {
    const { login } = useAuth(); // 👈 Get login function from context
    // State to toggle between Login and Sign Up
    const [isLoginMode, setIsLoginMode] = useState(true);

    // State for form inputs
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    // State for error/success messages
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); // Hook for redirection

    // Helper function to handle successful auth (used by both methods)
    const handleSuccessfulAuth = (result) => {
        setMessage(`Login successful! Welcome, ${result.user.name || 'User'}.`);
        // 1. Typically, you'd save the token/user here:
        login(result.token, result.user); // 👈 Call login function

        // 2. Redirect to the home or account dashboard
        setTimeout(() => {
            navigate('/'); // Redirect to home after a delay
        }, 1000);
    };

    // --- Google Login Handlers ---
    const handleGoogleSuccess = async (credentialResponse) => {
        setMessage('Verifying with Google...');
        try {
            // Send the Google token to your backend for verification
            const result = await api.verifyGoogleToken(credentialResponse.credential);

            if (result.success) {
                handleSuccessfulAuth(result);
            } else {
                setMessage(result.message || 'Google login failed.');
            }
        } catch {
            setMessage('An error occurred during Google login. Check server connection.');
        }
    };

    const handleGoogleError = () => {
        setMessage('Google login failed. Please try again.');
    };

    // --- Email/Password Form Handlers ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage('Logging in...');
        try {
            const result = await api.loginWithEmail(loginEmail, loginPassword);
            if (result.success) {
                handleSuccessfulAuth(result);
            } else {
                setMessage(result.message || 'Invalid email or password.');
            }
        } catch {
            setMessage('Login failed. Server is unreachable.');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (signupPassword.length < 6) {
            setMessage('Password must be at least 6 characters.');
            return;
        }
        setMessage('Creating account...');
        try {
            const result = await api.signupWithEmail(signupName, signupEmail, signupPassword);
            if (result.success) {
                handleSuccessfulAuth(result);
            } else {
                // Ensure to clear the message if the user created the account but the result is false
                setMessage(result.message || 'Signup failed. Email may already be in use.');
            }
        } catch {
            setMessage('Signup failed. Server is unreachable.');
        }
    };

    // Determine the text for the Google button based on the current mode
    const googleButtonText = isLoginMode ? "continue_with" : "signup_with";

    return (
        <div className="auth-container animated-element slide-in-up">
            <h1>Welcome to Yetta's Pastries 🍰</h1>

            {/* --- Google Login Button (Text is now conditional) --- */}
            <div className="google-login-container">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap // Optional: Shows the one-tap prompt
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    // 👈 FIX: Use conditional text
                    text={googleButtonText}
                    logo_alignment="left"
                />
            </div>

            <hr className="divider" />

            {/* Optional: Add text above the divider to separate methods */}
            <p className="auth-separator">OR</p>

            {/* --- Conditional Forms --- */}
            {isLoginMode ? (
                /* --- Login Form --- */
                <form id="login-form" className="auth-form" onSubmit={handleLoginSubmit}>
                    <h2>Login with Email</h2>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Log In</button>

                    {/* Forgot Password Link */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ fontSize: '0.9rem', color: '#8B4513' }}>Forgot Password?</a>
                    </div>

                    <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(false); setMessage(''); }}>Sign Up here.</a></p>
                </form>
            ) : (
                /* --- Sign Up Form --- */
                <form id="signup-form" className="auth-form" onSubmit={handleSignupSubmit}>
                    <h2>Create an Account</h2>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Sign Up</button>
                    <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(true); setMessage(''); }}>Log In here.</a></p>
                </form>
            )}

            {/* Message area for errors or success */}
            {message && <p id="message-area" className="auth-message">{message}</p>}
        </div>
    );
};


// 💡 NEW Wrapper Component: This handles the Google configuration
const AuthPage = () => {
    // Check if the client ID is available. If not, show an error.
    if (!GOOGLE_CLIENT_ID) {
        return (
            <div className="auth-container p-8 text-center bg-red-100 border border-red-400 text-red-700">
                <h1>Configuration Error</h1>
                <p>Google Client ID is missing. Please ensure VITE_GOOGLE_CLIENT_ID is set in your frontend .env file.</p>
            </div>
        );
    }

    // Use the GoogleOAuthProvider to wrap the content
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthPageContent />
        </GoogleOAuthProvider>
    );
}

export default AuthPage;