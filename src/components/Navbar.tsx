import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Phone, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/#menu' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin Dashboard', href: '/admin' });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-cream/90 backdrop-blur-md border-b border-navy/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading font-bold text-2xl text-navy tracking-tight">
              IBI'S <span className="text-orange">DISHES</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              (isHome && link.href.startsWith('/#')) ? (
                <a key={link.name} href={link.href} className="text-navy font-medium hover:text-orange transition-colors">
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} to={link.href} className="text-navy font-medium hover:text-orange transition-colors">
                  {link.name}
                </Link>
              )
            ))}
            
            <a href="tel:08033183936" className="flex items-center gap-2 text-navy font-medium hover:text-orange transition-colors">
              <Phone className="w-4 h-4" />
              <span>0803 318 3936</span>
            </a>
          </div>

          {/* Cart & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-medium text-navy/70 flex items-center gap-1">
                  <UserIcon className="w-4 h-4" /> {user.username}
                </span>
                <button onClick={handleLogout} className="text-sm text-navy hover:text-orange transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-sm font-medium text-navy hover:text-orange transition-colors">
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-navy hover:text-orange transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange rounded-full border-2 border-cream">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-navy"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-20 left-0 w-full bg-cream border-b border-navy/10 transition-all duration-300 ease-in-out overflow-hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            (isHome && link.href.startsWith('/#')) ? (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-navy font-medium text-lg"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-navy font-medium text-lg"
              >
                {link.name}
              </Link>
            )
          ))}
          <hr className="border-navy/10 my-2" />
          {user ? (
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left text-orange font-medium text-lg">
              Sign Out ({user.username})
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-orange font-medium text-lg">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
