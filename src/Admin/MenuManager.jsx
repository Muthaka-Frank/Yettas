import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const MenuManager = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_src: '',
        category: 'cakes',
        available: true,
        options: []
    });

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            // Note: We might want a public endpoint or admin specific one. 
            // Using the public one for list is fine, but for admin we might want to see disabled items too.
            // For now, let's use the public one, or the direct collection access if we create admin-specific get.
            // The plan said 'get_menu' is public.
            // Wait, we need to fetch from the BACKEND, not the static file.
            // But currently the backend might be empty.
            // Let's assume we use the GET /api/menu endpoint.
            const response = await fetch('http://localhost:8080/api/menu');
            const data = await response.json();
            // Map the data to ensure 'id' is available from '_id'
            const mappedData = data.map(item => ({
                ...item,
                id: item._id?.$oid || item._id || item.id
            }));
            setMenuItems(mappedData);
        } catch (error) {
            console.error("Failed to load menu", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                // transform options string to array if needed, currently empty
            };

            if (editingItem) {
                await adminService.updateMenuItem(editingItem.id, payload);
            } else {
                await adminService.addMenuItem(payload);
            }

            setFormData({ title: '', description: '', price: '', image_src: '', category: 'cakes', available: true, options: [] });
            setEditingItem(null);
            loadMenu();
        } catch (error) {
            alert('Operation failed: ' + error.message);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            price: item.price,
            image_src: item.image_src,
            category: item.category,
            available: item.available,
            options: item.options
        });
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await adminService.deleteMenuItem(id);
                loadMenu();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div className="menu-manager">
            <div className="manager-header">
                <h2>Manage Menu Items</h2>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>

                <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                />

                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        required
                    />

                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="cakes">Cakes</option>
                        <option value="cookies">Cookies</option>
                        <option value="icecream">Ice Cream</option>
                        <option value="drinks">Drinks</option>
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Image URL (e.g. /Frontend/index/Cake.jpeg)"
                    value={formData.image_src}
                    onChange={e => setFormData({ ...formData, image_src: e.target.value })}
                    required
                />

                <label>
                    <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={e => setFormData({ ...formData, available: e.target.checked })}
                    />
                    Available
                </label>

                <div className="form-actions">
                    <button type="submit" className="add-btn">{editingItem ? 'Update' : 'Add Item'}</button>
                    {editingItem && (
                        <button type="button" onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', price: '', image_src: '', category: 'cakes', available: true, options: [] }); }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="item-list">
                {loading ? <p>Loading...</p> : menuItems.map(item => (
                    <div key={item.id} className="admin-item-card">
                        <div className="item-info">
                            <img src={item.image_src} alt={item.title} className="item-thumbnail" />
                            <div>
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                                <p><strong>Ksh. {item.price}</strong> | {item.category} | {item.available ? 'Available' : 'Unavailable'}</p>
                            </div>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManager;
