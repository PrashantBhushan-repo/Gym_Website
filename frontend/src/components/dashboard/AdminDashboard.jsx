import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';
import '../styles/dashboard.css';

const AdminDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'trainer'
  });
  const [classData, setClassData] = useState({
    name: '',
    description: '',
    time: '',
    capacity: ''
  });
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/admin/add-user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        setActionMessage(`✓ ${formData.role} added successfully!`);
        setFormData({ displayName: '', email: '', password: '', role: 'trainer' });
        setShowAddTrainer(false);
        setShowAddMember(false);
      } else {
        setActionMessage(`✗ Error: ${result.message}`);
      }
    } catch (err) {
      setActionMessage(`✗ Error: ${err.message}`);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/admin/add-class'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      });
      const result = await response.json();
      if (response.ok) {
        setActionMessage('✓ Class created successfully!');
        setClassData({ name: '', description: '', time: '', capacity: '' });
        setShowAddClass(false);
      } else {
        setActionMessage(`✗ Error: ${result.message}`);
      }
    } catch (err) {
      setActionMessage(`✗ Error: ${err.message}`);
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

      {/* Recent Signups */}
      <div className="dashboard-section">
        <h2>Recent Signups</h2>
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

      {/* Contact Form Submissions */}
      <div className="dashboard-section">
        <h2>Recent Contact Form Submissions</h2>
        {dashboardData?.recentContacts && dashboardData.recentContacts.length > 0 ? (
          <div className="contacts-list">
            {dashboardData.recentContacts.map((contact) => (
              <div key={contact._id} className="contact-card">
                <div className="contact-header">
                  <h4>
                    {contact.firstName} {contact.lastName}
                  </h4>
                  <span className="contact-date">
                    {new Date(contact.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="contact-email">Email: {contact.email}</p>
                {contact.phone && <p className="contact-phone">Phone: {contact.phone}</p>}
                {contact.interest && <p className="contact-interest">Interest: {contact.interest}</p>}
                <p className="contact-message">{contact.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No contact submissions.</p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="dashboard-section">
        <h2>Admin Actions</h2>
        {actionMessage && (
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            borderRadius: '8px',
            background: actionMessage.includes('✓') ? '#d4edda' : '#f8d7da',
            color: actionMessage.includes('✓') ? '#155724' : '#721c24',
            border: `1px solid ${actionMessage.includes('✓') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {actionMessage}
          </div>
        )}
        
        <div className="admin-actions">
          <button 
            className="action-button"
            onClick={() => setShowAddTrainer(!showAddTrainer)}
          >
            <span className="action-button-icon">➕</span>
            Add Trainer
          </button>
          <button 
            className="action-button"
            onClick={() => setShowAddMember(!showAddMember)}
          >
            <span className="action-button-icon">👥</span>
            Add Member
          </button>
          <button 
            className="action-button"
            onClick={() => setShowAddClass(!showAddClass)}
          >
            <span className="action-button-icon">📅</span>
            Create Class
          </button>
          <button 
            className="action-button"
            onClick={() => alert('Reports feature coming soon!')}
          >
            <span className="action-button-icon">📊</span>
            View Reports
          </button>
        </div>

        {/* Add Trainer Form */}
        {showAddTrainer && (
          <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Add New Trainer</h3>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Name"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="trainer">Trainer</option>
                <option value="member">Member</option>
              </select>
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add {formData.role}
              </button>
            </form>
          </div>
        )}

        {/* Add Member Form */}
        {showAddMember && (
          <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Add New Member</h3>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Name"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="hidden"
                value="member"
                onChange={(e) => setFormData({...formData, role: 'member'})}
              />
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add Member
              </button>
            </form>
          </div>
        )}

        {/* Add Class Form */}
        {showAddClass && (
          <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Create New Class</h3>
            <form onSubmit={handleAddClass} style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Class Name"
                value={classData.name}
                onChange={(e) => setClassData({...classData, name: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <textarea
                placeholder="Description"
                value={classData.description}
                onChange={(e) => setClassData({...classData, description: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
                required
              />
              <input
                type="time"
                value={classData.time}
                onChange={(e) => setClassData({...classData, time: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={classData.capacity}
                onChange={(e) => setClassData({...classData, capacity: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Create Class
              </button>
            </form>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="dashboard-section">
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
