import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';
import '../Home/App.css';
import '../Home/index.css';

// --- NEW COMPONENT: User Profile Dropdown ---
const UserProfileDropdown = ({ userName, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="profile-dropdown-container">
            {/* The profile button that triggers the dropdown */}
            <button className="nav-login-btn profile-button" onClick={toggleDropdown}>
                <span role="img" aria-label="user profile" style={{ marginRight: '5px' }}>👤</span>
                {/* Use the user's name or default (first word only) */}
                {userName ? userName.split(' ')[0] : 'User'}
            </button>

            {/* Dropdown Menu - only visible when isOpen is true */}
            {isOpen && (
                <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>Profile Settings</Link>
                    <Link to="/orders" onClick={() => setIsOpen(false)}>Order History</Link>
                    <Link to="/favorites" onClick={() => setIsOpen(false)}>Favorites</Link>
                    <div className="dropdown-divider"></div>
                    {/* Log out button calls the global logout function */}
                    <button onClick={handleLogout} className="logout-button">Log Out</button>
                </div>
            )}
        </div>
    );
};
// --- END NEW COMPONENT ---


const Header = () => {
    const { itemCount } = useCart();
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    // Handler for logging out
    const handleLogout = () => {
        // 1. Call the global context logout function
        logout();

        // 2. Redirect the user to the home page or login page after logging out
        navigate('/');
    };

    return (
        <header>
            <div className="header-container">

                <div className="logo">
                    <Link to="/">
                        <img src="/Frontend/images/logo 2.png" alt="Yetta's Bakery Logo" width="150" height="auto" />
                    </Link>
                </div>

                <div className="dropdown">
                    <button>Menu</button>
                    <div className="dropdown-content">
                        <Link to="/cakes">Cakes</Link>
                        <Link to="/icecream">Ice Cream</Link>
                        <Link to="/cookies">Cookies</Link>
                        <Link to="/drinks">Drinks</Link>
                        <Link to="/specials">Customs / Specials</Link>
                    </div>
                </div>

                {/* Removed Home Link Navigation as requested */}

                <div className="search-container">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const query = e.target.search.value;
                        if (query.trim()) {
                            navigate(`/search?q=${encodeURIComponent(query)}`);
                        }
                    }}>
                        <input type="text" name="search" placeholder="Search..." />
                        <button type="submit">🔎</button>
                    </form>
                </div>

                <div className="cart-button-container">
                    <Link to="/checkout" className="nav-cart-btn">
                        🛒 Cart
                        {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                    </Link>
                </div>

                {/* 1. CONDITIONAL RENDERING: Login Button vs. Profile Dropdown */}
                <div className="login">
                    {isLoggedIn ? (
                        <UserProfileDropdown
                            // Use the name from the authenticated user object
                            userName={user ? user.name : 'Customer'}
                            handleLogout={handleLogout}
                        />
                    ) : (
                        <Link to="/login" className="nav-login-btn">Customer Login</Link>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;