// src/Home/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 1. IMPORT THE CART PROVIDER
import { CartProvider } from '../context/CartContext.jsx';
import { AuthProvider } from '../Auth/AuthProvider.jsx'; // Import AuthProvider
import './index.css';

// Import Layout and Pages
import AppLayout from '../AppLayout.jsx';
import Home from './App.jsx';
import CakesPage from '../Cake/CakesPage.jsx';
import IceCreamPage from '../IceCream/IceCreamPage.jsx';
import CookiesPage from '../Cookies/CookiesPage.jsx';
import DrinksPage from '../Drinks/DrinksPage.jsx';
import AuthPage from '../Auth/AuthPage.jsx';
import CheckoutPage from '../Checkout/CheckoutPage.jsx'; // 2. IMPORT CHECKOUT PAGE
import SpecialsPage from '../Specials/SpecialsPage.jsx';
import ProfilePage from '../Profile/ProfilePage.jsx';
import OrdersPage from '../Orders/OrdersPage.jsx';
import FavoritesPage from '../Favorites/FavoritesPage.jsx';

// ... (Placeholder for CustomPage)

import SearchPage from '../components/SearchPage.jsx';
import ForgotPasswordPage from '../Auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../Auth/ResetPasswordPage.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "cakes", element: <CakesPage /> },
            { path: "icecream", element: <IceCreamPage /> },
            { path: "cookies", element: <CookiesPage /> },
            { path: "drinks", element: <DrinksPage /> },
            { path: "login", element: <AuthPage /> },
            { path: "account", element: <AuthPage /> },
            { path: "checkout", element: <CheckoutPage /> }, // 3. ADD CHECKOUT ROUTE
            { path: "specials", element: <SpecialsPage /> },
            { path: "profile", element: <ProfilePage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "favorites", element: <FavoritesPage /> },
            { path: "search", element: <SearchPage /> }, // New Search Route
            { path: "forgot-password", element: <ForgotPasswordPage /> },
            { path: "reset-password", element: <ResetPasswordPage /> },
            // ...
        ],
    },
]);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            {/* THIS MUST WRAP THE ROUTER */}
            {/* THIS MUST WRAP THE ROUTER */}
            <AuthProvider>
                <CartProvider>
                    <RouterProvider router={router} />
                </CartProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);