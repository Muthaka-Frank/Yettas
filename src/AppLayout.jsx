// src/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

// --- 1. CHECK THIS IMPORT ---
// Ensure the path to your Header component is correct.
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

const AppLayout = () => {
    return (
        <>
            {/* --- 2. CHECK THIS LINE --- */}
            {/* If this line is missing or commented out, the header won't show. */}
            <Header /> 
            
            <main>
                {/* Outlet renders your page (Home, Cakes, etc.) */}
                <Outlet />
            </main>
            
            <Footer />
        </>
    );
};

export default AppLayout;