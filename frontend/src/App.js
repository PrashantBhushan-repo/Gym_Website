import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import MembershipCheckoutPage from './pages/MembershipCheckoutPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - require authentication */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
                    <Route path="/about" element={<ProtectedRoute element={<AboutPage />} />} />
                    <Route path="/services" element={<ProtectedRoute element={<ServicesPage />} />} />
                    <Route path="/contact" element={<ProtectedRoute element={<ContactPage />} />} />
                    <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
                    <Route path="/membership/checkout" element={<ProtectedRoute element={<MembershipCheckoutPage />} />} />
                    <Route path="/shop" element={<ProtectedRoute element={<ShopPage />} />} />
                    <Route path="/shop/cart" element={<ProtectedRoute element={<CartPage />} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Footer />
                </>
              }
            />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;