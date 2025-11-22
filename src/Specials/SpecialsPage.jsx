// src/Specials/SpecialsPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';
import '../Home/App.css';
import '../Home/index.css';
import '../Cake/cake.css'; // Reusing cake styles for consistency

// --- Configuration Data ---
const CAKE_SIZES = [
    { id: '6inch', label: '6" Round (Serves 8-10)', price: 30.00 },
    { id: '8inch', label: '8" Round (Serves 12-15)', price: 45.00 },
    { id: '10inch', label: '10" Round (Serves 20-25)', price: 60.00 },
];

const CAKE_BASES = [
    { id: 'vanilla', label: 'Vanilla Bean', price: 0 },
    { id: 'chocolate', label: 'Rich Chocolate', price: 0 },
    { id: 'red-velvet', label: 'Red Velvet', price: 0 },
    { id: 'lemon', label: 'Lemon Zest', price: 0 },
    { id: 'carrot', label: 'Carrot Cake', price: 5.00 },
];

const FROSTINGS = [
    { id: 'vanilla-bc', label: 'Vanilla Buttercream', price: 0 },
    { id: 'chocolate-ganache', label: 'Chocolate Ganache', price: 0 },
    { id: 'cream-cheese', label: 'Cream Cheese', price: 0 },
    { id: 'fondant', label: 'Fondant Finish', price: 15.00 },
];

const FILLINGS = [
    { id: 'none', label: 'None', price: 0 },
    { id: 'strawberry-jam', label: 'Strawberry Jam', price: 5.00 },
    { id: 'lemon-curd', label: 'Lemon Curd', price: 5.00 },
    { id: 'chocolate-mousse', label: 'Chocolate Mousse', price: 8.00 },
];

const TOPPINGS = [
    { id: 'sprinkles', label: 'Rainbow Sprinkles', price: 2.00 },
    { id: 'fresh-fruit', label: 'Fresh Fruit', price: 10.00 },
    { id: 'macarons', label: 'Macarons (3pcs)', price: 12.00 },
    { id: 'edible-flowers', label: 'Edible Flowers', price: 8.00 },
    { id: 'drip', label: 'Chocolate Drip', price: 5.00 },
];

const specialsData = [
    {
        id: 'custom-cake',
        title: 'Build Your Own Cake',
        description: 'Choose your base, frosting, and toppings for a truly unique creation.',
        imageSrc: '/Frontend/images/custom_cake.jpg', // Placeholder path
        imageAlt: 'A custom designed cake',
        price: 50.00, // Starting price
        isBuilder: true // Flag to identify this special item
    },
    {
        id: 'seasonal-pie',
        title: 'Seasonal Fruit Pie',
        description: 'Freshly baked pie using the best fruits of the season.',
        imageSrc: '/Frontend/images/seasonal_pie.jpg', // Placeholder path
        imageAlt: 'A fresh fruit pie',
        price: 25.00
    },
    {
        id: 'party-platter',
        title: 'Party Platter',
        description: 'An assortment of our best cookies, brownies, and mini-cupcakes.',
        imageSrc: '/Frontend/images/party_platter.jpg', // Placeholder path
        imageAlt: 'A platter of assorted pastries',
        price: 45.00
    }
];

const SpecialsPage = () => {
    const { addToCart } = useCart();
    const { isLoggedIn, token } = useAuth();
    const [animatingItemId, setAnimatingItemId] = useState(null);

    const addToFavorites = async (item) => {
        if (!isLoggedIn) {
            alert("Please log in to add favorites.");
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_id: item.id,
                    item_title: item.title,
                    item_image: item.imageSrc,
                    item_price: item.price
                })
            });
            if (response.ok) {
                alert("Added to favorites!");
            } else if (response.status === 409) {
                alert("Already in favorites!");
            } else {
                alert("Failed to add to favorites.");
            }
        } catch (error) {
            console.error("Error adding favorite:", error);
        }
    };

    // Builder State
    const [showBuilder, setShowBuilder] = useState(false);
    const [customCake, setCustomCake] = useState({
        size: CAKE_SIZES[0],
        base: CAKE_BASES[0],
        frosting: FROSTINGS[0],
        filling: FILLINGS[0],
        toppings: []
    });
    const [customPrice, setCustomPrice] = useState(0);

    // Calculate Price whenever options change
    useEffect(() => {
        let total = 0;
        total += customCake.size.price;
        total += customCake.base.price;
        total += customCake.frosting.price;
        total += customCake.filling.price;

        customCake.toppings.forEach(topping => {
            total += topping.price;
        });

        setCustomPrice(total);
    }, [customCake]);

    const handleOptionChange = (category, item) => {
        setCustomCake(prev => ({
            ...prev,
            [category]: item
        }));
    };

    const handleToppingToggle = (topping) => {
        setCustomCake(prev => {
            const exists = prev.toppings.find(t => t.id === topping.id);
            let newToppings;
            if (exists) {
                newToppings = prev.toppings.filter(t => t.id !== topping.id);
            } else {
                newToppings = [...prev.toppings, topping];
            }
            return { ...prev, toppings: newToppings };
        });
    };

    const handleAddToCart = (item) => {
        if (item.isBuilder) {
            setShowBuilder(true);
            return;
        }

        addToCart(item);
        triggerAnimation(item.id);
    };

    const handleAddCustomCakeToCart = () => {
        const description = `${customCake.size.label}, ${customCake.base.label}, ${customCake.frosting.label}, ${customCake.filling.label !== 'None' ? customCake.filling.label + ' Filling' : 'No Filling'}`;

        const customItem = {
            id: `custom-cake-${Date.now()}`,
            title: 'Custom Cake Creation',
            description: description,
            price: customPrice,
            imageSrc: '/Frontend/images/custom_cake.jpg',
            isCustom: true,
            details: customCake
        };

        addToCart(customItem);
        setShowBuilder(false);
        // Reset builder or keep state? Let's reset for next time
        setCustomCake({
            size: CAKE_SIZES[0],
            base: CAKE_BASES[0],
            frosting: FROSTINGS[0],
            filling: FILLINGS[0],
            toppings: []
        });

        // Show success message or animation on the main page?
        // For now, just close builder.
    };

    const triggerAnimation = (id) => {
        setAnimatingItemId(id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section hero-specials">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Specials & Custom Orders ✨</h1>
                    <p className="hero-subtitle">Unique creations and seasonal delights, made just for you.</p>
                </div>
            </section>

            <div className="content-container">
                {showBuilder ? (
                    <div className="custom-cake-builder animated-element fade-in">
                        <div className="builder-header">
                            <h2>Build Your Dream Cake 🎂</h2>
                            <button className="close-builder-btn" onClick={() => setShowBuilder(false)}>Close X</button>
                        </div>

                        <div className="builder-grid">
                            {/* Size Selection */}
                            <div className="builder-section">
                                <h3>1. Choose Size</h3>
                                <div className="options-list">
                                    {CAKE_SIZES.map(size => (
                                        <label key={size.id} className={`option-card ${customCake.size.id === size.id ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="size"
                                                checked={customCake.size.id === size.id}
                                                onChange={() => handleOptionChange('size', size)}
                                            />
                                            <span className="option-label">{size.label}</span>
                                            <span className="option-price">Ksh. {size.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Base Selection */}
                            <div className="builder-section">
                                <h3>2. Choose Base Flavor</h3>
                                <div className="options-list">
                                    {CAKE_BASES.map(base => (
                                        <label key={base.id} className={`option-card ${customCake.base.id === base.id ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="base"
                                                checked={customCake.base.id === base.id}
                                                onChange={() => handleOptionChange('base', base)}
                                            />
                                            <span className="option-label">{base.label}</span>
                                            {base.price > 0 && <span className="option-price">+Ksh. {base.price}</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Frosting Selection */}
                            <div className="builder-section">
                                <h3>3. Choose Frosting</h3>
                                <div className="options-list">
                                    {FROSTINGS.map(frosting => (
                                        <label key={frosting.id} className={`option-card ${customCake.frosting.id === frosting.id ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="frosting"
                                                checked={customCake.frosting.id === frosting.id}
                                                onChange={() => handleOptionChange('frosting', frosting)}
                                            />
                                            <span className="option-label">{frosting.label}</span>
                                            {frosting.price > 0 && <span className="option-price">+Ksh. {frosting.price}</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filling Selection */}
                            <div className="builder-section">
                                <h3>4. Choose Filling</h3>
                                <div className="options-list">
                                    {FILLINGS.map(filling => (
                                        <label key={filling.id} className={`option-card ${customCake.filling.id === filling.id ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="filling"
                                                checked={customCake.filling.id === filling.id}
                                                onChange={() => handleOptionChange('filling', filling)}
                                            />
                                            <span className="option-label">{filling.label}</span>
                                            {filling.price > 0 && <span className="option-price">+Ksh. {filling.price}</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Toppings Selection */}
                            <div className="builder-section">
                                <h3>5. Choose Toppings</h3>
                                <div className="options-list">
                                    {TOPPINGS.map(topping => (
                                        <label key={topping.id} className={`option-card ${customCake.toppings.find(t => t.id === topping.id) ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={!!customCake.toppings.find(t => t.id === topping.id)}
                                                onChange={() => handleToppingToggle(topping)}
                                            />
                                            <span className="option-label">{topping.label}</span>
                                            <span className="option-price">+Ksh. {topping.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="builder-footer">
                            <div className="total-price">
                                <span>Total Price:</span>
                                <span className="price-display">Ksh. {customPrice.toFixed(2)}</span>
                            </div>
                            <button className="add-custom-btn" onClick={handleAddCustomCakeToCart}>
                                Add Custom Cake to Cart - Ksh. {customPrice.toFixed(2)}
                            </button>
                        </div>
                    </div>
                ) : (
                    <section className="cake-container">
                        {specialsData.map((item, index) => (
                            <div
                                key={item.id}
                                className={`cake-card ${item.id} animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s` }}
                            >
                                {animatingItemId === item.id && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}
                                <button
                                    onClick={() => addToFavorites(item)}
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
                                        color: 'red',
                                        zIndex: 10
                                    }}
                                    title="Add to Favorites"
                                >
                                    ❤️
                                </button>

                                <img src={item.imageSrc} alt={item.imageAlt} width="200" height="auto" onError={(e) => { e.target.src = '/Frontend/images/logo 2.png' }} />
                                <h2>{item.title}</h2>
                                <p className="description">{item.description}</p>

                                <p className="price">
                                    {item.isBuilder ? 'Starts at ' : ''}Ksh. {item.price.toFixed(2)}
                                </p>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleAddToCart(item)}
                                >
                                    {item.isBuilder ? 'Start Building' : 'Add to Cart'}
                                </button>
                            </div>
                        ))}
                    </section>
                )}

                {!showBuilder && (
                    <div className="cake-verification animated-element fade-in" style={{ animationDelay: '1s' }}>
                        <h2>Limited Time Only! ⏳</h2>
                        <h2>Grab them while you can!</h2>
                    </div>
                )}
            </div>

            {/* Inline Styles for Builder (Ideally move to CSS file) */}
            <style>{`
                .custom-cake-builder {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    max-width: 900px;
                    margin: 0 auto;
                }
                .builder-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid var(--header-tan);
                    padding-bottom: 15px;
                }
                .close-builder-btn {
                    background: none;
                    border: 1px solid #ccc;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .builder-section {
                    margin-bottom: 30px;
                }
                .builder-section h3 {
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    font-size: 1.2rem;
                }
                .options-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
                .option-card {
                    display: flex;
                    flex-direction: column;
                    padding: 15px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #f9f9f9;
                }
                .option-card:hover {
                    border-color: var(--primary-color);
                    background: #fff;
                }
                .option-card.selected {
                    border-color: var(--primary-color);
                    background: #fff5f0;
                    box-shadow: 0 2px 8px rgba(209, 122, 71, 0.2);
                }
                .option-card input {
                    margin-bottom: 10px;
                }
                .option-label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .option-price {
                    color: var(--secondary-color);
                    font-size: 0.9rem;
                }
                .builder-footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid var(--header-tan);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .total-price {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--primary-color);
                }
                .add-custom-btn {
                    background-color: var(--primary-color);
                    color: white;
                    padding: 15px 40px;
                    font-size: 1.2rem;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    box-shadow: 0 4px 15px rgba(209, 122, 71, 0.4);
                }
                .add-custom-btn:hover {
                    background-color: var(--secondary-color);
                    transform: translateY(-2px);
                }
            `}</style>
        </>
    );
};

export default SpecialsPage;
