// src/Home/App.jsx
import React, { useState, useEffect } from 'react';
import MenuCard from '../MenuCard.jsx'; // Correct relative import path
import '../Home/App.css';
import '../Home/index.css';

// --- Menu and Image Data (Fixed Link URLs) ---
const menuData = {
    mainMenu: [
        {
            id: 'cakes',
            title: 'Cakes & Tarts 🎂',
            linkUrl: '/cakes', // 👈 UPDATED TO ROUTE PATH
            imageSrc: '/Frontend/index/Cake.jpeg',
            imageAlt: 'Image of Chocolate Truffle Cake',
            items: [
                { name: 'CAKES', description: 'SWEET TOOTH SECTION 🙂‍↔️' },
            ]
        },
        {
            id: 'icecreams',
            title: 'Artisan Ice Creams & Sorbets 🍦',
            linkUrl: '/icecream', // 👈 UPDATED TO ROUTE PATH
            imageSrc: '/Frontend/index/Ice Cream.jpeg',
            imageAlt: 'Image of Pistachio and Caramel Ice Cream',
            items: [
                { name: 'ICE CREAM', description: 'DESSERT FULL OF DELIGHT' },
            ]
        },
        {
            id: 'cookies',
            title: 'Cookies & Small Bites 🍪',
            linkUrl: '/cookies', // 👈 UPDATED TO ROUTE PATH
            imageSrc: '/Frontend/index/Cookies.jpeg',
            imageAlt: 'Image of Sea Salt Chocolate Chip Cookies',
            items: [
                { name: 'COOKIES', description: 'RICH FLOVOUR IN EVERY CRUNCH.' },
            ]
        },
        {
            id: 'drinks',
            title: 'Hot & Cold Drinks ☕',
            linkUrl: '/drinks', // 👈 UPDATED TO ROUTE PATH
            imageSrc: '/Frontend/index/Drinks.jpeg',
            imageAlt: 'Image of a Latte and Iced Tea',
            items: [
                { name: 'DRINKS', description: 'DELIGHTFUL REFRESHMENTS.' },
            ]
        }
    ],
    specials: {
        id: 'custom-orders',
        title: 'Custom Orders & Catering',
        linkUrl: '/specials', // 👈 SET CUSTOMS ROUTE PATH
        imageSrc: '/Frontend/index/Custom.jpeg',
        imageAlt: 'Image of a custom wedding cake',
        items: [
            { name: 'Custom Cakes', description: 'Perfect for weddings, birthdays...', price: '' },
            { name: 'Dessert Bars', description: 'Mini pastries, cookies, and tarts...', price: '' },
            { name: 'Dietary Requests', description: 'We offer **Vegan** and **Gluten-Free** options...', price: '' },
        ]
    }
};


function App() {
    // STATE: Animation trigger
    const [animate, setAnimate] = useState(false);

    // EFFECT: Trigger the opening animations after component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <main style={{ padding: 0, maxWidth: '100%' }}> {/* Reset padding for full width hero */}
                <section className="hero-section">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">Handcrafted Goodness, Made Daily</h1>
                        <p className="hero-subtitle">Welcome to Yetta's, where every bite is a celebration! Explore our delightful selection of baked goods and frozen treats.</p>
                        <a href="#menu" className="hero-cta">View Menu</a>
                    </div>
                </section>

                <div className="content-container">
                    <section id="specials">
                        <h2 className={`animated-element ${animate ? 'fade-in' : ''}`} style={{ animationDelay: '0.8s' }}>Current Specials & Custom Orders 🌟</h2>
                        <div className="menu-grid">
                            <MenuCard
                                {...menuData.specials}
                                animationClass={animate ? 'fade-in-scale animated-element' : ''}
                                animationDelay="0.9s"
                            />
                        </div>
                    </section>

                    <section id="menu">
                        <h2 className={`animated-element ${animate ? 'fade-in' : ''}`} style={{ animationDelay: '1.0s' }}>Our Full Menu</h2>
                        <div className="menu-grid">
                            {/* Staggered animation for all main menu cards */}
                            {menuData.mainMenu.map((card, index) => (
                                <MenuCard
                                    key={card.id}
                                    {...card}
                                    animationClass={animate ? 'fade-in-scale animated-element' : ''}
                                    animationDelay={`${1.1 + index * 0.2}s`}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

export default App;