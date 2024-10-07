import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageStrategy, StorageManager } from './storage';
import './OnboardingPage.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const storageManager = new StorageManager(new LocalStorageStrategy());

    // Check if onboarding is already complete and navigate to AutograderPage
    useEffect(() => {
        if (storageManager.load('onboardingComplete')) {
            navigate('/tools/graderbot');
        }
    }, [navigate, storageManager]);

    const [currentStep, setCurrentStep] = useState('welcome');
    const [userData, setUserData] = useState({
        senate: '',
        department: '',
        course: ''
    });

    const nextStep = (stepData) => {
        setUserData({ ...userData, ...stepData });

        switch (currentStep) {
            case 'welcome':
                setCurrentStep('senate');
                break;
            case 'senate':
                setCurrentStep('department');
                break;
            case 'department':
                setCurrentStep('course');
                break;
            case 'course':
                handleCompleteOnboarding();
                break;
            default:
                break;
        }
    };

    const previousStep = () => {
        switch (currentStep) {
            case 'senate':
                setCurrentStep('welcome');
                break;
            case 'department':
                setCurrentStep('senate');
                break;
            case 'course':
                setCurrentStep('department');
                break;
            default:
                break;
        }
    };

    const handleCompleteOnboarding = () => {
        storageManager.save('onboardingComplete', 'true');
        storageManager.save('senate', userData.senate);
        storageManager.save('department', userData.department);
        storageManager.save('course', userData.course);

        navigate('/tools/graderbot');
    };

    return (
        <div className="onboarding-container">
            <div className="progress-indicator">
                <div className={`step ${currentStep === 'welcome' ? 'active' : ''}`}>1. Welcome</div>
                <div className={`step ${currentStep === 'senate' ? 'active' : ''}`}>2. School Info</div>
                <div className={`step ${currentStep === 'department' ? 'active' : ''}`}>3. Department</div>
                <div className={`step ${currentStep === 'course' ? 'active' : ''}`}>4. Course/Grade Level</div>
            </div>
            <div className="onboarding-content">
                {currentStep === 'welcome' && (
                    <div className="onboarding-step">
                        <h1>Welcome to Nur Al Huda</h1>
                        <p>Let’s get started with setting up your GraderBot experience!</p>
                        <button className="primary-button" onClick={() => nextStep()}>Get Started</button>
                    </div>
                )}

                {currentStep === 'senate' && (
                    <div className="onboarding-step">
                        <h2>Enter Your School Information</h2>
                        <input
                            type="text"
                            value={userData.senate}
                            onChange={(e) => setUserData({ ...userData, senate: e.target.value })}
                            placeholder="School Name"
                            className="input-field"
                        />
                        <div className="navigation-buttons">
                            <button className="secondary-button" onClick={() => previousStep()}>Back</button>
                            <button className="primary-button" onClick={() => nextStep()}>Next</button>
                        </div>
                    </div>
                )}

                {currentStep === 'department' && (
                    <div className="onboarding-step">
                        <h2>Enter Your Department</h2>
                        <input
                            type="text"
                            value={userData.department}
                            onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                            placeholder="Department"
                            className="input-field"
                        />
                        <div className="navigation-buttons">
                            <button className="secondary-button" onClick={() => previousStep()}>Back</button>
                            <button className="primary-button" onClick={() => nextStep()}>Next</button>
                        </div>
                    </div>
                )}

                {currentStep === 'course' && (
                    <div className="onboarding-step">
                        <h2>Enter Your Course or Grade Level</h2>
                        <input
                            type="text"
                            value={userData.course}
                            onChange={(e) => setUserData({ ...userData, course: e.target.value })}
                            placeholder="Course or Grade Level"
                            className="input-field"
                        />
                        <div className="navigation-buttons">
                            <button className="secondary-button" onClick={() => previousStep()}>Back</button>
                            <button className="primary-button" onClick={() => nextStep()}>Finish</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingPage;
