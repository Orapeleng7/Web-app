import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../assets/css/Reports.css';
import { FaArrowLeft, FaFileExport, FaStar, FaCalendarAlt, FaUserMd, FaBan, FaStethoscope } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Reports() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [topRated, setTopRated] = useState(null);
  const [mostAppointments, setMostAppointments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors data
        const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
        const doctorsData = doctorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch appointments for each doctor
        const doctorsWithAppointments = await Promise.all(
          doctorsData.map(async doctor => {
            const appointmentsQuery = query(
              collection(db, 'appointments'),
              where('doctorId', '==', doctor.id)
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointmentsCount = appointmentsSnapshot.size;
            
            // Calculate rating if available
            const rating = doctor.ratingSum && doctor.ratingCount 
              ? (doctor.ratingSum / doctor.ratingCount).toFixed(1)
              : 'N/A';

            return {
              ...doctor,
              appointments: appointmentsCount,
              rating,
              status: doctor.status || 'Active' // Default to Active if not specified
            };
          })
        );

        setDoctors(doctorsWithAppointments);
        setSpecialties([...new Set(doctorsWithAppointments.map(doc => doc.specialty))]);

        // Find top-rated doctor (excluding suspended doctors)
        const ratedDoctors = doctorsWithAppointments.filter(d => 
          d.rating !== 'N/A' && d.status !== 'Suspended'
        );
        setTopRated(ratedDoctors.length > 0 
          ? ratedDoctors.reduce((top, curr) => 
              parseFloat(curr.rating) > parseFloat(top?.rating || 0) ? curr : top, ratedDoctors[0])
          : null
        );

        // Find doctor with most appointments (excluding suspended doctors)
        const activeDoctors = doctorsWithAppointments.filter(d => d.status !== 'Suspended');
        setMostAppointments(activeDoctors.length > 0 
          ? activeDoctors.reduce((top, curr) => 
              curr.appointments > top.appointments ? curr : top, activeDoctors[0])
          : null
        );

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(40, 180, 160);
    doc.text('HealthMate Doctors Report', 105, 20, null, null, 'center');
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, null, null, 'center');
    
    // Summary statistics
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      headStyles: { fillColor: [40, 180, 160], textColor: 255 },
      body: [
        ['Total Doctors', doctors.length],
        ['Active Doctors', doctors.filter(d => d.status === 'Active').length],
        ['Suspended Doctors', doctors.filter(d => d.status === 'Suspended').length],
        ['Total Specialties', specialties.length],
        ['Top Rated Doctor', topRated ? `${topRated.name} (${topRated.rating})` : 'N/A'],
        ['Most Appointments', mostAppointments ? `${mostAppointments.name} (${mostAppointments.appointments})` : 'N/A']
      ],
    });

    // Doctor details table
    doc.setFontSize(14);
    doc.text('Doctor Details', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Name', 'Specialty', 'Status', 'Rating', 'Appointments']],
      headStyles: { fillColor: [40, 180, 160], textColor: 255 },
      body: doctors.map(d => [
        d.name,
        d.specialty,
        d.status,
        d.rating,
        d.appointments
      ]),
      styles: { 
        cellPadding: 4, 
        fontSize: 10,
        // Highlight suspended doctors in red
        fillColor: (row) => row.raw[2] === 'Suspended' ? [255, 235, 238] : [255, 255, 255],
        textColor: (row) => row.raw[2] === 'Suspended' ? [244, 67, 54] : [0, 0, 0]
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    doc.save('HealthMate_Report.pdf');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="report-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.button 
        className="back-button"
        onClick={() => navigate('/dashboard')}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft /> Back to Dashboard
      </motion.button>

      <motion.h1 className="report-title" variants={itemVariants}>
        Reports & Analytics
      </motion.h1>

      <motion.div className="report-stats" variants={containerVariants}>
        <motion.div className="report-card" variants={itemVariants}>
          <div className="card-icon">
            <FaUserMd />
          </div>
          <h2>Total Doctors</h2>
          <p>{doctors.length}</p>
        </motion.div>

        <motion.div className="report-card" variants={itemVariants}>
          <div className="card-icon">
            <FaBan />
          </div>
          <h2>Suspended</h2>
          <p>{doctors.filter(d => d.status === 'Suspended').length}</p>
        </motion.div>

        <motion.div className="report-card" variants={itemVariants}>
          <div className="card-icon">
            <FaStethoscope />
          </div>
          <h2>Specialties</h2>
          <p>{specialties.length}</p>
        </motion.div>

        {topRated && (
          <motion.div className="report-card highlight" variants={itemVariants}>
            <div className="card-icon">
              <FaStar />
            </div>
            <h2>Top Rated</h2>
            <p>{topRated.name}</p>
            <div className="rating-badge">
              {topRated.rating} <FaStar className="star-icon" />
            </div>
          </motion.div>
        )}

        {mostAppointments && (
          <motion.div className="report-card highlight" variants={itemVariants}>
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <h2>Most Appointments</h2>
            <p>{mostAppointments.name}</p>
            <div className="appointment-badge">
              {mostAppointments.appointments}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div className="action-section" variants={itemVariants}>
        <motion.button 
          className="export-btn"
          onClick={exportPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFileExport /> Export PDF Report
        </motion.button>
      </motion.div>

      <motion.div className="doctor-list-section" variants={itemVariants}>
        <h3>Doctor Breakdown</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Appointments</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, idx) => (
                <motion.tr 
                  key={doc.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={doc.status === 'Suspended' ? 'suspended' : ''}
                >
                  <td>{doc.name}</td>
                  <td>{doc.specialty}</td>
                  <td>
                    <span className={`status ${doc.status.toLowerCase()}`}>
                      {doc.status === 'Suspended' ? (
                        <>
                          <FaBan className="status-icon" /> Suspended
                        </>
                      ) : (
                        <>
                          <FaUserMd className="status-icon" /> Active
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    {doc.rating !== 'N/A' ? (
                      <span className="rating">
                        {doc.rating} <FaStar className="star-icon small" />
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>{doc.appointments}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}