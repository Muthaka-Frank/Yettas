// src/services/adminService.js
const API_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const adminService = {
    // Orders
    getOrders: async () => {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    updateOrderStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    },

    // Menu
    addMenuItem: async (item) => {
        const response = await fetch(`${API_URL}/admin/menu`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(item)
        });
        if (!response.ok) throw new Error('Failed to add menu item');
        return response.json();
    },

    updateMenuItem: async (id, item) => {
        const response = await fetch(`${API_URL}/admin/menu/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(item)
        });
        if (!response.ok) throw new Error('Failed to update menu item');
        return response.json();
    },

    deleteMenuItem: async (id) => {
        const response = await fetch(`${API_URL}/admin/menu/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to delete menu item');
        return response.json();
    },

    // Offers
    getOffers: async () => {
        const response = await fetch(`${API_URL}/admin/offers`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch offers');
        return response.json();
    },

    addOffer: async (offer) => {
        const response = await fetch(`${API_URL}/admin/offers`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(offer)
        });
        if (!response.ok) throw new Error('Failed to add offer');
        return response.json();
    },

    toggleOffer: async (id) => {
        const response = await fetch(`${API_URL}/admin/offers/${id}/toggle`, {
            method: 'PUT',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to toggle offer');
        return response.json();
    }
};
