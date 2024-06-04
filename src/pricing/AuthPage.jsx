// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { auth } from '../config/firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = '/pricing'; // Redirect to PricingPage
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/pricing'; // Redirect to PricingPage
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Sign Up / Sign In</h1>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={handleSignUp} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Sign Up
        </button>
        <button onClick={handleSignIn} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
