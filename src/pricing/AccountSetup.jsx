import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase-config'; // Adjust the path as necessary

const db = getFirestore();

const AccountSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user payment status in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        paymentStatus: 'unpaid',
      });

      sessionStorage.setItem('accountSetupComplete', 'true');
      sessionStorage.setItem('userEmail', email);
      navigate('/pricing', { state: { email } });
    } catch (error) {
      console.error("Error creating account:", error);
      alert(error.message);
    }
  };

  return (
    <div className="account-setup-container">
      <form className="account-setup-form" onSubmit={handleSubmit}>
        <h2>Account Setup</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Complete Setup</button>
      </form>
    </div>
  );
};

export default AccountSetup;
