import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase-config';
import googleLogo from '../img/Google-Icon.png';
import './LoginModal.css';

// Initialize the GoogleAuthProvider and add the necessary scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/forms.body'); // Scope for Google Forms
provider.addScope('https://www.googleapis.com/auth/presentations'); // Scope for Google Slides
provider.addScope('https://www.googleapis.com/auth/drive.file'); // Scope for Google Drive access

const db = getFirestore();

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let accountType = '';

      if (userDoc.exists()) {
        const userData = userDoc.data();
        accountType = userData.account || '';
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          paymentStatus: 'unpaid',
          account: '',
          lastResetDate: new Date(),
        });
        accountType = '';
      }

      // Store accountType in localStorage
      localStorage.setItem('accountType', accountType);

      // Trigger the onLogin callback
      onLogin();
      onClose();
    } catch (error) {
      console.error("Failed to log in: ", error);
      setError("Failed to log in. Check your email and password.");
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: email,
          paymentStatus: 'unpaid',
          account: '',
          lastResetDate: new Date(),
        });
      }

      // Trigger the onLogin callback
      onLogin();
      onClose();
    } catch (error) {
      console.error("Error creating account: ", error);
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let accountType = '';

      if (userDoc.exists()) {
        const userData = userDoc.data();
        accountType = userData.account || '';
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          paymentStatus: 'unpaid',
          account: '',
          lastResetDate: new Date(),
        });
        accountType = '';
      }

      // Store accountType and Google token in session storage
      localStorage.setItem('accountType', accountType);
      sessionStorage.setItem('googleAuthToken', token);

      // Trigger the onLogin callback
      onLogin();
      onClose();
    } catch (error) {
      console.error("Failed to log in with Google: ", error);
      setError("Failed to log in with Google.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{isSignup ? "Create an account" : "Sign In"}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          {isSignup && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          )}
          <button type="submit">{isSignup ? "Sign Up" : "Sign In"}</button>
        </form>
        <button onClick={handleGoogleLogin} className="google-login-button">
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Continue with Google
        </button>
        <p onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
