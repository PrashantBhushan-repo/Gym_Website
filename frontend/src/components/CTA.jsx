import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';
import './CTA.css';

const CTA = () => {
  return (
    <section className="cta">
      <div className="container">
        <h2>Ready to Transform Your Life?</h2>
        <p>Get your free day pass and experience FitZone today!</p>
        <Link to="/contact" className="btn btn-primary btn-large">
          Claim Free Pass
        </Link>
      </div>
    </section>
  );
};

export default CTA;