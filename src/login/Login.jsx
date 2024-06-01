import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../config/firebase-config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Sign out user on component mount to enforce login at the start of each session
        const signOutUser = async () => {
            await signOut(auth);
        };
        signOutUser();
    }, []);

    useEffect(() => {
        let timeout;
        const handleActivity = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                await signOut(auth);
                navigate('/login');
            }, 900000); // 15 minutes in milliseconds
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        // Clean up event listeners on unmount
        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            clearTimeout(timeout);
        };
    }, [navigate]);

    const handlePasswordReset = async (event) => {
        event.preventDefault();
        if (!resetEmail) {
            setError("Please enter your email address for password reset.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setError("Password reset email sent. Please check your inbox.");
            setResetEmail('');
            setShowResetForm(false);
        } catch (error) {
            console.error(error);
            setError("Failed to send password reset email.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout failed: ", error);
        }
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setEmail('');  // Clear email field
            setPassword('');  // Clear password field
            navigate('/');
        } catch (error) {
            console.error(error);
            setError("Failed to log in. Check your email and password.");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={showResetForm ? handlePasswordReset : handleLogin}>
                <h2>{showResetForm ? "Reset Password" : "Login"}</h2>
                {error && <p className="error-message">{error}</p>}
                
                {!showResetForm && (
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
                )}

                {showResetForm && (
                    <div className="input-group">
                        <label htmlFor="resetEmail">Email:</label>
                        <input
                            id="resetEmail"
                            type="email"
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            required
                        />
                    </div>
                )}

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
                
                {!showResetForm && (
                    <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
                )}

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