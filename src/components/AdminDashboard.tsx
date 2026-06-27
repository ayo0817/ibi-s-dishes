import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { ShieldAlert, Package, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/');
      } else {
        fetchOrders();
      }
    }
  }, [user, isLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/admin/orders', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-orange" />
          <h2 className="text-3xl font-heading font-bold text-navy">Admin Dashboard</h2>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-navy/10 overflow-hidden">
          <div className="p-6 border-b border-navy/10 bg-cream/30">
            <h3 className="font-heading font-bold text-xl text-navy flex items-center gap-2">
              <Package className="w-5 h-5" /> Recent Orders
            </h3>
          </div>
          
          <div className="p-6">
            {loadingOrders ? (
              <p className="text-navy/60 text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-navy/60 text-center py-8">No orders have been placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-navy/10">
                      <th className="py-4 font-semibold text-navy">Order ID</th>
                      <th className="py-4 font-semibold text-navy">Customer</th>
                      <th className="py-4 font-semibold text-navy">Items</th>
                      <th className="py-4 font-semibold text-navy">Total</th>
                      <th className="py-4 font-semibold text-navy">Status</th>
                      <th className="py-4 font-semibold text-navy">Proof</th>
                      <th className="py-4 font-semibold text-navy">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-navy/5 hover:bg-cream/20 transition-colors">
                        <td className="py-4 text-sm font-mono text-navy/70">{order.id}</td>
                        <td className="py-4">
                          <div className="font-medium text-navy">{order.name}</div>
                          <div className="text-sm text-navy/60">{order.phone}</div>
                        </td>
                        <td className="py-4 text-sm text-navy/70">
                          {order.items.length} items
                        </td>
                        <td className="py-4 font-medium text-navy">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-orange/10 text-orange rounded-full text-xs font-semibold uppercase tracking-wider">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-navy/70">
                          {order.paymentProof ? (
                            <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-navy/40 text-xs">No</span>
                          )}
                        </td>
                        <td className="py-4 text-sm text-navy/70">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
