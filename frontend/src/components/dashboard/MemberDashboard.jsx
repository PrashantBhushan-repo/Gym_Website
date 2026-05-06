import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';

const MemberDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/dashboard/member`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching member dashboard:', err);
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

  const daysUntilRenewal = dashboardData?.membership
    ? Math.ceil(
        (new Date(dashboardData.membership.renewalDate) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="member-dashboard">
      {/* Quick Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Membership Status</h3>
          <p className="stat-value">{dashboardData?.membership?.planName || 'Not Active'}</p>
          <p className="stat-detail">
            {daysUntilRenewal ? `Renews in ${daysUntilRenewal} days` : 'No active membership'}
          </p>
        </div>

        <div className="stat-card">
          <h3>Classes Enrolled</h3>
          <p className="stat-value">{dashboardData?.enrolledClasses?.length || 0}</p>
          <p className="stat-detail">Active classes</p>
        </div>

        <div className="stat-card">
          <h3>Recent Weight</h3>
          <p className="stat-value">
            {dashboardData?.progress?.[0]?.weight || '--'}
            {dashboardData?.progress?.[0]?.weight ? ' lbs' : ''}
          </p>
          <p className="stat-detail">Latest measurement</p>
        </div>

        <div className="stat-card">
          <h3>Total Paid</h3>
          <p className="stat-value">
            ${
              dashboardData?.payments?.reduce((sum, p) => (p.status === 'completed' ? sum + p.amount : sum), 0).toFixed(2) ||
              '0.00'
            }
          </p>
          <p className="stat-detail">All-time payments</p>
        </div>
      </div>

      {/* Workouts Section */}
      <div className="dashboard-section">
        <h2>Your Workout Plans</h2>
        {dashboardData?.workouts && dashboardData.workouts.length > 0 ? (
          <div className="workouts-list">
            {dashboardData.workouts.map((workout) => (
              <div key={workout._id} className="workout-card">
                <div className="workout-header">
                  <h4>{workout.workoutName}</h4>
                  <span className="workout-duration">{workout.duration} min</span>
                </div>
                <div className="exercises">
                  {workout.exercises && workout.exercises.length > 0 ? (
                    <ul>
                      {workout.exercises.map((ex, idx) => (
                        <li key={idx}>
                          {ex.name} - {ex.sets} sets × {ex.reps} reps{ex.weight ? ` (${ex.weight})` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No exercises assigned</p>
                  )}
                </div>
                <p className="assigned-date">
                  Assigned: {new Date(workout.assignedDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No workouts assigned yet. Contact your trainer!</p>
        )}
      </div>

      {/* Classes Section */}
      <div className="dashboard-section">
        <h2>Your Classes</h2>
        {dashboardData?.enrolledClasses && dashboardData.enrolledClasses.length > 0 ? (
          <div className="classes-list">
            {dashboardData.enrolledClasses.map((cls) => (
              <div key={cls._id} className="class-card">
                <h4>{cls.className}</h4>
                <p className="class-schedule">{cls.schedule}</p>
                <p className="class-capacity">
                  Capacity: {cls.enrolledMembers.length}/{cls.capacity}
                </p>
                {cls.description && <p className="class-description">{cls.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No classes enrolled. Browse available classes!</p>
        )}
      </div>

      {/* Progress Tracking */}
      <div className="dashboard-section">
        <h2>Your Progress</h2>
        {dashboardData?.progress && dashboardData.progress.length > 0 ? (
          <div className="progress-list">
            {dashboardData.progress.slice(0, 5).map((prog) => (
              <div key={prog._id} className="progress-card">
                <p className="progress-date">{new Date(prog.recordedDate).toLocaleDateString()}</p>
                <div className="progress-details">
                  {prog.weight && <span>Weight: {prog.weight} lbs</span>}
                  {prog.bodyFat && <span>Body Fat: {prog.bodyFat}%</span>}
                  {prog.muscleGain && <span>Muscle Gain: {prog.muscleGain} lbs</span>}
                  {prog.strength && <span>{prog.strength}</span>}
                </div>
                {prog.notes && <p className="progress-notes">{prog.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No progress records yet. Start tracking!</p>
        )}
      </div>

      {/* Payment History */}
      <div className="dashboard-section">
        <h2>Payment History</h2>
        {dashboardData?.payments && dashboardData.payments.length > 0 ? (
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>${payment.amount.toFixed(2)}</td>
                    <td>{payment.method.replace('_', ' ')}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>{payment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No payment history available.</p>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
