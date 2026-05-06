import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loading, login, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogin = () => {
    login();
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <h1>FIT<span>ZONE</span></h1>
          </Link>
        </div>
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
          {user && (
            <li>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            </li>
          )}
          {/* Authentication Section */}
          <li className="auth-section">
            {!loading && (
              user ? (
                <div className="user-menu">
                  <div className="user-info">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.displayName}
                        className="user-avatar"
                      />
                    )}
                    <span className="user-name">{user.displayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="auth-btn logout-btn"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="auth-btn login-btn"
                >
                  Login with Google
                </button>
              )
            )}
          </li>
        </ul>
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;