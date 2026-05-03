import React from 'react';
import ContactForm from '../components/ContactForm';
import ContactInfo from '../components/ContactInfo';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1>Contact <span>Us</span></h1>
          <p>Get in touch and start your fitness journey today</p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;