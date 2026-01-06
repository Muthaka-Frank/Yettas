import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { isLoggedIn, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // Or return null
    }

    if (!isLoggedIn) {
        return <Navigate to="/auth" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
