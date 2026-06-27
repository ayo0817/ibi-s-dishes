import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-navy/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-orange" />
                <h2 className="text-xl font-heading font-bold text-navy">Your Order</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-cream rounded-full transition-colors text-navy/60 hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-orange/50">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-navy">Your cart is empty</h3>
                    <p className="text-navy/60 mt-2">Looks like you haven't added any dishes yet.</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-3 bg-orange text-white rounded-xl font-medium hover:bg-orange/90 transition-colors"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-cream/30 p-4 rounded-2xl border border-navy/5">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-navy leading-tight">{item.name}</h4>
                        <p className="text-orange font-medium mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-navy/10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-navy hover:text-orange transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-medium text-navy text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-navy hover:text-orange transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-navy/40 hover:text-red-500 underline transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-cream/50 border-t border-navy/10 space-y-4">
                <div className="space-y-2 text-sm text-navy/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-navy">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery (Lagos Only)</span>
                    <span className="font-medium text-navy">{formatCurrency(deliveryFee)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-navy/10">
                  <span className="text-lg font-heading font-bold text-navy">Total</span>
                  <span className="text-xl font-bold text-orange">{formatCurrency(total)}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-all flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
