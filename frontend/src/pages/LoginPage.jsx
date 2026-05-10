import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import './LoginPage.css';

const LoginPage = () => {
  const { login, loading, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('google'); // 'google', 'password', 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuthStatus();
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminVerify = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/auth/admin-verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuthStatus();
        navigate('/dashboard');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');

    if (authStatus === 'success') {
      navigate('/dashboard');
      return;
    }

    if (authStatus === 'failed') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [navigate]);

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

            {/* Login Mode Selector */}
            <div className="login-mode-selector">
              <button
                className={`mode-btn ${loginMode === 'google' ? 'active' : ''}`}
                onClick={() => setLoginMode('google')}
              >
                Google Login
              </button>
              <button
                className={`mode-btn ${loginMode === 'password' ? 'active' : ''}`}
                onClick={() => setLoginMode('password')}
              >
                Member/Trainer Login
              </button>
              <button
                className={`mode-btn ${loginMode === 'admin' ? 'active' : ''}`}
                onClick={() => setLoginMode('admin')}
              >
                Admin Access
              </button>
            </div>

            {/* Google Login */}
            {loginMode === 'google' && (
              <div className="login-form">
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
            )}

            {/* Password Login */}
            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="login-form">
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-submit-btn"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
                <p className="login-note">
                  Enter your email and password to access your account.
                </p>
              </form>
            )}

            {/* Admin Verification */}
            {loginMode === 'admin' && (
              <form onSubmit={handleAdminVerify} className="login-form">
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Admin Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Admin Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-submit-btn admin-btn"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Admin Access'}
                </button>
                <p className="login-note">
                  Admin access requires specific credentials.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
