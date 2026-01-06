// src/Cookies/CookiesPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css'; // Shared component styles
import '../Home/index.css'; // Global styles and variables


const CookiesPage = () => {
    const { addToCart } = useCart();
    const [animatingItemId, setAnimatingItemId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/menu');
            if (response.ok) {
                const data = await response.json();
                setMenuItems(data.filter(item => item.category === 'cookies'));
            } else {
                console.error("Failed to fetch menu items");
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (cookieItem) => {
        addToCart(cookieItem);
        setAnimatingItemId(cookieItem._id || cookieItem.id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section hero-cookies">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Freshly Baked Cookies 🍪</h1>
                    <p className="hero-subtitle">A selection of freshly baked, comforting classics.</p>
                </div>
            </section>

            <div className="content-container">
                <section className="cake-container">
                    {loading ? (
                        <p>Loading fresh cookies...</p>
                    ) : menuItems.length === 0 ? (
                        <p>No cookies available at the moment.</p>
                    ) : (
                        menuItems.map((cookie, index) => (
                            <div
                                key={cookie._id || cookie.id}
                                className={`cake-card ${cookie.id} animated-element slide-in-up`}
                                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                            >
                                {animatingItemId === (cookie._id || cookie.id) && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}

                                <img src={cookie.image_src || cookie.imageSrc} alt={cookie.title || cookie.imageAlt} className="drink-img" />
                                <h2>{cookie.title}</h2>

                                {cookie.price ? (
                                    <>
                                        <p className="price">Ksh. {cookie.price.toFixed(2)}</p>
                                        <p className="description">{cookie.description}</p>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(cookie)}
                                        >
                                            Add to Cart
                                        </button>
                                    </>
                                ) : (
                                    <p className="price">Price available in-store.</p>
                                )}
                            </div>
                        )))}
                </section>

                <div className="cake-verification animated-element fade-in" style={{ animationDelay: '1s' }}>
                    <h2>PERFECTO 👌</h2>
                    <h2>Flavor in every crunch 😋</h2>
                </div>
            </div>
        </>
    );
};

export default CookiesPage;