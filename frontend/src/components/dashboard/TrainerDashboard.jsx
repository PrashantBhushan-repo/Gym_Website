import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';
import '../styles/dashboard.css';

const TrainerDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(apiUrl('/dashboard/trainer'), {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trainer dashboard:', err);
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
    <div className="trainer-dashboard">
      {/* Quick Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Clients</h3>
          <p className="stat-value">{dashboardData?.totalClients || 0}</p>
          <p className="stat-detail">Active clients</p>
        </div>

        <div className="stat-card">
          <h3>Classes Teaching</h3>
          <p className="stat-value">{dashboardData?.assignedClasses?.length || 0}</p>
          <p className="stat-detail">Group classes</p>
        </div>

        <div className="stat-card">
          <h3>Active Workouts</h3>
          <p className="stat-value">{dashboardData?.assignedWorkouts?.length || 0}</p>
          <p className="stat-detail">Client programs</p>
        </div>

        <div className="stat-card">
          <h3>Client Updates</h3>
          <p className="stat-value">{dashboardData?.clientProgress?.length || 0}</p>
          <p className="stat-detail">Progress records</p>
        </div>
      </div>

      {/* Classes Section */}
      <div className="dashboard-section">
        <h2>Your Classes</h2>
        {dashboardData?.assignedClasses && dashboardData.assignedClasses.length > 0 ? (
          <div className="classes-list">
            {dashboardData.assignedClasses.map((cls) => (
              <div key={cls._id} className="class-card">
                <div className="class-header">
                  <h4>{cls.className}</h4>
                  <span className="class-badge">{cls.enrolledMembers.length} members</span>
                </div>
                <p className="class-schedule">{cls.schedule}</p>
                <p className="class-description">{cls.description || 'No description'}</p>
                <div className="class-members">
                  <p className="members-label">Enrolled Members:</p>
                  <ul>
                    {cls.enrolledMembers && cls.enrolledMembers.length > 0 ? (
                      cls.enrolledMembers.map((member) => (
                        <li key={member._id}>
                          {member.displayName} ({member.email})
                        </li>
                      ))
                    ) : (
                      <li>No members enrolled</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No classes assigned. Contact admin!</p>
        )}
      </div>

      {/* Workouts Section */}
      <div className="dashboard-section">
        <h2>Client Workouts</h2>
        {dashboardData?.assignedWorkouts && dashboardData.assignedWorkouts.length > 0 ? (
          <div className="workouts-list">
            {dashboardData.assignedWorkouts.map((workout) => (
              <div key={workout._id} className="workout-card">
                <div className="workout-header">
                  <h4>{workout.workoutName}</h4>
                  <span className="client-name">{workout.clientID?.displayName}</span>
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
          <p className="no-data">No workouts assigned yet.</p>
        )}
      </div>

      {/* Client Progress Section */}
      <div className="dashboard-section">
        <h2>Client Progress Updates</h2>
        {dashboardData?.clientProgress && dashboardData.clientProgress.length > 0 ? (
          <div className="progress-list">
            {dashboardData.clientProgress.slice(0, 10).map((prog) => (
              <div key={prog._id} className="progress-card">
                <div className="progress-header">
                  <p className="progress-date">{new Date(prog.recordedDate).toLocaleDateString()}</p>
                  <p className="client-info">Client: {prog.clientID?.displayName}</p>
                </div>
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
          <p className="no-data">No progress records yet.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn">+ Assign Workout</button>
          <button className="action-btn">+ Update Progress</button>
          <button className="action-btn">+ Message Clients</button>
          <button className="action-btn">View Class Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
