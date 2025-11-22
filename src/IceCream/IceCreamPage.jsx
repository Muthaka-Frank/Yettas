// src/IceCream/IceCreamPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css'; // Shared component styles
import '../Home/index.css'; // Global styles and variables
import './icecream.css'
import { iceCreamMenuData } from '../data/allMenuData.js';

const IceCreamPage = () => {
    const { addToCart } = useCart();
    const [animatingItemId, setAnimatingItemId] = useState(null);

    const handleAddToCart = (iceCreamItem) => {
        addToCart(iceCreamItem);
        setAnimatingItemId(iceCreamItem.id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section hero-icecream">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Decadent Ice Cream Flavors 🍦</h1>
                    <p className="hero-subtitle">Cool down with our rich and creamy handcrafted ice creams.</p>
                </div>
            </section>

            <div className="content-container">
                <section className="icecream-container">
                    {iceCreamMenuData.map((iceCream, index) => (
                        <div
                            key={iceCream.id}
                            className={`icecream-card ${iceCream.id} animated-element slide-in-up`}
                            style={{ animationDelay: `${0.1 * index}s` }}
                        >
                            {animatingItemId === iceCream.id && (
                                <div className="add-to-cart-animation">Added!</div>
                            )}

                            <img src={iceCream.imageSrc} alt={iceCream.imageAlt} width="200" height="auto" />
                            <h2>{iceCream.title}</h2>
                            <p className="description">{iceCream.description}</p>

                            {iceCream.price ? (
                                <>
                                    <p className="price">Ksh. {iceCream.price.toFixed(2)}</p>
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(iceCream)}
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

                <div className="icecream-verification animated-element fade-in" style={{ animationDelay: '1s' }}>
                    <h2>DELIGHT 😍</h2>
                    <h2>Dessert full of delight 😌</h2>
                </div>
            </div>
        </>
    );
};

export default IceCreamPage;