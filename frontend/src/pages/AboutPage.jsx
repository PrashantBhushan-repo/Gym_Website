import React from 'react';
import './AboutPage.css';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>About <span>FitZone</span></h1>
          <p>Where fitness meets community and transformation begins</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our <span>Story</span></h2>
              <p>
                Founded in 2015, FitZone began with a simple vision: to create a fitness facility
                that goes beyond just equipment and workouts. We wanted to build a community where
                everyone, regardless of their fitness level, feels welcome and empowered to achieve
                their health goals.
              </p>
              <p>
                What started as a small 3,000 sq ft gym has grown into a 25,000 sq ft state-of-the-art
                fitness center, serving over 5,000 active members. Our success comes from our unwavering
                commitment to providing exceptional service, cutting-edge equipment, and a supportive
                environment that motivates our members to push their limits.
              </p>
              <p>
                Today, FitZone stands as a testament to what can be achieved when passion meets purpose.
                We're not just a gym – we're a movement, inspiring thousands to live healthier, stronger,
                and more confident lives.
              </p>
            </div>
            <div className="about-image">
              <div className="image-placeholder">Our Facility</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <h3>Our Mission</h3>
              <p>
                To provide an inclusive, motivating, and results-driven fitness environment where
                every member can achieve their personal health and wellness goals through expert
                guidance, premium facilities, and unwavering support.
              </p>
            </div>
            <div className="mv-card">
              <h3>Our Vision</h3>
              <p>
                To be the leading fitness destination that transforms lives by making health and
                wellness accessible, enjoyable, and sustainable for our entire community, while
                setting new standards in the fitness industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="values">
        <div className="container">
          <h2 className="section-title">
            Our Core <span>Values</span>
          </h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Excellence</h3>
              <p>
                We strive for excellence in everything we do, from our equipment maintenance to our
                customer service
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community</h3>
              <p>
                We foster a supportive community where members encourage and inspire each other
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Innovation</h3>
              <p>
                We continuously evolve with the latest fitness trends and technology to provide
                the best experience
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Integrity</h3>
              <p>
                We operate with honesty, transparency, and always put our members' best interests first
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;