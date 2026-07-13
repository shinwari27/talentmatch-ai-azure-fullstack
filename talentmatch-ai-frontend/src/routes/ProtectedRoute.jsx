import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ role, children }) {
  const { user, isLoading } = useAuth();

  // While we're still checking a stored token against the backend, show a
  // spinner instead of redirecting — otherwise a logged-in user would get
  // bounced to /login for a split second on every page refresh, before
  // their session has had a chance to be restored.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading your session…" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return children;
}
