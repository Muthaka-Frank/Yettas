// src/Favorites/FavoritesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchFavorites as apiFetchFavorites, removeFavorite as apiRemoveFavorite } from '../services/api';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css';
import '../Home/index.css';
import '../Cake/cake.css'; // Reuse cake styles for cards

const FavoritesPage = () => {
    const { isLoggedIn, token } = useAuth();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavorites = useCallback(async () => {
        const result = await apiFetchFavorites(token);
        if (result.success) {
            setFavorites(result.data);
        } else {
            setError(result.message);
        }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, token, fetchFavorites]);

    const removeFavorite = async (itemId) => {
        const result = await apiRemoveFavorite(token, itemId);
        if (result.success) {
            // Remove from local state
            setFavorites(prev => prev.filter(item => item.item_id !== itemId));
        } else {
            alert(result.message);
        }
    };

    if (!isLoggedIn) {
        return (
            <>
                <section className="hero-section hero-generic">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">Your Favorites ❤️</h1>
                        <p className="hero-subtitle">Please log in to view your favorite items.</p>
                    </div>
                </section>
                <div className="content-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your favorites.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <section className="hero-section hero-generic">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Your Favorites ❤️</h1>
                    <p className="hero-subtitle">A collection of your most loved treats.</p>
                </div>
            </section>

            <div className="content-container">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading favorites...</p>
                ) : error ? (
                    <p style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</p>
                ) : favorites.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '50px' }}>You haven't added any favorites yet.</p>
                ) : (
                    <section className="cake-container">
                        {favorites.map((fav, index) => (
                            <div
                                key={fav.item_id}
                                className={`cake-card animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s`, position: 'relative' }}
                            >
                                <button
                                    onClick={() => removeFavorite(fav.item_id)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: 'red'
                                    }}
                                    title="Remove from favorites"
                                >
                                    &times;
                                </button>

                                <img src={fav.item_image} alt={fav.item_title} width="200" height="auto" onError={(e) => { e.target.src = '/Frontend/images/logo 2.png' }} />
                                <h2>{fav.item_title}</h2>
                                <p className="price">Ksh. {fav.item_price.toFixed(2)}</p>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => addToCart({
                                        id: fav.item_id,
                                        title: fav.item_title,
                                        price: fav.item_price,
                                        imageSrc: fav.item_image
                                    })}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </>
    );
};

export default FavoritesPage;
