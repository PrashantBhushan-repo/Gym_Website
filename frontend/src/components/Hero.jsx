import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          UNLEASH YOUR <span>POTENTIAL</span>
        </h1>
        <p className="hero-subtitle">
          Join the ultimate fitness experience with state-of-the-art equipment,
          expert trainers, and a community that inspires greatness.
        </p>
        <div className="hero-buttons">
          <Link to="/contact" className="btn btn-primary">Start Your Journey</Link>
          <Link to="/services" className="btn btn-secondary">View Classes</Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <h3>5000+</h3>
          <p>Active Members</p>
        </div>
        <div className="stat">
          <h3>50+</h3>
          <p>Expert Trainers</p>
        </div>
        <div className="stat">
          <h3>100+</h3>
          <p>Classes/Week</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;