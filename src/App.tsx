/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import { About, Gallery } from './components/InfoSections';
import { Contact, Footer, FloatingWhatsApp } from './components/FooterAndContact';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function LandingPage() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <MenuSection />
        <About />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
