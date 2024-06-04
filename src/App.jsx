import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config'; // Ensure path accuracy

import Navigation from './home/navigation'; // Adjust according to your structure
import Home from './home/Home';
import Login from './login/Login';
import ChatScreen from './chat/chatScreen';
import JsonData from './data/data.json';
import SmoothScroll from 'smooth-scroll';
import Pricing from './pricing/Pricing';
import AuthPage from './pricing/AuthPage';
import AccountSetup from './pricing/AccountSetup';


import './App.css';

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [landingPageData, setLandingPageData] = useState(null); // Initialize to null

  useEffect(() => {
    setLandingPageData(JsonData); // Assuming JsonData is immediately available or simulated as such
  }, []);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  if (loading) {
    return <div>Loading...</div>; // Render loading screen while checking auth state
  }

  return (
    <div className="App">
      {(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/pricing' || location.pathname === '/account-setup') && <Navigation />} {/* Display Navigation only on Home, Login, Pricing, and Chat pages */}
      
      <Routes>
        <Route path="/" element={landingPageData ? <Home data={landingPageData} /> : <div>Loading...</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account-setup" element={<AccountSetup />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;