// src/Cake/CakesPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css';
import '../Home/index.css';
import './cake.css';
import { cakeMenuData } from '../data/allMenuData.js';

const CakesPage = () => {
    const { addToCart } = useCart();
    const [animatingItemId, setAnimatingItemId] = useState(null);

    const handleAddToCart = (cakeItem) => {
        addToCart(cakeItem);
        setAnimatingItemId(cakeItem.id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section hero-cakes">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Our Signature Cake Flavors 🎂</h1>
                    <p className="hero-subtitle">Indulge in our rich and decadent cakes, baked to perfection.</p>
                </div>
            </section>

            <div className="content-container">
                <section className="cake-container">
                    {cakeMenuData.map((cake, index) => (
                        <div
                            key={cake.id}
                            className={`cake-card ${cake.id} animated-element slide-in-up`}
                            style={{ animationDelay: `${0.1 * index}s` }}
                        >
                            {animatingItemId === cake.id && (
                                <div className="add-to-cart-animation">Added!</div>
                            )}

                            <img src={cake.imageSrc} alt={cake.imageAlt} width="200" height="auto" />
                            <h2>{cake.title}</h2>
                            <p className="description">{cake.description}</p>

                            {cake.price ? (
                                <>
                                    <p className="price">Ksh. {cake.price.toFixed(2)}</p>
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(cake)}
                                    >
                                        Add to Cart
                                    </button>
                                </>
                            ) : (
                                <p className="price">Price available in-store.</p>
                            )}
                        </div>
                    ))}
                </section>

                <div className="cake-verification animated-element fade-in" style={{ animationDelay: '1s' }}>
                    <h2>VERIFIED ✅</h2>
                    <h2>You are a sweet tooth 😌</h2>
                </div>
            </div>
        </>
    );
};

export default CakesPage;