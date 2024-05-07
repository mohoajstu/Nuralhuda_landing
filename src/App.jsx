import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config'; // Ensure path accuracy
import { useLocation } from 'react-router-dom';

import {Navigation} from './home/navigation'; // Adjust according to your structure
import Home from './home/Home';
import Login from './login/Login';
import ChatScreen from './chat/chatScreen';
import JsonData from './data/data.json';
import SmoothScroll from 'smooth-scroll';
import './App.css';

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [landingPageData, setLandingPageData] = useState(null);  // Initialize to null

  useEffect(() => {
    setLandingPageData(JsonData);  // Assuming JsonData is immediately available or simulated as such
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Render loading screen while checking auth state
  }
console.log(user);
  return (
    <div className="App">
      {location.pathname === '/' && <Navigation />}
      <Routes>
      <Route path="/" element={landingPageData ? <Home data={landingPageData} /> : <div>Loading...</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
      </Routes>
    </div>
  );
};

export default App;