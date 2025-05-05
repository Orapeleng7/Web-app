import React, { useState } from 'react';
import '../assets/css/DoctorRegister.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function DoctorRegister() {
  const navigate = useNavigate();

  const defaultDoctor = {
    name: '',
    phone: '',
    email: '',
    gender: '',
    coordinates: '', // Single field for both lat and lng
    specialty: '',
    image: null,
  };

  const [doctor, setDoctor] = useState(defaultDoctor);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coordinateError, setCoordinateError] = useState('');

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
    if (e.target.name === 'coordinates') {
      setCoordinateError('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setDoctor({ ...doctor, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCoordinates = (coordString) => {
    const parts = coordString.split(',');
    if (parts.length !== 2) return false;
    
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCoordinates(doctor.coordinates)) {
      setCoordinateError('Please enter valid coordinates in "latitude, longitude" format');
      return;
    }

    try {
      const [lat, lng] = doctor.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      
      const doctorData = {
        name: doctor.name,
        phone: doctor.phone,
        email: doctor.email,
        gender: doctor.gender,
        location: {
          lat: lat,
          lng: lng
        },
        specialty: doctor.specialty,
        image: doctor.image || '',
        status: 'active',
        createdAt: new Date(),
      };

      await addDoc(collection(db, "doctors"), doctorData);

      alert("✅ Doctor registered successfully!");
      setDoctor(defaultDoctor);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("❌ Failed to register doctor.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="form-title">Doctor Registration</h2>

        <div className="image-preview">
          <img
            src={previewUrl || 'https://via.placeholder.com/150'}
            alt="Profile Preview"
            className="preview-img"
          />
        </div>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            id="image-upload"
            className="hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload" className="upload-label">
            Upload Profile Picture
          </label>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={doctor.name}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={doctor.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={doctor.email}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={doctor.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <div className="coordinates-container">
            <input
              type="text"
              name="coordinates"
              placeholder="Latitude, Longitude (e.g., 40.7128, -74.0060)"
              value={doctor.coordinates}
              onChange={handleChange}
              required
            />
            {coordinateError && <p className="error-message">{coordinateError}</p>}
        
          </div>

          <input
            type="text"
            name="specialty"
            placeholder="Specialty"
            value={doctor.specialty}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">
            Register Doctor
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}