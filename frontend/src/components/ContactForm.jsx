import React, { useState } from 'react';
import { apiUrl } from '../config/api';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
    requestedRole: '',
    membershipPlan: '',
    paymentId: '',
    orderId: '',
    generatedPassword: '',
    requestCode: '',
    membershipAmount: '',
    userLocationAddress: '', // NEW: User's location address
    preferredGymCenter: '' // NEW: Selected gym center
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [allGyms, setAllGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [showGymDropdown, setShowGymDropdown] = useState(false);

  // Fetch all collaborated gym centers on component mount
  React.useEffect(() => {
    fetchAllGyms();
  }, []);

  const fetchAllGyms = async () => {
    try {
      const response = await fetch(apiUrl('/gym-centers'));
      const data = await response.json();
      if (data.success) {
        setAllGyms(data.gymCenters || []);
      }
    } catch (error) {
      console.error('Error fetching gym centers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'membershipAmount' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // NEW: Function to get coordinates from address using geocoding API (fallback for demo)
  const getCoordinatesFromAddress = async (address) => {
    try {
      // Note: This uses a simple fallback for demo. For production, use proper geocoding API
      // You can integrate with Google Maps Geocoding API or similar services
      
      // For demo purposes, return dummy coordinates near Nagpur (Fitzone main center)
      // In production, replace with actual geocoding
      console.log('Demo: Using fallback coordinates for address:', address);
      
      // Nagpur center coordinates (you can replace with actual geocoding)
      return {
        latitude: 21.1458,
        longitude: 79.0882,
        message: 'Using approximate location. For precise location, please enter coordinates or use a proper mapping service.'
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  // NEW: Function to find nearby gyms
  const findNearbyGyms = async () => {
    if (!formData.userLocationAddress.trim()) {
      showNotification('Please enter your location address', 'error');
      return;
    }

    setLoadingGyms(true);
    try {
      const coords = await getCoordinatesFromAddress(formData.userLocationAddress);
      
      if (!coords) {
        showNotification('Could not determine coordinates from address', 'error');
        setLoadingGyms(false);
        return;
      }

      const response = await fetch(apiUrl('/gym-centers/nearby'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusKm: 15 // 15km radius
        })
      });

      const data = await response.json();
      if (data.success) {
        setNearbyGyms(data.nearbyGyms || []);
        setShowGymDropdown(true);
        if (data.nearbyGyms && data.nearbyGyms.length > 0) {
          showNotification(`Found ${data.nearbyGyms.length} nearby gym centers!`, 'success');
        } else {
          showNotification('No gym centers found within 15km radius', 'info');
        }
      } else {
        showNotification('Error finding nearby gyms', 'error');
      }
    } catch (error) {
      console.error('Error finding nearby gyms:', error);
      showNotification('Error finding nearby gyms', 'error');
    } finally {
      setLoadingGyms(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      showNotification('Please fill in all required fields!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address!', 'error');
      setIsSubmitting(false);
      return;
    }

    const hasMembershipInfo = formData.membershipPlan || formData.paymentId || formData.orderId || formData.generatedPassword || formData.requestCode;
    if (hasMembershipInfo) {
      if (!formData.membershipPlan || !formData.paymentId || !formData.orderId || !formData.generatedPassword || !formData.requestCode) {
        showNotification('Please fill in all membership payment fields if you are submitting a payment request.', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(apiUrl('/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          interest: '',
          message: '',
          requestedRole: '',
          userLocationAddress: '',
          preferredGymCenter: ''
        });
        setNearbyGyms([]);
        setShowGymDropdown(false);
      } else {
        showNotification(data.message || 'Error submitting form. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error submitting form. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="contact-form-section">
      <h2>Send Us a <span>Message</span></h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="interest">I'm interested in:</label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="membership">Gym Membership</option>
            <option value="personal-training">Personal Training</option>
            <option value="group-classes">Group Classes</option>
            <option value="nutrition">Nutrition Counseling</option>
            <option value="free-pass">Free Day Pass</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* NEW: Gym Location Selection Section */}
        <div className="form-group gym-location-section">
          <label>Preferred Gym Location</label>
          <p className="role-description">
            Enter your location address to find nearby FitZone collaborated gym centers.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userLocationAddress">Your Location Address</label>
              <input
                type="text"
                id="userLocationAddress"
                name="userLocationAddress"
                value={formData.userLocationAddress}
                onChange={handleChange}
                placeholder="e.g., 123 Main St, Nagpur"
              />
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button
                type="button"
                onClick={findNearbyGyms}
                disabled={loadingGyms}
                className="btn btn-secondary"
              >
                {loadingGyms ? 'Searching...' : 'Find Nearby Gyms'}
              </button>
            </div>
          </div>

          {/* Show nearby gyms dropdown if available */}
          {showGymDropdown && nearbyGyms.length > 0 && (
            <div className="form-group">
              <label htmlFor="preferredGymCenter">Nearby Gym Centers</label>
              <select
                id="preferredGymCenter"
                name="preferredGymCenter"
                value={formData.preferredGymCenter}
                onChange={handleChange}
              >
                <option value="">Select a gym center (optional)</option>
                {nearbyGyms.map(gym => (
                  <option key={gym._id} value={gym._id}>
                    {gym.name} - {gym.distance}km away ({gym.city})
                  </option>
                ))}
              </select>
              <p className="gym-info-text">
                {nearbyGyms.length} gym center{nearbyGyms.length !== 1 ? 's' : ''} found near your location
              </p>
            </div>
          )}

          {/* Show all gyms if no location search done */}
          {!showGymDropdown && allGyms.length > 0 && (
            <div className="form-group">
              <label htmlFor="preferredGymCenter">All Collaborated Gym Centers</label>
              <select
                id="preferredGymCenter"
                name="preferredGymCenter"
                value={formData.preferredGymCenter}
                onChange={handleChange}
              >
                <option value="">Select a gym center (optional)</option>
                {allGyms.map(gym => (
                  <option key={gym._id} value={gym._id}>
                    {gym.name} ({gym.city})
                  </option>
                ))}
              </select>
              <p className="gym-info-text">
                Enter your location above to see gyms near you
              </p>
            </div>
          )}
        </div>

        {/* Membership Payment Details Section */}
        <div className="form-group membership-payment-section">
          <label>Membership Payment Details (optional)</label>
          <p className="role-description">
            After completing payment, paste your plan, payment IDs, request code, and generated password below.
            Admin will use this information to verify your payment and approve your membership.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="membershipPlan">Membership Plan</label>
              <select
                id="membershipPlan"
                name="membershipPlan"
                value={formData.membershipPlan}
                onChange={(e) => {
                  const value = e.target.value;
                  const planPrices = { Basic: 2900, Premium: 5900, Elite: 9900 };
                  setFormData(prev => ({
                    ...prev,
                    membershipPlan: value,
                    membershipAmount: planPrices[value] || 0
                  }));
                }}
              >
                <option value="">Select membership plan</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="paymentId">Payment ID</label>
              <input
                type="text"
                id="paymentId"
                name="paymentId"
                value={formData.paymentId}
                onChange={handleChange}
                placeholder="e.g. rzp_test_xxx"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orderId">Order ID</label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="e.g. order_xxx"
              />
            </div>
            <div className="form-group">
              <label htmlFor="requestCode">Request Code</label>
              <input
                type="text"
                id="requestCode"
                name="requestCode"
                value={formData.requestCode}
                onChange={handleChange}
                placeholder="Unique code from checkout"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="generatedPassword">Generated Password</label>
              <input
                type="text"
                id="generatedPassword"
                name="generatedPassword"
                value={formData.generatedPassword}
                onChange={handleChange}
                placeholder="Enter the password you generated"
              />
            </div>
            <div className="form-group">
              <label htmlFor="membershipAmount">Amount Paid</label>
              <input
                type="number"
                id="membershipAmount"
                name="membershipAmount"
                value={formData.membershipAmount}
                onChange={handleChange}
                placeholder="Enter amount paid"
                min="0"
                step="50"
              />
            </div>
          </div>
        </div>

        {/* Role Request Section */}
        <div className="form-group role-request">
          <label>Request Account Access:</label>
          <p className="role-description">
            If you're interested in becoming a member or trainer, select your role below.
            Your request will be reviewed by our admin team.
          </p>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="requestedRole"
                value="member"
                checked={formData.requestedRole === 'member'}
                onChange={handleChange}
              />
              <span className="role-label">Member</span>
              <span className="role-description">Access to gym facilities and classes</span>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="requestedRole"
                value="trainer"
                checked={formData.requestedRole === 'trainer'}
                onChange={handleChange}
              />
              <span className="role-label">Trainer</span>
              <span className="role-description">Lead classes and train members</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="message">Message*</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ContactForm;
