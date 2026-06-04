import React from 'react';
import ContactForm from '../components/ContactForm';
import ContactInfo from '../components/ContactInfo';
import './ContactPage.css';
import usePageKnowledge from '../hooks/usePageKnowledge';

const ContactPage = () => {
  usePageKnowledge({
    slug: 'contact',
    title: 'Contact FitZone',
    category: 'contact',
    tags: ['contact', 'support', 'location', 'hours', 'gym'],
    content: `Contact FitZone page provides gym contact information, support channels, location details, and a contact form for inquiries. It encourages prospective members to get in touch to start their fitness journey, book sessions, and ask questions about membership and services.`
  });
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