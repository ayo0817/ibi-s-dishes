import React from 'react';
import { gallery } from '../data';

export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <img 
              src="https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000&auto=format&fit=crop" 
              alt="Nigerian Chef" 
              className="rounded-3xl shadow-2xl"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-orange">Our Story</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-navy">About IBI'S DISHES</h3>
            <p className="text-lg text-navy/70 leading-relaxed">
              IBI'S DISHES is a proudly Nigerian food brand dedicated to serving authentic local meals made from fresh ingredients and traditional recipes. We bring the rich taste of Nigerian cuisine directly to homes, offices, and events across Lagos.
            </p>
            <div className="p-6 bg-cream rounded-2xl border-l-4 border-orange">
              <h4 className="font-heading font-bold text-xl text-navy mb-2">Our Mission</h4>
              <p className="text-navy/70">
                To provide delicious, hygienic, affordable, and authentic Nigerian meals with excellent customer service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-orange mb-2">Gallery</h2>
          <h3 className="text-4xl font-heading font-bold text-navy">Fresh from the Kitchen</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
