import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import './ShopPage.css';

const loadCart = () => {
  const saved = localStorage.getItem('gymShopCart');
  return saved ? JSON.parse(saved) : [];
};

const CartPage = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(loadCart());
  const [formData, setFormData] = useState({
    customerName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    shippingZone: 'regional'
  });
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('gymShopCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.displayName || prev.customerName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shippingRates = {
    local: { label: 'Local (3 days)', fee: 150, days: 3 },
    regional: { label: 'Regional (7 days)', fee: 250, days: 7 },
    national: { label: 'National (10 days)', fee: 350, days: 10 }
  };

  const shippingInfo = shippingRates[formData.shippingZone] || shippingRates.regional;
  const total = subtotal + shippingInfo.fee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      setMessage({ type: 'error', text: 'Your cart is empty. Add products before checking out.' });
      return;
    }

    if (!formData.customerName || !formData.email || !formData.address) {
      setMessage({ type: 'error', text: 'Please complete your name, email, and shipping address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(apiUrl('/shop/order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          shippingZone: formData.shippingZone,
          items: cart,
          subtotal,
          shippingFee: shippingInfo.fee,
          total
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: `Order confirmed! Order ID: ${data.orderId}. Delivery in ${data.estimatedDeliveryDays} days.`,
          orderDetails: data.orderDetails
        });
        setCart([]);
        localStorage.removeItem('gymShopCart');
      } else {
        setMessage({ type: 'error', text: data.message || 'Could not place your order. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Order submission failed. Please refresh and try again.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="shop-page">
      <div className="shop-intro">
        <div>
          <h2>Your Cart</h2>
          <p>Review your gym product selections and complete the checkout form.</p>
        </div>
        <Link to="/shop" className="btn btn-secondary shop-back-link">
          Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price} × {item.quantity}</p>
                </div>
                <div className="cart-item-actions">
                  <button type="button" onClick={() => handleQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>₹{shippingInfo.fee}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>
              <label>
                Shipping Address
                <textarea
                  name="address"
                  rows="4"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Delivery Option
                <select
                  name="shippingZone"
                  value={formData.shippingZone}
                  onChange={handleChange}
                >
                  {Object.entries(shippingRates).map(([key, option]) => (
                    <option value={key} key={key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {message && (
        <div className={`shop-message ${message.type}`}>
          <div>{message.text}</div>
          {message.orderDetails && (
            <div className="order-details" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>Order Summary:</h4>
              <p><strong>Order ID:</strong> {message.orderDetails.orderId}</p>
              <p><strong>Customer:</strong> {message.orderDetails.customerName}</p>
              <p><strong>Email:</strong> {message.orderDetails.email}</p>
              <p><strong>Total Amount:</strong> ₹{message.orderDetails.total}</p>
              <p><strong>Estimated Delivery:</strong> {message.orderDetails.estimatedDeliveryDays} days</p>
              <h5>Items Ordered:</h5>
              <ul>
                {message.orderDetails.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '3px' }}>
                <p style={{ margin: 0, color: '#856404' }}>
                  <strong>Note:</strong> Email confirmation may be delayed or go to spam. Please save this order ID for reference.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
