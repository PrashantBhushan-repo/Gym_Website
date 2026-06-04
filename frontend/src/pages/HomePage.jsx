import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Membership from '../components/Membership';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import './HomePage.css';
import usePageKnowledge from '../hooks/usePageKnowledge';

const HomePage = () => {
  usePageKnowledge({
    slug: 'home',
    title: 'FitZone Home',
    category: 'home',
    tags: ['home', 'gym', 'fitness', 'membership'],
    content: `FitZone home page highlights the gym's core benefits, featured services, membership offerings, member testimonials, and call-to-action sections. It positions the gym as a supportive community-driven fitness destination and invites visitors to explore training options, book memberships, and join the FitZone health journey.`
  });
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