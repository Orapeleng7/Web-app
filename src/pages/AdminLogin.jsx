import React, { useState } from 'react';
import '../assets/css/AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const admin = userCredential.user;

      const adminDocRef = doc(db, 'admins', admin.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        await setDoc(adminDocRef, {
          email: admin.email,
          lastLogin: serverTimestamp(),
          role: 'admin',
        });
      } else {
        await setDoc(adminDocRef, {
          ...adminDocSnap.data(),
          lastLogin: serverTimestamp(),
        });
      }

      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message);
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Enter your email first to reset password');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">HealthMate</h1>
        <h2 className="text-xl font-semibold text-center">Admin Login</h2>

        {errorMsg && <div className="text-red-500 text-sm text-center mb-2">{errorMsg}</div>}

        <div className="space-y-4">
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-button" onClick={handleLogin}>
            Login
          </button>

          <div className="text-right">
            <button onClick={handleForgotPassword} className="forgot-password-btn">
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
