import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MemberDashboard from '../components/dashboard/MemberDashboard';
import TrainerDashboard from '../components/dashboard/TrainerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    if (user && user.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboard = () => {
    switch (activeRole) {
      case 'member':
        return <MemberDashboard user={user} />;
      case 'trainer':
        return <TrainerDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <div className="dashboard-error">Invalid role</div>;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.displayName}</h1>
          <p className="dashboard-role">Role: {activeRole?.toUpperCase()}</p>
        </div>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;
