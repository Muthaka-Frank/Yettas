// src/Drinks/DrinksPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css'; // Shared component styles
import '../Home/index.css'; // Global styles and variables
import './drinks.css'

const DrinksPage = () => {
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
                setMenuItems(data.filter(item => item.category === 'drinks'));
            } else {
                console.error("Failed to fetch menu items");
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleAddToCart = (drinkItem) => {
        addToCart(drinkItem);
        setAnimatingItemId(drinkItem._id || drinkItem.id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section hero-drinks">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Refreshing Drinks 🍹</h1>
                    <p className="hero-subtitle">Quench your thirst with our selection of fresh juices and smoothies.</p>
                </div>
            </section>

            <div className="content-container">
                <section className="cake-container">
                    {loading ? (
                        <p>Loading refreshing drinks...</p>
                    ) : menuItems.length === 0 ? (
                        <p>No drinks available at the moment.</p>
                    ) : (
                        menuItems.map((drink, index) => (
                            <div
                                key={drink._id || drink.id}
                                className={`cake-card ${drink.id} animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s` }}
                            >
                                {animatingItemId === (drink._id || drink.id) && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}

                                <img src={drink.image_src || drink.imageSrc} alt={drink.title || drink.imageAlt} width="200" height="auto" />
                                <h2>{drink.title}</h2>
                                <p className="description">{drink.description}</p>

                                {drink.price ? (
                                    <>
                                        <p className="price">Ksh. {drink.price.toFixed(2)}</p>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(drink)}
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
                    <h2>Stay Hydrated! 💦</h2>
                </div>
            </div>
        </>
    );
};

export default DrinksPage;