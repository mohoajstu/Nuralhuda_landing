import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../config/firebase-config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false); // To toggle reset form visibility
    const navigate = useNavigate();

    const handlePasswordReset = async (event) => {
        event.preventDefault(); // Prevent form submission on reset
        if (!resetEmail) {
            setError("Please enter your email address for password reset.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setError("Password reset email sent. Please check your inbox.");
            setResetEmail('');
            setShowResetForm(false); // Hide reset form on successful request
        } catch (error) {
            console.error(error);
            setError("Failed to send password reset email.");
        }
    };

    const handleLogout = async () => {
      try {
          await signOut(auth);
          navigate('/');  // Optionally redirect to home/login
      } catch (error) {
          console.error("Logout failed: ", error);
      }
  };

    const handleGoToHome = () => {
      navigate('/');
    };


    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent form submission
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError("Failed to log in. Check your email and password.");
        }
    };

    return (
        <div className="login-container">
                    <button className="login-home-button" onClick={handleGoToHome}>
              Home
          </button>
            <form className="login-form" onSubmit={showResetForm ? handlePasswordReset : handleLogin}>
                <h2>{showResetForm ? "Reset Password" : "Login"}</h2>
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                {!showResetForm && (
                    <div className="input-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button type="submit" className="login-button">
                    {showResetForm ? "Send Reset Email" : "Login"}
                </button>
                <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
              

                {!showResetForm ? (
                    <p className="form-toggle" onClick={() => setShowResetForm(true)}>
                        Forgot password?
                    </p>
                ) : (
                    <p className="form-toggle" onClick={() => setShowResetForm(false)}>
                        Back to Login
                    </p>
                )}
            </form>
        </div>
    );
};

export default Login;
