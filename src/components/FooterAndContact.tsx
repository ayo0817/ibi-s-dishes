import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { contactDetails } from '../data';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-orange mb-2">Get In Touch</h2>
          <h3 className="text-4xl font-heading font-bold text-navy">Contact Us</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange/10 rounded-xl text-orange">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-lg">Phone</h4>
                {contactDetails.phones.map((phone, idx) => (
                  <p key={idx} className="text-navy/70 mt-1">{phone}</p>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange/10 rounded-xl text-orange">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-lg">Email</h4>
                <a href={`mailto:${contactDetails.email}`} className="text-navy/70 hover:text-orange transition-colors mt-1 block">
                  {contactDetails.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange/10 rounded-xl text-orange">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-lg">Location</h4>
                <p className="text-navy/70 mt-1">{contactDetails.address}</p>
              </div>
            </div>
            
            {/* Simple Map Placeholder */}
            <div className="w-full h-48 bg-cream rounded-2xl overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" alt="Lagos Map" className="w-full h-full object-cover opacity-50 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 bg-navy text-white rounded-full font-semibold text-sm shadow-lg">Lagos, Nigeria</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-cream/50 p-8 rounded-3xl border border-navy/10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors" 
                  placeholder="Your Name" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors" 
                  placeholder="your@email.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Message</label>
                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:outline-none focus:border-orange bg-white transition-colors resize-none" 
                  placeholder="How can we help?"
                ></textarea>
              </div>
              
              {status === 'error' && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
              {status === 'success' && <p className="text-green-500 text-sm text-center">Message sent successfully!</p>}
              
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full py-4 bg-navy text-white rounded-xl font-medium hover:bg-orange transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-navy py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <span className="font-heading font-bold text-3xl text-white tracking-tight">
              IBI'S <span className="text-orange">DISHES</span>
            </span>
            <p className="text-white/70 mt-4 max-w-sm mx-auto md:mx-0">
              Authentic Nigerian Cuisine & Food Delivery
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            {contactDetails.phones.map((phone, idx) => (
              <p key={idx} className="text-white/70">{phone}</p>
            ))}
            <p className="text-white/70">{contactDetails.email}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-4">Location</h4>
            <p className="text-white/70">{contactDetails.address}</p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © {currentYear} IBI'S DISHES. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  const phoneNumber = "2348033183936";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20IBI'S%20DISHES,%20I%20would%20like%20to%20make%20an%20order.`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
      aria-label="Order on WhatsApp"
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
      <span className="font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
        Order on WhatsApp
      </span>
    </a>
  );
}
