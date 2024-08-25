import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../img/Google-Icon.png'; // Make sure you have a Google logo image
import { auth } from '../config/firebase-config'; // Ensure path accuracy

// Initialize the GoogleAuthProvider and add the necessary scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/forms.body'); // Add the Google Forms scope

const db = getFirestore();

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
            setEmail('');
            setPassword('');
            navigate('/');
        } catch (error) {
            console.error(error);
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

            sessionStorage.setItem('accountSetupComplete', 'true');
            sessionStorage.setItem('userEmail', email);
            navigate('/pricing', { state: { email } });
        } catch (error) {
            console.error("Error creating account:", error);
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

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    paymentStatus: 'unpaid',
                    account: '',
                    lastResetDate: new Date(),
                });
            }

            // Store the token in session storage
            sessionStorage.setItem('googleAuthToken', token);

            navigate('/');
        } catch (error) {
            console.error(error);
            setError("Failed to log in with Google.");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={showResetForm ? handlePasswordReset : (isSignup ? handleSignup : handleLogin)}>
                <h2>{showResetForm ? "Reset Password" : (isSignup ? "Create an account" : "Welcome back")}</h2>
                {error && <p className="error-message">{error}</p>}

                <div className="input-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={isSignup ? email : (showResetForm ? resetEmail : email)}
                        onChange={e => isSignup ? setEmail(e.target.value) : (showResetForm ? setResetEmail(e.target.value) : setEmail(e.target.value))}
                        required
                    />
                </div>

                {!showResetForm && !isSignup && (
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                )}

                {isSignup && (
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                )}

                {isSignup && (
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button type="submit" className="login-button">
                    {showResetForm ? "Send Reset Email" : (isSignup ? "Sign Up" : "Continue")}
                </button>

                {!showResetForm && !isSignup && (
                    <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
                )}

                {!showResetForm && !isSignup && (
                    <p className="form-toggle" onClick={() => setShowResetForm(true)}>
                        Forgot password?
                    </p>
                )}

                {showResetForm && (
                    <p className="form-toggle" onClick={() => setShowResetForm(false)}>
                        Back to Login
                    </p>
                )}

                {!showResetForm && (
                    <p className="form-toggle" onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </p>
                )}

                {!showResetForm && (
                    <button type="button" onClick={handleGoogleLogin} className="google-login-button">
                        <img src={googleLogo} alt="Google Logo" className="google-logo" />
                        Continue with Google
                    </button>
                )}
            </form>
        </div>
    );
};

export default Login;
