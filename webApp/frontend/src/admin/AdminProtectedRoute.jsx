// src/components/AdminProtectedRoute.jsx
import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import '../App.css'
import './admin.css'

/**
 * Admin-only wrapper. Example:
 * <AdminProtectedRoute><AdminDashboard/></AdminProtectedRoute>
 */
export default function AdminProtectedRoute({ children }) {
    return (
        <ProtectedRoute
        required={(user) => user?.role === "admin"}
        redirectTo="/login"
        >
        {children}
        </ProtectedRoute>
    );
}
