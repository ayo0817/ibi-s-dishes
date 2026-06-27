import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=2000&auto=format&fit=crop" 
          alt="Delicious Nigerian Food" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 text-orange border border-orange/30 backdrop-blur-sm mb-6">
            <Utensils className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Memories Over Meals</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-cream leading-tight mb-6">
            Authentic Nigerian Cuisine <br className="hidden md:block"/> Delivered Fresh Across Lagos
          </h1>
          
          <p className="text-lg md:text-xl text-cream/90 mb-10 max-w-2xl font-light">
            Enjoy delicious homemade Nigerian meals prepared with love and delivered straight to your doorstep.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#menu"
              className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-orange text-white font-semibold rounded-lg hover:bg-orange/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange/30"
            >
              Order Now <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#about"
              className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-cream/10 text-cream font-semibold rounded-lg border border-cream/30 hover:bg-cream/20 transition-all backdrop-blur-sm"
            >
              Learn More
            </a>
          </div>

          <div className="mt-12 flex items-center gap-6 text-cream/80 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              Same-day delivery
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              Freshly prepared
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              Fast across Lagos
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
