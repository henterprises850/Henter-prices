// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "deliveryBoy" && !user?.isDeliveryBoy) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "customer" && (user?.isAdmin || user?.isDeliveryBoy)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
