import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!loading && user && requireAdmin && user.role !== 'admin') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, user, requireAdmin, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4">
        <h1 className="text-4xl font-heading font-bold text-navy mb-4">Access Denied</h1>
        <p className="text-lg text-navy/70 mb-4 text-center max-w-md">You do not have permission to view this page. Only administrators can access this area.</p>
        <p className="text-md text-orange font-medium mb-8">Redirecting to homepage in {countdown} seconds...</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-orange text-white rounded-full font-semibold hover:bg-orange/90 transition-colors">
          Return Now
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
