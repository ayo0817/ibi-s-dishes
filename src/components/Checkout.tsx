import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { bankDetails } from '../data';
import { CheckCircle, Upload, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'' | 'uploading' | 'success' | 'error'>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    notes: ''
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      // Redirect to login if trying to checkout without an account
      navigate('/login', { state: { from: location } });
    }
  }, [user, isAuthLoading, navigate, location]);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-navy">Loading...</div>;
  }

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-heading font-bold text-navy mb-4">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange text-white rounded-xl font-medium"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          items,
          total
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setOrderId(data.orderId);
      
      // Use the order returned from the database
      const dbOrder = data.order;
      const parsedItems = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items;
      
      const orderSubtotal = parsedItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      const orderDeliveryFee = dbOrder.total - orderSubtotal;
      
      setSubmittedOrder({
        ...dbOrder,
        items: parsedItems,
        subtotal: orderSubtotal,
        deliveryFee: orderDeliveryFee
      });
      setIsSubmitted(true);
      clearCart();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploadStatus('uploading');
    console.log('Uploading payment proof for order', orderId);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/orders/${orderId}/proof`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ proofBase64: base64 })
        });

        if (!res.ok) throw new Error('Failed to upload proof');
        
        console.log('Payment proof uploaded successfully');
        setUploadStatus('success');
      } catch (err) {
        console.error('Error uploading proof:', err);
        setUploadStatus('error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWhatsAppClick = () => {
    console.log('Opening WhatsApp for order', orderId);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-heading font-bold text-navy mb-4">Order Received!</h2>
          <p className="text-lg text-navy/70 mb-8">
            Thank you, {formData.name}. Your order has been recorded securely.
          </p>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm text-left mb-8 border border-navy/10">
            <h3 className="font-heading font-bold text-xl text-navy mb-6">Payment Instructions</h3>
            <p className="text-navy/70 mb-6">
              Please transfer <span className="font-bold text-navy">{formatCurrency(submittedOrder?.total || 0)}</span> to the account below to process your order.
            </p>
            
            <div className="bg-cream/50 p-6 rounded-2xl border border-orange/20 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-navy/60">Bank Name</span>
                <span className="font-semibold text-navy">{bankDetails.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/60">Account Number</span>
                <span className="font-bold text-lg text-orange tracking-wider">{bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/60">Account Name</span>
                <span className="font-semibold text-navy">{bankDetails.accountName}</span>
              </div>
            </div>

            {submittedOrder && (
              <div className="mt-8 pt-8 border-t border-navy/10">
                <h3 className="text-lg font-heading font-bold text-navy mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {submittedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-navy/80">
                        <span className="font-semibold text-navy">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-navy">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-navy/5 text-sm">
                  <div className="flex justify-between text-navy/70">
                    <span>Subtotal</span>
                    <span className="font-medium text-navy">{formatCurrency(submittedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-navy/70">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-navy">{formatCurrency(submittedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 font-bold text-navy">
                    <span>Total Cost</span>
                    <span className="text-orange">{formatCurrency(submittedOrder.total)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mt-8 text-center font-medium text-navy bg-orange/10 p-4 rounded-xl">
              After making payment, upload your payment proof below or send it via WhatsApp for order confirmation.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                className="w-full py-4 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Upload className="w-5 h-5" /> 
                {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Proof Uploaded!' : 'Upload Payment Proof'}
              </button>
              
              <a 
                href={`https://wa.me/2348033183936?text=${encodeURIComponent(`Hi, I have completed payment for my order.\nCustomer name: ${formData.name}\nOrder number: ${orderId}\nOrder total: ${formatCurrency(submittedOrder?.total || 0)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full py-4 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#25D366]/90 transition-colors flex items-center justify-center text-center"
              >
                Send Proof via WhatsApp
              </a>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="text-navy hover:text-orange font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-navy/60 hover:text-navy mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-navy">Checkout Information</h2>
              <p className="text-navy/70 mt-2">Logged in as: <span className="font-semibold">{user?.username}</span></p>
            </div>
            
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Phone Number *</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Delivery Address (Lagos Only) *</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors resize-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Nearest Landmark *</label>
                <input 
                  required
                  type="text" 
                  value={formData.landmark}
                  onChange={e => setFormData({...formData, landmark: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Additional Notes (Optional)</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors resize-none" 
                  placeholder="e.g. Please call when you arrive"
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange text-white rounded-xl font-bold text-lg hover:bg-orange/90 transition-all shadow-lg shadow-orange/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy/5 sticky top-28">
              <h3 className="text-xl font-heading font-bold text-navy mb-6">Order Summary</h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-navy/80">
                      <span className="font-semibold text-navy">{item.quantity}x</span>
                      <span className="truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-medium text-navy">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-navy/10 text-sm">
                <div className="flex justify-between text-navy/70">
                  <span>Subtotal</span>
                  <span className="font-medium text-navy">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-navy/70">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-navy">{formatCurrency(deliveryFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-navy/10">
                <span className="text-lg font-heading font-bold text-navy">Total Cost</span>
                <span className="text-2xl font-bold text-orange">{formatCurrency(total)}</span>
              </div>
              
              <div className="mt-8 p-4 bg-cream/50 rounded-xl border border-navy/10">
                <h4 className="font-semibold text-navy mb-2 text-sm">Payment Method</h4>
                <p className="text-navy/70 text-sm">Bank Transfer</p>
                <p className="text-xs text-navy/50 mt-1">Account details will be provided after confirming the order.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
