import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DoctorList from './pages/DoctorList';
import DoctorRegister from './pages/DoctorRegister';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/add-doctor" element={<DoctorRegister />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
