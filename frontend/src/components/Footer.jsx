import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FIT<span>ZONE</span></h3>
            <p>Your journey to a healthier, stronger you starts here.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">i</a>
              <a href="#" aria-label="Twitter">t</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Hours</h4>
            <p>Monday - Friday: 5:00 AM - 11:00 PM</p>
            <p>Saturday - Sunday: 6:00 AM - 10:00 PM</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📍 123 Fitness Street, Gym City</p>
            <p>📞 (555) 123-4567</p>
            <p>✉️ info@fitzone.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FitZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;