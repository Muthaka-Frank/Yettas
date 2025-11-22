import React from 'react';
import { Link } from 'react-router-dom';
import '../Home/App.css';
import '../Home/index.css';

const Footer = () => {
    return (
        <footer className="footer-container slide-in-up animated-element" style={{ animationDelay: '1.5s' }}>
            <div className="footer-message">
                "Life is what you bake it! 🎂 Serving you deliciousness, one slice at a time."
            </div>

            <div className="footer-grid">
                <div className="footer-links">
                    <h3>Explore</h3>
                    <a href="#about">About us</a>
                    <a href="#faq">FAQ</a>
                    <a href="#blog">Blog</a>
                    <a href="#contact">Contact us</a>
                    <a href="#security">Security</a>
                    <Link to="/login" className="footer-login">Log in</Link>
                </div>

                <div className="footer-links">
                    <h3>Legal</h3>
                    <a href="#cookies-config">Configure cookies</a>
                    <a href="#terms">Terms & Conditions</a>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#cookies-policy">Cookies Policy</a>
                    <a href="#compliance">Compliance</a>
                </div>

                <div className="footer-links socials">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">📸 Instagram</a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">🐦 Twitter</a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">📘 Facebook</a>
                    </div>
                </div>
            </div>

            <div className="footer-copyright">
                &copy; 2025 Yetta's Bakery. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;