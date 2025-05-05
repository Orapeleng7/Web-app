import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import '../assets/css/DoctorList.css';

export default function DoctorList({ isAdminView = true }) {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [editDoctorId, setEditDoctorId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      const doctorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        fullname: doc.data().name,
        phoneNumber: doc.data().phone,
        email: doc.data().email,
        gender: doc.data().gender,
        specialty: doc.data().specialty,
        location: doc.data().location,
        picture: doc.data().image,
        status: doc.data().status,
        rating: doc.data().rating,
        createdAt: doc.data().createdAt
      }));
      setDoctors(doctorList);
    });

    return () => unsubscribe();
  }, []);

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    if (location.lat && location.lng) {
      return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }
    return 'N/A';
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.fullname?.toLowerCase().includes(searchQuery) ||
      doctor.specialty?.toLowerCase().includes(searchQuery);

    if (!isAdminView) {
      return doctor.status === 'active' && matchesSearch;
    }

    return matchesSearch;
  });

  const toggleDoctorExpansion = (id) => {
    setExpandedDoctorId(expandedDoctorId === id ? null : id);
    setEditDoctorId(null);
  };

  const handleEdit = (id) => {
    const docToEdit = doctors.find((doc) => doc.id === id);
    setEditDoctorId(id);
    setEditFormData({
      name: docToEdit.fullname,
      phone: docToEdit.phoneNumber,
      email: docToEdit.email,
      gender: docToEdit.gender,
      specialty: docToEdit.specialty,
      location: docToEdit.location ?
        `${docToEdit.location.lat}, ${docToEdit.location.lng}` : '',
      image: docToEdit.picture,
      status: docToEdit.status // Include status in edit form
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveEdit = async () => {
    try {
      const locationParts = editFormData.location.split(',').map(coord => coord.trim());
      const [lat, lng] = locationParts.map(coord => parseFloat(coord));
      
      await updateDoc(doc(db, 'doctors', editDoctorId), {
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
        gender: editFormData.gender,
        specialty: editFormData.specialty,
        location: { lat, lng },
        image: editFormData.image,
        status: editFormData.status
      });
      setEditDoctorId(null);
      setEditFormData({});
    } catch (error) {
      console.error('Failed to update doctor:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', id));
      } catch (error) {
        console.error('Failed to delete doctor:', error);
      }
    }
  };

  const handleSuspend = async (id) => {
    try {
      await updateDoc(doc(db, 'doctors', id), {
        status: 'suspended'
      });
    } catch (error) {
      console.error('Failed to suspend doctor:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      await updateDoc(doc(db, 'doctors', id), {
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to activate doctor:', error);
    }
  };

  return (
    <div className="doctor-list-container">
      {isAdminView && (
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      )}

      <h2 className="title">{isAdminView ? 'Doctor Management' : 'Available Doctors'}</h2>

      <input
        type="text"
        placeholder="Search by name or specialty..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />

      <table className="doctor-table">
        <thead>
          <tr>
            <th>Profile Picture</th>
            <th>Full Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Location (Lat, Lng)</th>
            <th>Specialty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <React.Fragment key={doctor.id}>
                <tr
                  className={`doctor-row ${expandedDoctorId === doctor.id ? 'expanded' : ''} ${doctor.status === 'suspended' ? 'suspended' : ''}`}
                  onClick={() => isAdminView && toggleDoctorExpansion(doctor.id)}
                >
                  <td>
                    {doctor.picture ? (
                      <img src={doctor.picture} alt="Doctor" className="doctor-picture" />
                    ) : (
                      <div className="empty-picture">No Image</div>
                    )}
                  </td>
                  <td>{doctor.fullname}</td>
                  <td>{doctor.phoneNumber}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.gender}</td>
                  <td>{formatLocation(doctor.location)}</td>
                  <td>{doctor.specialty}</td>
                  <td>
                    <span className={`status-badge ${doctor.status}`}>
                      {doctor.status}
                    </span>
                  </td>
                </tr>

                {expandedDoctorId === doctor.id && isAdminView && (
                  <tr className="action-row">
                    <td colSpan="8">
                      <div className="action-buttons-container">
                        {editDoctorId === doctor.id ? (
                          <div className="edit-form">
                            <h3>Edit Doctor</h3>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                  type="text"
                                  name="name"
                                  value={editFormData.name || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>Phone:</label>
                                <input
                                  type="text"
                                  name="phone"
                                  value={editFormData.phone || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Email:</label>
                                <input
                                  type="email"
                                  name="email"
                                  value={editFormData.email || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>Gender:</label>
                                <select
                                  name="gender"
                                  value={editFormData.gender || ''}
                                  onChange={handleEditChange}
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Specialty:</label>
                                <input
                                  type="text"
                                  name="specialty"
                                  value={editFormData.specialty || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>Location (Lat, Lng):</label>
                                <input
                                  type="text"
                                  name="location"
                                  value={editFormData.location || ''}
                                  onChange={handleEditChange}
                                  placeholder="e.g., 40.7128, -74.0060"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Image URL:</label>
                                <input
                                  type="text"
                                  name="image"
                                  value={editFormData.image || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>Status:</label>
                                <select
                                  name="status"
                                  value={editFormData.status || ''}
                                  onChange={handleEditChange}
                                >
                                  <option value="active">Active</option>
                                  <option value="suspended">Suspended</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-actions">
                              <button onClick={handleSaveEdit} className="save-btn">Save Changes</button>
                              <button onClick={() => setEditDoctorId(null)} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button onClick={() => handleEdit(doctor.id)} className="edit-btn">Edit Doctor</button>
                            <button onClick={() => handleDelete(doctor.id)} className="delete-btn">Delete Doctor</button>
                            {doctor.status === 'active' ? (
                              <button onClick={() => handleSuspend(doctor.id)} className="suspend-btn">Suspend Doctor</button>
                            ) : (
                              <button onClick={() => handleActivate(doctor.id)} className="activate-btn">Activate Doctor</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-doctors">
                {isAdminView ? 'No doctors found matching your search.' : 'No available doctors found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}