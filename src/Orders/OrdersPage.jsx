// src/Orders/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext.jsx';
import '../Home/App.css';
import '../Home/index.css';

const OrdersPage = () => {
    const { isLoggedIn, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, token]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Sort by date descending (newest first)
                const sortedOrders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setOrders(sortedOrders);
            } else {
                setError('Failed to fetch orders.');
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError('An error occurred while loading orders.');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <>
                <section className="hero-section hero-generic">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">Order History 📦</h1>
                        <p className="hero-subtitle">Please log in to view your past orders.</p>
                    </div>
                </section>
                <div className="content-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your order history.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <section className="hero-section hero-generic">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Order History 📦</h1>
                    <p className="hero-subtitle">Track your current orders and view past purchases.</p>
                </div>
            </section>

            <div className="content-container">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</p>
                ) : error ? (
                    <p style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</p>
                ) : orders.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '50px' }}>You haven't placed any orders yet.</p>
                ) : (
                    <div className="orders-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {orders.map((order) => (
                            <div key={order._id?.$oid || order.id} className="order-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                                <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>Order #{order._id?.$oid ? order._id.$oid.substring(0, 8) : '...'}</span>
                                        <span style={{ marginLeft: '15px', color: '#666', fontSize: '0.9rem' }}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`status ${order.status.toLowerCase()}`} style={{ color: order.status === 'Delivered' ? 'green' : order.status === 'Paid' ? 'blue' : 'orange', fontWeight: 'bold' }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-body">
                                    <p><strong>Items:</strong> {order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}</p>
                                    <p style={{ marginTop: '10px', fontSize: '1.1rem' }}><strong>Total:</strong> Ksh. {order.total.toFixed(2)}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#888' }}>Payment: {order.payment_method}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default OrdersPage;
