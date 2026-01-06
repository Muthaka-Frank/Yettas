import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const OffersManager = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: 0.1,
        code: '',
        active: false
    });

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            // Use the public or admin endpoint that returns ALL offers
            // The service calls /api/admin/offers which returns all
            const data = await adminService.getOffers(); // Verify if this service calls admin or public
            // adminService.getOffers calls /api/admin/offers (Wait, check service implementation)
            // Implementation check: getOffers calls /api/admin/offers. Correct.

            const mappedData = data.map(item => ({
                ...item,
                id: item._id?.$oid || item._id || item.id
            }));
            setOffers(mappedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.addOffer(formData);
            setFormData({ title: '', description: '', discount_percentage: 0.1, code: '', active: false });
            loadOffers();
        } catch (error) {
            alert("Failed to add offer");
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminService.toggleOffer(id);
            loadOffers();
        } catch (error) {
            alert("Failed to toggle offer");
        }
    };

    return (
        <div className="offers-manager">
            <h2>Manage Deals & Offers</h2>

            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>Create New Offer</h3>
                <input
                    type="text"
                    placeholder="Title (e.g. Black Friday Sale)"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Code (e.g. BF2024)"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <label>Discount Percentage (0.1 = 10%)</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.2"
                    value={formData.discount_percentage}
                    onChange={e => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                    required
                />
                <label>
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    />
                    Active Immediately
                </label>
                <div className="form-actions">
                    <button type="submit" className="add-btn">Create Offer</button>
                </div>
            </form>

            <div className="item-list">
                {offers.map(offer => (
                    <div key={offer.id} className="admin-item-card">
                        <div>
                            <h4>{offer.title} ({offer.code})</h4>
                            <p>{offer.description}</p>
                            <p>Discount: {offer.discount_percentage * 100}%</p>
                        </div>
                        <div className="item-actions">
                            <button
                                onClick={() => handleToggle(offer.id)}
                                className={offer.active ? "delete-btn" : "add-btn"}
                            >
                                {offer.active ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OffersManager;
