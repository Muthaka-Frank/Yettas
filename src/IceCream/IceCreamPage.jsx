// src/IceCream/IceCreamPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../Home/App.css'; // Shared component styles
import '../Home/index.css'; // Global styles and variables
import './icecream.css'

const IceCreamPage = () => {
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
                setMenuItems(data.filter(item => item.category === 'icecream'));
            } else {
                console.error("Failed to fetch menu items");
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (iceCreamItem) => {
        addToCart(iceCreamItem);
        setAnimatingItemId(iceCreamItem._id || iceCreamItem.id);
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
                    {loading ? (
                        <p>Loading cool treats...</p>
                    ) : menuItems.length === 0 ? (
                        <p>No ice cream available at the moment.</p>
                    ) : (
                        menuItems.map((iceCream, index) => (
                            <div
                                key={iceCream._id || iceCream.id}
                                className={`icecream-card ${iceCream.id} animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s` }}
                            >
                                {animatingItemId === (iceCream._id || iceCream.id) && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}

                                <img src={iceCream.image_src || iceCream.imageSrc} alt={iceCream.title} width="200" height="auto" />
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
                        )))}
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