import React, { useState } from 'react';
import { apiUrl } from '../config/api';

const MembershipRequestForm = ({ planName, amount, paymentData, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(apiUrl('/membership/request'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planName,
          amount,
          phone,
          message,
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          signature: paymentData.razorpay_signature
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Could not submit membership request');
      }

      setSuccess(result.message || 'Membership request submitted successfully.');
      setPhone('');
      setMessage('');
      if (onSuccess) onSuccess(result);
    } catch (submitError) {
      setError(submitError.message);
      console.error('Membership request error:', submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="membership-checkout-form">
      <h2>Confirm Your Membership Request</h2>
      <p>
        Plan: <strong>{planName}</strong>
      </p>
      <p>
        Amount: <strong>₹{amount}</strong>
      </p>
      <p>Payment received successfully. Enter a phone number and any notes for admin review.</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message for admin (optional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share any details for membership approval"
            rows="4"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Membership Request'}
        </button>
      </form>
    </div>
  );
};

export default MembershipRequestForm;
