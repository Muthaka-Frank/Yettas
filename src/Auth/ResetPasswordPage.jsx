import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/api.js';
import '../Home/App.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match.");
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setMessage('Resetting password...');

        const result = await api.resetPassword(token, newPassword);

        if (result.success) {
            setIsSuccess(true);
            setMessage(result.message);
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } else {
            setIsSuccess(false);
            setMessage(result.message);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <h1>Invalid Link ⚠️</h1>
                <p>Missing reset token. Please try requesting a new link.</p>
                <button onClick={() => navigate('/forgot-password')} style={{ marginTop: '20px' }}>
                    Go to Forgot Password
                </button>
            </div>
        );
    }

    return (
        <div className="auth-container animated-element slide-in-up">
            <h1>Set New Password 🔑</h1>

            {!isSuccess ? (
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
                    <p>Redirecting to login...</p>
                </div>
            )}

            {message && !isSuccess && <p className="auth-message">{message}</p>}
        </div>
    );
};

export default ResetPasswordPage;
