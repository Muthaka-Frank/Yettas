import React, { createContext, useContext, useState } from 'react';

// 1. Create the context
const CartContext = createContext();

// 2. Create a custom hook to use the context easily
export const useCart = () => {
    return useContext(CartContext);
};

// 3. Create the provider component
export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]); // This holds the cart items

    const addToCart = (item) => {
        setItems(prevItems => {
            // Check if item already in cart
            const existingItem = prevItems.find(i => i.id === item.id);
            
            if (existingItem) {
                // If item exists, increase quantity
                return prevItems.map(i => 
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                // If new item, add to cart with quantity 1
                // Ensure the item object has an initial quantity property
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });

        // In a real app, you would also call your Rust API here:
        // api.postToCart(item.id, 1);
    };

    // 4. Add the removeFromCart function
    const removeFromCart = (itemId) => {
        setItems(prevItems => {
            // Filter out the item with the matching id
            return prevItems.filter(item => item.id !== itemId);
        });
    }

    const value = {
        cartItems: items,
        // Calculate total number of items across all quantities
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        addToCart,
        removeFromCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};