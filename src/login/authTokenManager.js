// authTokenManager.js
import { signOut } from "firebase/auth";
import { auth } from '../config/firebase-config'; // Ensure path accuracy

// Constants
const TOKEN_KEY = 'googleAuthToken';
const REFRESH_ENDPOINT = `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASE_API_KEY}`; // Replace with your Firebase API key

// Function to retrieve access token from session storage
const getAccessToken = async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiryTime = sessionStorage.getItem('tokenExpiry');

    if (token && expiryTime) {
        const now = new Date().getTime(); // Current time in milliseconds

        // Check if the token is expired
        if (now > expiryTime) {
            console.warn("Access token expired. Refreshing...");
            return await refreshAccessToken(); // Wait for the refreshed token
        } else {
            // Token is still valid
            return token;
        }
    }

    return null;
};

// Function to refresh the access token using Firebase refresh token logic
const refreshAccessToken = async () => {
    try {
        const refreshToken = sessionStorage.getItem('refreshToken'); // Store this in sessionStorage after login
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await fetch(REFRESH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to refresh token');
        }

        // Update the session storage with the new access token and expiration
        storeTokens(data.access_token, data.refresh_token, data.expires_in);

        return data.access_token;
    } catch (error) {
        console.error("Failed to refresh access token:", error);
        // Optional: Log out the user if the refresh fails
        await signOut(auth);
        window.location.href = '/login'; // Redirect to login
        return null;
    }
};

// Function to clear tokens from session storage
const clearTokens = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiry');
};

// Function to store tokens after login/signup, including expiration time
const storeTokens = (accessToken, refreshToken, expiresIn) => {
    const expiryTime = new Date().getTime() + expiresIn * 1000; // Convert expiresIn from seconds to milliseconds
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('tokenExpiry', expiryTime); // Store the absolute expiration time
};

// Function to handle user sign-out
const logoutUser = async () => {
    try {
        await signOut(auth);
        clearTokens();
        window.location.href = '/login';
    } catch (error) {
        console.error("Error logging out:", error);
    }
};

export { getAccessToken, refreshAccessToken, clearTokens, storeTokens, logoutUser };
