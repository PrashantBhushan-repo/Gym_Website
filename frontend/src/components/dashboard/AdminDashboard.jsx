import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';

const AdminDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/admin', {
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
        <div className="action-buttons">
          <button className="action-btn">+ Add Trainer</button>
          <button className="action-btn">+ Create Class</button>
          <button className="action-btn">+ View Reports</button>
          <button className="action-btn">+ Manage Memberships</button>
          <button className="action-btn">+ Settings</button>
        </div>
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
