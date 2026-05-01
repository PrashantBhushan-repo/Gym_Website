import React from 'react';
import './Features.css';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '💪',
      title: 'Modern Equipment',
      description: 'Top-tier machines and free weights from leading fitness brands'
    },
    {
      icon: '🏃',
      title: 'Personal Training',
      description: 'Certified trainers to guide your fitness journey'
    },
    {
      icon: '🧘',
      title: 'Group Classes',
      description: 'From HIIT to Yoga, find your perfect workout'
    },
    {
      icon: '🏊',
      title: 'Premium Amenities',
      description: 'Pool, sauna, and recovery zones for complete wellness'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">
          Why Choose <span>FitZone</span>
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;