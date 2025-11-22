// src/Profile/ProfilePage.jsx
import React from 'react';
import { useAuth } from '../Auth/AuthContext.jsx';
import '../Home/App.css';
import '../Home/index.css';

const ProfilePage = () => {
    const { user, isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <>
                <section className="hero-section hero-generic">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">My Profile 👤</h1>
                        <p className="hero-subtitle">Please log in to view your profile.</p>
                    </div>
                </section>
                <div className="content-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your profile.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <section className="hero-section hero-generic">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">My Profile 👤</h1>
                    <p className="hero-subtitle">Manage your account settings and preferences.</p>
                </div>
            </section>

            <div className="content-container">
                <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#d2691e', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Account Details</h2>

                    <div className="profile-details">
                        <div className="detail-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#555' }}>Name</label>
                            <p style={{ fontSize: '1.1rem', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>{user?.name || 'N/A'}</p>
                        </div>

                        <div className="detail-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#555' }}>Email</label>
                            <p style={{ fontSize: '1.1rem', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>{user?.email || 'N/A'}</p>
                        </div>

                        <div className="detail-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#555' }}>Member Since</label>
                            <p style={{ fontSize: '1.1rem', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>January 2024</p>
                        </div>
                    </div>

                    <button className="edit-profile-btn" style={{ marginTop: '10px', padding: '12px 25px', backgroundColor: '#d2691e', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        Edit Profile
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
