import React, { useState } from 'react';
import './ContactForm.css';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      showNotification('Please fill in all required fields!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://gym-website-xtj6.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          interest: '',
          message: ''
        });
      } else {
        showNotification(data.message || 'Error submitting form. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error submitting form. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="contact-form-section">
      <h2>Send Us a <span>Message</span></h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="interest">I'm interested in:</label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="membership">Gym Membership</option>
            <option value="personal-training">Personal Training</option>
            <option value="group-classes">Group Classes</option>
            <option value="nutrition">Nutrition Counseling</option>
            <option value="free-pass">Free Day Pass</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="message">Message*</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ContactForm;