import React from 'react';
import { Link } from 'react-router-dom';
import './Membership.css';
import './Membership.css';

const Membership = () => {
  const plans = [
    {
      name: 'Basic',
      price: '₹2,900',
      period: '/month',
      features: [
        '✓ Gym Access',
        '✓ Basic Equipment',
        '✓ Locker Room',
        '✗ Classes',
        '✗ Personal Training'
      ],
      buttonClass: 'btn-outline'
    },
    {
      name: 'Premium',
      price: '₹5,900',
      period: '/month',
      features: [
        '✓ 24/7 Gym Access',
        '✓ All Equipment',
        '✓ Unlimited Classes',
        '✓ 1 PT Session/month',
        '✓ Pool & Sauna'
      ],
      buttonClass: 'btn-primary',
      featured: true
    },
    {
      name: 'Elite',
      price: '₹9,900',
      period: '/month',
      features: [
        '✓ All Premium Benefits',
        '✓ 4 PT Sessions/month',
        '✓ Nutrition Plan',
        '✓ Priority Booking',
        '✓ Guest Passes'
      ],
      buttonClass: 'btn-outline'
    }
  ];

  return (
    <section className="membership">
      <div className="container">
        <h2 className="section-title">
          Membership <span>Plans</span>
        </h2>
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                {plan.price}<span>{plan.period}</span>
              </div>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <Link to={`/membership/checkout?plan=${plan.name}`} className={`btn ${plan.buttonClass}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Membership;