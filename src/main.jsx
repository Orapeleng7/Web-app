import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DoctorList from './pages/DoctorList.jsx';
import DoctorRegister from './pages/DoctorRegister.jsx';
import Reports from './pages/Reports.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/register-doctor" element={<DoctorRegister />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
