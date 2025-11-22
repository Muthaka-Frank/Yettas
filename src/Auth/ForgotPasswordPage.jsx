import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import '../Home/App.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sending request...');

        const result = await api.forgotPassword(email);

        if (result.success) {
            setIsSuccess(true);
            setMessage(result.message);
        } else {
            setIsSuccess(false);
            setMessage(result.message);
        }
    };

    return (
        <div className="auth-container animated-element slide-in-up">
            <h1>Reset Password 🔒</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {!isSuccess ? (
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send Reset Link</button>
                </form>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                        (Check the backend console for the link since we don't have real email sending)
                    </p>
                </div>
            )}

            {message && !isSuccess && <p className="auth-message">{message}</p>}

            <div style={{ marginTop: '20px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth'); }} style={{ color: '#8B4513', fontWeight: 'bold' }}>
                    Back to Login
                </a>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
