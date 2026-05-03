import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css';

const ServicesPage = () => {
  const classes = [
    { name: 'HIIT Training', description: 'High-intensity interval training to burn calories and build endurance', duration: '45 min', level: 'All levels' },
    { name: 'Yoga Flow', description: 'Improve flexibility, balance, and mental clarity', duration: '60 min', level: 'Beginner-Advanced' },
    { name: 'Strength Circuit', description: 'Build muscle and increase strength with guided weight training', duration: '50 min', level: 'Intermediate' },
    { name: 'Spin Class', description: 'High-energy cycling workout to improve cardiovascular fitness', duration: '45 min', level: 'All levels' },
    { name: 'Boxing Fitness', description: 'Combine cardio and strength with boxing techniques', duration: '55 min', level: 'All levels' },
    { name: 'Pilates', description: 'Core-focused workout for strength and posture', duration: '50 min', level: 'All levels' }
  ];

  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Our <span>Services</span></h1>
          <p>Discover the perfect fitness solution for your goals</p>
        </div>
      </section>

      <section className="services-main">
        <div className="container">
          <h2 className="section-title">
            Personal <span>Training</span>
          </h2>
          <div className="service-detail">
            <div className="service-info">
              <h3>One-on-One Coaching</h3>
              <p>
                Get personalized attention from certified fitness professionals who will create
                custom workout plans tailored to your specific goals, fitness level, and schedule.
              </p>
              <ul className="service-features">
                <li>✓ Initial fitness assessment</li>
                <li>✓ Customized workout plans</li>
                <li>✓ Nutrition guidance</li>
                <li>✓ Progress tracking</li>
                <li>✓ Flexible scheduling</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">Book a Session</Link>
            </div>
            <div className="service-image">
              <div className="image-placeholder">Personal Training</div>
            </div>
          </div>

          <h2 className="section-title">
            Group <span>Classes</span>
          </h2>
          <div className="classes-grid">
            {classes.map((classItem, index) => (
              <div key={index} className="class-card">
                <h3>{classItem.name}</h3>
                <p>{classItem.description}</p>
                <div className="class-details">
                  <span>{classItem.duration}</span>
                  <span>{classItem.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="schedule-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>View our class schedule or book your first session today!</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary">View Schedule</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;