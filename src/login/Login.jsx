import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from '../config/firebase-config';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from);
        } catch (error) {
            console.error(error);
            setError("Failed to log in. Check your email and password.");
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

    return (
        <div className="login-container">
                <button className="login-home-button" onClick={handleGoToHome}>
          Home
        </button>

            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>} {/* Display error message */}
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
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
                <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
            </form>
        </div>
    );
};

export default Login;