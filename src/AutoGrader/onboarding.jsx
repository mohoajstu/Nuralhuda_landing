import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageStrategy, StorageManager } from './storage';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const storageManager = new StorageManager(new LocalStorageStrategy());

    const handleGetStarted = () => {
        // Save the onboarding completion status in local storage
        storageManager.save('onboardingComplete', 'true');

        // Redirect the user to the main page
        navigate('/');
    };

    return (
        <div>
            <h1>Welcome to Nur Al Huda</h1>
            <button id="get-started-button" onClick={handleGetStarted}>Get Started</button>
        </div>
    );
};

export default OnboardingPage;
