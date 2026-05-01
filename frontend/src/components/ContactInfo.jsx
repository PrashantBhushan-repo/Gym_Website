import React from 'react';
import './ContactInfo.css';
import './ContactInfo.css';

const ContactInfo = () => {
  return (
    <div className="contact-info-section">
      <h2>Get in <span>Touch</span></h2>
      <div className="contact-info">
        <div className="info-item">
          <h3>📍 Location</h3>
          <p>123 Fitness Street<br />Gym City, GC 12345</p>
          <a href="#" className="link">Get Directions</a>
        </div>
        <div className="info-item">
          <h3>📞 Phone</h3>
          <p>Main: (555) 123-4567<br />Personal Training: (555) 123-4568</p>
          <a href="tel:5551234567" className="link">Call Now</a>
        </div>
        <div className="info-item">
          <h3>✉️ Email</h3>
          <p>General: info@fitzone.com<br />Membership: join@fitzone.com</p>
          <a href="mailto:info@fitzone.com" className="link">Send Email</a>
        </div>
        <div className="info-item">
          <h3>🕐 Hours</h3>
          <p><strong>Monday - Friday:</strong> 5:00 AM - 11:00 PM<br />
          <strong>Saturday - Sunday:</strong> 6:00 AM - 10:00 PM<br />
          <strong>Holidays:</strong> 8:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;