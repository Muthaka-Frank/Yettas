import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { allMenuData } from '../data/allMenuData.js';
import '../Home/App.css';
import '../Home/index.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { addToCart } = useCart();
    const [animatingItemId, setAnimatingItemId] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        if (query) {
            const lowerQuery = query.toLowerCase();
            const results = allMenuData.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.description.toLowerCase().includes(lowerQuery) ||
                (item.category && item.category.toLowerCase().includes(lowerQuery))
            );
            setFilteredItems(results);
        } else {
            setFilteredItems([]);
        }
    }, [query]);

    const handleAddToCart = (item) => {
        addToCart(item);
        setAnimatingItemId(item.id);
        setTimeout(() => {
            setAnimatingItemId(null);
        }, 1000);
    };

    return (
        <>
            <section className="hero-section" style={{ minHeight: '40vh' }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Search Results 🔍</h1>
                    <p className="hero-subtitle">
                        {query ? `Showing results for "${query}"` : 'Enter a search term to find your favorite treats.'}
                    </p>
                </div>
            </section>

            <div className="content-container">
                {filteredItems.length > 0 ? (
                    <section className="menu-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '20px', justifyContent: 'center' }}>
                        {filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`cake-card animated-element slide-in-up`}
                                style={{ animationDelay: `${0.1 * index}s`, flex: '0 0 300px', maxWidth: '300px' }}
                            >
                                {animatingItemId === item.id && (
                                    <div className="add-to-cart-animation">Added!</div>
                                )}

                                <img src={item.imageSrc} alt={item.imageAlt} width="200" height="auto" style={{ borderRadius: '8px', marginBottom: '15px' }} />
                                <h2>{item.title}</h2>
                                <p className="description">{item.description}</p>
                                {item.category && <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '10px' }}>{item.category}</span>}

                                {item.price ? (
                                    <>
                                        <p className="price">Ksh. {item.price.toFixed(2)}</p>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(item)}
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
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                        <h2>No items found matching "{query}" 😔</h2>
                        <p>Try searching for "chocolate", "vanilla", "cake", or "cookies".</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SearchPage;
