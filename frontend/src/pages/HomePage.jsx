import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Membership from '../components/Membership';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Hero />
      <Features />
      <Membership />
      <Testimonials />
      <CTA />
    </div>
  );
};

export default HomePage;