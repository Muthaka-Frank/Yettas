import React, { useState } from 'react';
import MenuManager from './MenuManager';
import OrderManager from './OrderManager';
import OffersManager from './OffersManager';
import '../Home/App.css'; // Reusing main styles
import './admin.css'; // Custom admin styles

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="admin-dashboard-container content-container">
            <h1 className="admin-title">Admin Dashboard 🛡️</h1>

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button
                    className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`}
                    onClick={() => setActiveTab('menu')}
                >
                    Menu Items
                </button>
                <button
                    className={`admin-tab ${activeTab === 'offers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('offers')}
                >
                    Offers & Deals
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'orders' && <OrderManager />}
                {activeTab === 'menu' && <MenuManager />}
                {activeTab === 'offers' && <OffersManager />}
            </div>
        </div>
    );
};

export default AdminDashboard;
