import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await adminService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminService.updateOrderStatus(id, newStatus);
            loadOrders(); // Refresh
        } catch (error) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="order-manager">
            <h2>Manage Orders</h2>
            {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders found.</p> : (
                <div className="order-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <b>ID: {order.id.substring(0, 8)}...</b>
                                <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                            </div>
                            <p><strong>User:</strong> {order.user_email}</p>
                            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                            <div className="order-items">
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>{item.quantity}x {item.title} (Ksh. {item.price})</li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>Total: Ksh. {order.total}</strong>

                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px' }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderManager;
