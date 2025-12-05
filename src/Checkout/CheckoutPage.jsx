// src/Checkout/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';
import { checkout as apiCheckout } from '../services/api';
import '../Home/App.css';
import '../Home/index.css';

const CheckoutPage = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const { token, isLoggedIn } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('mpesa'); // Default to mpesa
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPinPrompt, setShowPinPrompt] = useState(false);

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
        const price = item.price || 0; // Ensure price exists
        return sum + (price * item.quantity);
    }, 0);

    const handleCheckout = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!isLoggedIn) {
            setMessage({ type: 'error', text: 'Please log in to complete your purchase.' });
            return;
        }

        if (paymentMethod === 'mpesa') {
            if (!phoneNumber) {
                setMessage({ type: 'error', text: 'Please enter a valid Mpesa Express phone number.' });
                return;
            }
        }

        setIsLoading(true);
        try {
            // Prepare items for backend
            const orderItems = cartItems.map(item => ({
                item_id: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price || 0,
                image_src: item.imageSrc || ''
            }));

            const checkoutData = {
                payment_method: paymentMethod,
                phone_number: paymentMethod === 'mpesa' ? phoneNumber : null,
                bank_account: paymentMethod === 'bank' ? '123456789' : null, // Placeholder for bank
                items: orderItems,
                total: total
            };

            const result = await apiCheckout(token, checkoutData);

            if (result.success) {
                if (paymentMethod === 'mpesa') {
                    setShowPinPrompt(true);
                    setMessage({ type: 'info', text: 'Please check your phone to complete the payment.' });
                } else {
                    setMessage({ type: 'success', text: `Order placed successfully! Status: ${result.status || 'Processing'}` });
                    clearCart();
                }
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Checkout Error:', error);
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentConfirmation = () => {
        setShowPinPrompt(false);
        clearCart();
        setMessage({ type: 'success', text: 'Payment confirmed! Your order has been placed successfully.' });
    };

    return (
        <div className="checkout-container animated-element slide-in-up">
            <h1>Your Cart 🛒</h1>
            {cartItems.length === 0 ? (
                <div className="empty-cart-message">
                    <p>Your cart is empty.</p>
                    {message && message.type === 'success' && (
                        <div className="success-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px' }}>
                            {message.text}
                        </div>
                    )}
                </div>
            ) : (
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.imageSrc} alt={item.imageAlt} />
                            <div className="item-details">
                                <h2>{item.title}</h2>
                                <p>Quantity: {item.quantity}</p>
                                {item.price && <p className="item-price-small">Ksh. {(item.price * item.quantity).toFixed(2)}</p>}
                            </div>

                            <button
                                className="remove-item-btn"
                                onClick={() => removeFromCart(item.id)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <h3 className="cart-total">Total: Ksh. {total.toFixed(2)}</h3>
                </div>
            )}

            {cartItems.length > 0 && (
                <form className="checkout-form" onSubmit={handleCheckout}>
                    <h2>Checkout</h2>

                    {message && (
                        <div className={`message ${message.type === 'error' ? 'error-message' : (message.type === 'info' ? 'info-message' : 'success-message')}`} style={{
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            backgroundColor: message.type === 'error' ? '#ffebee' : (message.type === 'info' ? '#e3f2fd' : '#e8f5e9'),
                            color: message.type === 'error' ? '#c62828' : (message.type === 'info' ? '#0d47a1' : '#2e7d32')
                        }}>
                            {message.text}
                        </div>
                    )}

                    <p>Select Payment Method:</p>

                    <div className="payment-options">
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="mpesa"
                                checked={paymentMethod === 'mpesa'}
                                onChange={() => setPaymentMethod('mpesa')}
                            />
                            Mpesa Express
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank"
                                checked={paymentMethod === 'bank'}
                                onChange={() => setPaymentMethod('bank')}
                            />
                            Bank Account
                        </label>
                    </div>

                    {paymentMethod === 'mpesa' && (
                        <div className="payment-fields">
                            <label htmlFor="mpesaPhone">Mpesa Express Phone Number:</label>
                            <input
                                type="tel"
                                id="mpesaPhone"
                                placeholder="e.g., 254712345678"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Format: 2547XXXXXXXX</small>
                        </div>
                    )}
                    {paymentMethod === 'bank' && (
                        <div className="payment-fields">
                            <label htmlFor="bankAccount">Bank Account Number:</label>
                            <input type="text" id="bankAccount" placeholder="Account Number" required />
                            <label htmlFor="bankRouting">Routing Number:</label>
                            <input type="text" id="bankRouting" placeholder="Routing Number" required />
                        </div>
                    )}

                    <button type="submit" className="add-to-cart-btn checkout-btn" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            )}

            {/* PIN Prompt Modal */}
            {showPinPrompt && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h2 style={{ color: '#333', marginBottom: '15px' }}>Confirm Payment</h2>
                        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
                            An M-Pesa payment request has been sent to <strong>{phoneNumber}</strong>.
                            <br /><br />
                            Please check your phone and enter your PIN to complete the transaction.
                        </p>
                        <div className="loader" style={{ margin: '20px auto', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                        <button
                            onClick={handlePaymentConfirmation}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            I have entered my PIN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;