import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { dishes, drinks } from '../data';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Product } from '../types';

function ProductCard({ product }: { product: Product; key?: string | number }) {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-navy/5 flex flex-col h-full"
    >
      {product.image && (
        <div className="relative h-64 overflow-hidden bg-navy/5">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-full text-navy font-semibold shadow-sm">
            {formatCurrency(product.price)}
          </div>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-heading font-bold text-navy mb-2">{product.name}</h3>
          {product.description && (
            <p className="text-navy/60 text-sm leading-relaxed mb-4">{product.description}</p>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {!product.image && (
             <span className="font-semibold text-lg text-navy">{formatCurrency(product.price)}</span>
          )}
          <button 
            onClick={() => addToCart(product)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-navy text-white rounded-xl hover:bg-orange transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuSection() {
  const { addToCart } = useCart();
  
  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-orange mb-2">Our Menu</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-6">Featured Dishes</h3>
          <p className="text-lg text-navy/70">
            Prepared with traditional recipes, fresh ingredients, and a whole lot of love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {dishes.map((dish) => (
            <ProductCard key={dish.id} product={dish} />
          ))}
        </div>

        {/* Drinks Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-navy/5">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-heading font-bold text-navy mb-4">Refreshing Drinks</h3>
            <div className="w-16 h-1 bg-orange mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {drinks.map((drink) => (
              <div key={drink.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 hover:border-orange transition-colors bg-cream/30">
                <div>
                  <h4 className="font-semibold text-navy">{drink.name}</h4>
                  <p className="text-orange font-medium text-sm">{formatCurrency(drink.price)}</p>
                </div>
                <button 
                  onClick={() => addToCart(drink)}
                  className="p-2 bg-navy/5 text-navy hover:bg-orange hover:text-white rounded-lg transition-colors"
                  aria-label={`Add ${drink.name} to cart`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
