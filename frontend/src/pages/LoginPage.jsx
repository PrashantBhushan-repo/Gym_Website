import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, loading } = useAuth();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="logo">
            <h1>FIT<span>ZONE</span></h1>
          </div>
          
          <h2>Welcome to FitZone</h2>
          <p>Join the ultimate fitness experience with state-of-the-art equipment, expert trainers, and a community that inspires greatness.</p>
          
          <div className="login-features">
            <div className="feature">
              <span className="icon">🏋️</span>
              <h3>Expert Training</h3>
              <p>Learn from certified fitness professionals</p>
            </div>
            <div className="feature">
              <span className="icon">💪</span>
              <h3>State-of-the-Art Equipment</h3>
              <p>Access premium fitness facilities</p>
            </div>
            <div className="feature">
              <span className="icon">👥</span>
              <h3>Community Support</h3>
              <p>Join thousands of fitness enthusiasts</p>
            </div>
          </div>

          <div className="login-section">
            <h3>Get Started Today</h3>
            <button
              onClick={login}
              disabled={loading}
              className="google-login-btn"
            >
              {loading ? 'Loading...' : '🔐 Login with Google'}
            </button>
            <p className="login-note">
              Sign in with your Google account to access exclusive fitness programs and track your progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;