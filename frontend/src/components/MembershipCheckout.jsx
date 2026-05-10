import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const plans = [
  { name: 'Basic', amount: 2900, label: '₹2,900 / month', description: 'Gym access, locker room, basic equipment' },
  { name: 'Premium', amount: 5900, label: '₹5,900 / month', description: 'Unlimited classes, 1 PT session, pool access' },
  { name: 'Elite', amount: 9900, label: '₹9,900 / month', description: 'Nutrition plan, 4 PT sessions, priority booking' }
];

const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay SDK not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

const MembershipCheckout = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [paymentData, setPaymentData] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [requestCode, setRequestCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      const matchedPlan = plans.find((item) => item.name === plan);
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
      }
    }
  }, [searchParams]);

  const createOrder = async () => {
    setIsCreatingOrder(true);
    setStatusMessage('Creating payment order...');

    try {
      const response = await fetch(apiUrl('/razorpay/order'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName: selectedPlan.name })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not create payment order');
      }

      return { order: result.order, keyId: result.keyId };
    } catch (error) {
      setStatusMessage(error.message);
      console.error('Order creation error:', error);
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setStatusMessage('You must be signed in to continue.');
      return;
    }

    const order = await createOrder();
    if (!order) {
      return;
    }

    try {
      const Razorpay = await loadRazorpay();
      const options = {
        key: order.keyId,
        amount: order.order.amount,
        currency: order.order.currency,
        name: 'FitZone Gym Membership',
        description: `${selectedPlan.name} Plan Membership Payment`,
        order_id: order.order.id,
        handler: async function (response) {
          const generated = `P@ss-${Math.random().toString(36).slice(2, 10)}${Date.now().toString().slice(-4)}`;
          const requestCodeValue = `REQ-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
          setGeneratedPassword(generated);
          setRequestCode(requestCodeValue);
          setStatusMessage('Payment successful! Please copy the details below and paste them into the contact form.');
          setPaymentData(response);
        },
        prefill: {
          name: user.displayName || user.email,
          email: user.email
        },
        theme: {
          color: '#2d89f0'
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      setStatusMessage('Could not load payment gateway. Please try again later.');
      console.error('Razorpay load error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="membership-checkout-page">
      <div className="membership-checkout-header">
        <h1>Membership Checkout</h1>
        <p>Select a plan, pay securely, and submit your membership request for admin approval.</p>
      </div>

      <div className="membership-plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`membership-plan-card ${selectedPlan.name === plan.name ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3>{plan.name}</h3>
            <p className="plan-price">{plan.label}</p>
            <p>{plan.description}</p>
            {selectedPlan.name === plan.name && <span className="selected-tag">Selected</span>}
          </div>
        ))}
      </div>

      <div className="membership-checkout-action">
        <button className="btn btn-primary" onClick={handlePayment} disabled={isCreatingOrder || !!paymentData}>
          {paymentData ? 'Payment Completed' : `Pay ₹${selectedPlan.amount}`}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>

      {paymentData && (
        <div className="membership-payment-summary">
          <h2>Copy these details to the contact form</h2>
          <div className="summary-grid">
            <div>
              <strong>Plan</strong>
              <p>{selectedPlan.name}</p>
            </div>
            <div>
              <strong>Amount</strong>
              <p>₹{selectedPlan.amount}</p>
            </div>
            <div>
              <strong>Payment ID</strong>
              <p>{paymentData.razorpay_payment_id}</p>
            </div>
            <div>
              <strong>Order ID</strong>
              <p>{paymentData.razorpay_order_id}</p>
            </div>
            <div>
              <strong>Request Code</strong>
              <p>{requestCode}</p>
            </div>
            <div>
              <strong>Generated Password</strong>
              <p>{generatedPassword}</p>
            </div>
          </div>
          <p className="checkout-note">
            Use these details on the Contact page. Admin will verify the payment and approve your membership.
          </p>
        </div>
      )}
    </div>
  );
};

export default MembershipCheckout;
