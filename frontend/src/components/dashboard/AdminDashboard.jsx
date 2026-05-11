import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';
import '../styles/dashboard.css';

const AdminDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addUserRole, setAddUserRole] = useState('trainer');
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddGymCenter, setShowAddGymCenter] = useState(false); // NEW
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: ''
  });
  const [classData, setClassData] = useState({
    name: '',
    description: '',
    time: '',
    capacity: ''
  });
  const [gymCenterForm, setGymCenterForm] = useState({ // NEW
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    contactPerson: '',
    collaborationTerms: '',
    facilityDescription: ''
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [requestPassword, setRequestPassword] = useState({});
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [showSignups, setShowSignups] = useState(false);
  const [gymCenters, setGymCenters] = useState([]); // NEW
  const [gymCentersLoading, setGymCentersLoading] = useState(false); // NEW

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(apiUrl('/dashboard/admin'), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setPendingLoading(true);
    setPendingError(null);

    try {
      const response = await fetch(apiUrl('/admin/pending-requests'), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }

      const result = await response.json();
      setPendingRequests(result.pendingRequests || []);
    } catch (err) {
      setPendingError(err.message);
      console.error('Error fetching pending requests:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  // NEW: Fetch gym centers
  const fetchGymCenters = async () => {
    setGymCentersLoading(true);
    try {
      const response = await fetch(apiUrl('/admin/gym-centers'), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gym centers');
      }

      const result = await response.json();
      setGymCenters(result.gymCenters || []);
    } catch (err) {
      console.error('Error fetching gym centers:', err);
      setActionMessage({ type: 'error', text: 'Failed to fetch gym centers' });
    } finally {
      setGymCentersLoading(false);
    }
  };

  // NEW: Add new gym center
  const handleAddGymCenter = async (e) => {
    e.preventDefault();
    setActionMessage({ type: '', text: '' });
    
    // Validation
    if (!gymCenterForm.name || !gymCenterForm.address || !gymCenterForm.city || 
        !gymCenterForm.state || !gymCenterForm.postalCode || !gymCenterForm.latitude || 
        !gymCenterForm.longitude || !gymCenterForm.phone || !gymCenterForm.email || 
        !gymCenterForm.contactPerson || !gymCenterForm.collaborationTerms) {
      setActionMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const latitude = parseFloat(gymCenterForm.latitude);
      const longitude = parseFloat(gymCenterForm.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        setActionMessage({ type: 'error', text: 'Latitude and longitude must be valid numbers' });
        return;
      }

      const payload = {
        ...gymCenterForm,
        latitude,
        longitude
      };

      const response = await fetch(apiUrl('/admin/gym-centers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Gym center added successfully!' });
        setGymCenterForm({
          name: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          latitude: '',
          longitude: '',
          phone: '',
          email: '',
          contactPerson: '',
          collaborationTerms: '',
          facilityDescription: ''
        });
        setShowAddGymCenter(false);
        fetchGymCenters();
      } else {
        setActionMessage({ type: 'error', text: result.message || 'Unable to add gym center' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Internal server error' });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequests();
    fetchGymCenters(); // NEW
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setActionMessage({ type: '', text: '' });
    try {
      const userData = {
        displayName: formData.displayName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: addUserRole
      };

      const response = await fetch(apiUrl('/admin/add-user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      if (response.ok) {
        setActionMessage({ type: 'success', text: `${addUserRole.charAt(0).toUpperCase() + addUserRole.slice(1)} added successfully!` });
        setFormData({ displayName: '', email: '', password: '' });
        setAddUserRole('trainer');
        setShowAddTrainer(false);
        setShowAddMember(false);
        fetchDashboardData();
      } else {
        setActionMessage({ type: 'error', text: result.message || 'Unable to add user' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Internal server error' });
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setActionMessage({ type: '', text: '' });
    try {
      const response = await fetch(apiUrl('/admin/add-class'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      });
      const result = await response.json();
      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Class created successfully!' });
        setClassData({ name: '', description: '', time: '', capacity: '' });
        setShowAddClass(false);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        setActionMessage({ type: 'error', text: result.message || 'Unable to create class' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Internal server error' });
    }
  };

  const handleApproveRequest = async (requestId, requestType) => {
    setActionMessage({ type: '', text: '' });
    try {
      const endpoint = requestType === 'membership'
        ? `/admin/membership-requests/${requestId}/approve`
        : `/admin/approve-request/${requestId}`;
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: requestPassword[requestId] || '' })
      });
      const result = await response.json();
      if (response.ok) {
        const passwordMessage = result.generatedPassword ? ` Generated password: ${result.generatedPassword}` : '';
        setActionMessage({ type: 'success', text: `${result.message || 'Request approved successfully'}.${passwordMessage}` });
        setRequestPassword((prev) => ({ ...prev, [requestId]: '' }));
        fetchDashboardData();
        fetchPendingRequests();
      } else {
        setActionMessage({ type: 'error', text: result.message || 'Unable to approve request' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Internal server error' });
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionMessage({ type: '', text: '' });
    try {
      const response = await fetch(apiUrl(`/admin/reject-request/${requestId}`), {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Request rejected successfully.' });
        fetchDashboardData();
        fetchPendingRequests();
      } else {
        setActionMessage({ type: 'error', text: result.message || 'Unable to reject request' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Internal server error' });
    }
  };

  if (loading) {
    return <div className="dashboard-loading-card">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error-card">Error: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Key Metrics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Members</h3>
          <p className="stat-value">{dashboardData?.totalMembers || 0}</p>
          <p className="stat-detail">Active members</p>
        </div>

        <div className="stat-card">
          <h3>Total Trainers</h3>
          <p className="stat-value">{dashboardData?.totalTrainers || 0}</p>
          <p className="stat-detail">Staff</p>
        </div>

        <div className="stat-card">
          <h3>Active Memberships</h3>
          <p className="stat-value">{dashboardData?.activeMemberships || 0}</p>
          <p className="stat-detail">Current plans</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}</p>
          <p className="stat-detail">All-time</p>
        </div>

        <div className="stat-card">
          <h3>Classes</h3>
          <p className="stat-value">{dashboardData?.totalClasses || 0}</p>
          <p className="stat-detail">Active classes</p>
        </div>
      </div>

      {/* Membership Distribution */}
      <div className="dashboard-section">
        <h2>Membership Distribution</h2>
        {dashboardData?.membershipStats && dashboardData.membershipStats.length > 0 ? (
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.membershipStats.map((stat) => {
                  const total = dashboardData.activeMemberships;
                  const percentage = ((stat.count / total) * 100).toFixed(1);
                  return (
                    <tr key={stat._id}>
                      <td>{stat._id}</td>
                      <td>{stat.count}</td>
                      <td>{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No membership data available.</p>
        )}
      </div>

      {/* Recent Signups - Collapsible */}
      <div className="dashboard-section">
        <button
          className="collapsible-header"
          onClick={() => setShowSignups(!showSignups)}
        >
          <div className="collapsible-title">
            <span className="collapsible-icon">{showSignups ? '▼' : '▶'}</span>
            <h2>Recent Signups</h2>
            <span className="signup-count-badge">{dashboardData?.recentSignups?.length || 0}</span>
          </div>
        </button>

        {showSignups && (
          <div className="collapsible-content">
            {dashboardData?.recentSignups && dashboardData.recentSignups.length > 0 ? (
              <div className="signups-list">
                {dashboardData.recentSignups.map((signup) => (
                  <div key={signup._id} className="signup-card">
                    <div className="signup-header">
                      <h4>{signup.displayName}</h4>
                      <span className="signup-date">
                        {new Date(signup.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="signup-email">{signup.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent signups.</p>
            )}
          </div>
        )}
      </div>

      {/* Pending Member / Trainer Requests */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Pending Member / Trainer Requests</h2>
          <div className={`status-badge ${pendingRequests.length > 0 ? 'approved' : 'failed'}`}>
            {pendingRequests.length > 0 ? `${pendingRequests.length} pending` : 'No pending requests'}
          </div>
        </div>

        {pendingLoading ? (
          <p className="no-data">Loading pending requests...</p>
        ) : pendingError ? (
          <p className="no-data">Error: {pendingError}</p>
        ) : pendingRequests.length > 0 ? (
          <div className="contacts-list pending-requests-list">
            {pendingRequests.map((request) => (
              <div key={request._id} className="contact-card pending-request-card">
                <div className="contact-header">
                  <div>
                    <h4>{request.firstName} {request.lastName}</h4>
                    <span className="status-badge pending">{request.requestedRole}</span>
                  </div>
                  <span className="contact-date">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="contact-email">Email: {request.email}</p>
                {request.phone && <p className="contact-phone">Phone: {request.phone}</p>}
                {request.interest && <p className="contact-interest">Interest: {request.interest}</p>}
                {request.membershipPlan && <p className="contact-plan">Plan: {request.membershipPlan}</p>}
                {request.paymentId && <p className="contact-payment">Payment ID: {request.paymentId}</p>}
                {request.orderId && <p className="contact-payment">Order ID: {request.orderId}</p>}
                {request.requestCode && <p className="contact-payment">Request Code: {request.requestCode}</p>}
                {request.generatedPassword && <p className="contact-password">Generated Password: {request.generatedPassword}</p>}
                <p className="contact-message">{request.message}</p>

                <div className="action-buttons">
                  <div className="approve-group">
                    <input
                      type="password"
                      placeholder="Set password (optional)"
                      value={requestPassword[request._id] || ''}
                      onChange={(e) => setRequestPassword((prev) => ({ ...prev, [request._id]: e.target.value }))}
                    />
                    <button className="action-btn" type="button" onClick={() => handleApproveRequest(request._id, request.isMembershipRequest ? 'membership' : 'pending')}>
                      Approve
                    </button>
                  </div>
                  <button className="action-btn" type="button" onClick={() => handleRejectRequest(request._id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No pending member/trainer requests.</p>
        )}
      </div>

      

      {/* Admin Actions */}
      <div className="dashboard-section">
        <h2>Admin Actions</h2>
        {actionMessage.text && (
            <div className="action-message" style={{ 
              padding: '15px', 
              marginBottom: '20px', 
              borderRadius: '8px',
              background: actionMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: actionMessage.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${actionMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {actionMessage.text}
            </div>
          )}
          
          <div className="admin-actions">
            <div className="action-group">
              <button 
                className="action-button"
                onClick={() => {
                  setAddUserRole('trainer');
                  setShowAddTrainer(!showAddTrainer);
                  setShowAddMember(false);
                  setShowAddClass(false);
                }}
              >
                <span className="action-button-icon">➕</span>
                Add Trainer
              </button>
              {showAddTrainer && (
                <div className="action-dropdown">
                  <form onSubmit={handleAddUser} className="action-form">
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <input type="hidden" name="role" value="trainer" />
                    <button type="submit" className="form-submit-btn">Add Trainer</button>
                  </form>
                </div>
              )}
            </div>

            <div className="action-group">
              <button 
                className="action-button"
                onClick={() => {
                  setAddUserRole('member');
                  setShowAddMember(!showAddMember);
                  setShowAddTrainer(false);
                  setShowAddClass(false);
                }}
              >
                <span className="action-button-icon">👥</span>
                Add Member
              </button>
              {showAddMember && (
                <div className="action-dropdown">
                  <form onSubmit={handleAddUser} className="action-form">
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <input type="hidden" name="role" value="member" />
                    <button type="submit" className="form-submit-btn">Add Member</button>
                  </form>
                </div>
              )}
            </div>

            <div className="action-group">
              <button 
                className="action-button"
                onClick={() => {
                  setShowAddClass(!showAddClass);
                  setShowAddTrainer(false);
                  setShowAddMember(false);
                }}
              >
                <span className="action-button-icon">📅</span>
                Create Class
              </button>
              {showAddClass && (
                <div className="action-dropdown">
                  <form onSubmit={handleAddClass} className="action-form">
                    <input
                      type="text"
                      placeholder="Class Name"
                      value={classData.name}
                      onChange={(e) => setClassData({...classData, name: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={classData.description}
                      onChange={(e) => setClassData({...classData, description: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Schedule (e.g., Mon, Wed, Fri - 6:00 PM)"
                      value={classData.time}
                      onChange={(e) => setClassData({...classData, time: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={classData.capacity}
                      onChange={(e) => setClassData({...classData, capacity: e.target.value})}
                      required
                    />
                    <button type="submit" className="form-submit-btn">Create Class</button>
                  </form>
                </div>
              )}
            </div>

            <div className="action-group">
              <button 
                className="action-button"
                onClick={() => alert('Reports feature coming soon!')}
              >
                <span className="action-button-icon">📊</span>
                View Reports
              </button>
            </div>

            <div className="action-group">
              <button 
                className="action-button"
                onClick={() => {
                  setShowAddGymCenter(!showAddGymCenter);
                  setShowAddTrainer(false);
                  setShowAddMember(false);
                  setShowAddClass(false);
                }}
              >
                <span className="action-button-icon">🏋️</span>
                Add Gym Center
              </button>
              {showAddGymCenter && (
                <div className="action-dropdown">
                  <form onSubmit={handleAddGymCenter} className="action-form">
                    <input
                      type="text"
                      placeholder="Gym Center Name*"
                      value={gymCenterForm.name}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, name: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address*"
                      value={gymCenterForm.address}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, address: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="City*"
                      value={gymCenterForm.city}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, city: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State*"
                      value={gymCenterForm.state}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, state: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal Code*"
                      value={gymCenterForm.postalCode}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, postalCode: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Latitude*"
                      value={gymCenterForm.latitude}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, latitude: e.target.value})}
                      step="0.0001"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Longitude*"
                      value={gymCenterForm.longitude}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, longitude: e.target.value})}
                      step="0.0001"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone*"
                      value={gymCenterForm.phone}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, phone: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email*"
                      value={gymCenterForm.email}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, email: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact Person*"
                      value={gymCenterForm.contactPerson}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, contactPerson: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Collaboration Terms*"
                      value={gymCenterForm.collaborationTerms}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, collaborationTerms: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Facility Description"
                      value={gymCenterForm.facilityDescription}
                      onChange={(e) => setGymCenterForm({...gymCenterForm, facilityDescription: e.target.value})}
                    />
                    <button type="submit" className="form-submit-btn">Add Gym Center</button>
                  </form>
                </div>
              )}
            </div>
          </div>

        {/* NEW: Collaborated Gym Centers Section */}
        <div style={{marginTop: '2rem'}}>
          <h2>Collaborated Gym Centers</h2>
          {gymCentersLoading ? (
            <p className="no-data">Loading gym centers...</p>
          ) : gymCenters.length > 0 ? (
            <div className="contacts-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
              {gymCenters.map((gym) => (
                <div key={gym._id} className="contact-card" style={{padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                  <h4 style={{marginBottom: '0.5rem'}}>{gym.name}</h4>
                  <p><strong>City:</strong> {gym.city}, {gym.state}</p>
                  <p><strong>Address:</strong> {gym.address}</p>
                  <p><strong>Phone:</strong> {gym.phone}</p>
                  <p><strong>Contact Person:</strong> {gym.contactPerson}</p>
                  <p><strong>Email:</strong> {gym.email}</p>
                  <p><strong>Coordinates:</strong> {gym.latitude}, {gym.longitude}</p>
                  <p style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem'}}><strong>Facilities:</strong> {gym.facilityDescription || 'Not specified'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No gym centers added yet. Add one to get started!</p>
          )}
        </div>

        <h2>System Information</h2>
        <div className="system-info">
          <p>
            <strong>Total Users:</strong> {(dashboardData?.totalMembers || 0) + (dashboardData?.totalTrainers || 0)}
          </p>
          <p>
            <strong>Membership Rate:</strong>{' '}
            {dashboardData?.totalMembers
              ? (((dashboardData.activeMemberships / dashboardData.totalMembers) * 100).toFixed(1) + '%')
              : 'N/A'}
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
