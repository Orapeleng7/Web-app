import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import '../assets/css/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [doctorStats, setDoctorStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    suspendedDoctors: 0,
    totalSpecialties: 0
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleNavigation = (path) => {
    if (path !== currentPath) navigate(path);
  };

  useEffect(() => {
    const doctorsRef = collection(db, 'doctors');
    const unsubscribe = onSnapshot(query(doctorsRef), (snapshot) => {
      let total = 0;
      let active = 0;
      let suspended = 0;
      const specialtiesSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        if (data.status === 'active') active++;
        if (data.status === 'suspended') suspended++;
        if (data.specialty) specialtiesSet.add(data.specialty);
      });

      setDoctorStats({
        totalDoctors: total,
        activeDoctors: active,
        suspendedDoctors: suspended,
        totalSpecialties: specialtiesSet.size
      });
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">HealthMate</div>
        <ul className="navbar-links">
          {currentPath !== '/dashboard' && (
            <li>
              <button onClick={() => handleNavigation('/dashboard')} className="navbar-link">
                Dashboard
              </button>
            </li>
          )}
          {currentPath !== '/doctors' && (
            <li>
              <button onClick={() => handleNavigation('/doctors')} className="navbar-link">
                Manage Doctors
              </button>
            </li>
          )}
          {currentPath !== '/register-doctor' && (
            <li>
              <button onClick={() => handleNavigation('/register-doctor')} className="navbar-link">
                Add Doctor
              </button>
            </li>
          )}
          {currentPath !== '/reports' && (
            <li>
              <button onClick={() => handleNavigation('/reports')} className="navbar-link">
                Reports
              </button>
            </li>
          )}
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Header Section */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome to the Admin Dashboard</h1>
        <p className="dashboard-subtitle">Monitor and manage your healthcare platform effectively.</p>
      </header>

      {/* Statistics Section */}
      <div className="dashboard-stats">
        <div className="stat-box">
          <h2>Total Registered Doctors</h2>
          <p>{doctorStats.totalDoctors}</p>
        </div>
        <div className="stat-box">
          <h2>Active Doctors</h2>
          <p>{doctorStats.activeDoctors}</p>
        </div>
        <div className="stat-box">
          <h2>Suspended Doctors</h2>
          <p>{doctorStats.suspendedDoctors}</p>
        </div>
        <div className="stat-box">
          <h2>Total Specialties</h2>
          <p>{doctorStats.totalSpecialties}</p>
        </div>
      </div>
    </div>
  );
}
