import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="spinner" />;
  const from = `${location.pathname}${location.search}`;
  if (!user) {
    // Keep the query string so e.g. /book?pickup=... survives the detour through login.
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace state={{ from }} />;
  }
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from, notice: 'The admin panel needs an admin account.' }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}
