import React from 'react';
import './Testimonials.css';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      text: "FitZone changed my life! Lost 30 pounds and gained confidence. The trainers are amazing!",
      author: "Sarah Johnson",
      role: "Member since 2023"
    },
    {
      text: "Best gym in town! Great equipment, friendly staff, and the group classes are incredibly motivating.",
      author: "Mike Chen",
      role: "Member since 2022"
    },
    {
      text: "The personal training program helped me achieve goals I never thought possible. Highly recommend!",
      author: "Emma Davis",
      role: "Member since 2023"
    }
  ];

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">
          Success <span>Stories</span>
        </h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p>"{testimonial.text}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;