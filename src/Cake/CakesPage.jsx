// src/Cake/CakesPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css';
import '../Home/index.css';
import './cake.css';

const CakesPage = () => {
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
                // Filter for cakes
                const cakes = data.filter(item => item.category === 'cakes');
                setMenuItems(cakes);
            } else {
                console.error("Failed to fetch menu items");
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (cakeItem) => {
        addToCart(cakeItem);
        setAnimatingItemId(cakeItem._id || cakeItem.id);
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
                    {loading ? (
                        <p>Loading tasty cakes...</p>
                    ) : menuItems.length === 0 ? (
                        <p>No cakes available at the moment. Check back soon!</p>
                    ) : (
                        menuItems.map((cake, index) => (
                            <div
                                key={cake._id || cake.id}
                                className={`cake-card ${cake.id} animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s` }}
                            >
                                {animatingItemId === (cake._id || cake.id) && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}

                                <img src={cake.image_src || cake.imageSrc} alt={cake.title} width="200" height="auto" />
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
                        ))
                    )}
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