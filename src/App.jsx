// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config'; // Ensure path accuracy
import { Navigation } from './home/navigation'; // Adjust according to your structure
import Home from './home/Home';
import Login from './login/Login';
import ChatScreen from './chat/chatScreen';
import JsonData from './data/data.json';
import SmoothScroll from 'smooth-scroll';
import './App.css';
import Pricing from './pricing/Pricing';
import Contact from './pricing/ContactForm';
import AccountSetup from './pricing/AccountSetup';
import PaymentSuccess from './pricing/PaymentSuccess';
import FAQ from './home/FAQ'; // Import FAQ component
import QuizGenerator from './quiz/QuizGenerator';
import FetchQuiz from './quiz/FetchQuiz'; // Import the component to fetch and display the quiz
import Quran from './Quran/Quran'; // Import the new Quran page

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [landingPageData, setLandingPageData] = useState(null);

  useEffect(() => {
    setLandingPageData(JsonData);
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
    return <div>Loading...</div>;
  }

  const showNavigation = ['/','/quran', '/login', '/pricing', '/payment-success'].includes(location.pathname) || /^\/quran\//.test(location.pathname);

  return (
    <div className="App">
      {(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/pricing' || location.pathname === '/payment-success' || location.pathname === '/contact-form' || location.pathname === '/quiz-generator') && <Navigation />}
      <Routes>
        <Route path="/" element={landingPageData ? <Home data={landingPageData} /> : <div>Loading...</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account-setup" element={<AccountSetup />} />
        <Route path="/contact-form" element={<Contact />} />
        <Route path="/payment-success/:accountToken" element={<PaymentSuccess />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
        <Route path="/faq" element={<FAQ />} /> {/* Add FAQ route */}
        <Route path="/quiz-generator" element={<QuizGenerator />} />
        <Route path="/quiz/:quizId" element={<FetchQuiz />} /> {/* Add this route */}
        
        {/* Quran route */}
        <Route path="/quran/*" element={<Quran />} /> {/* Use wildcard to match nested routes */}
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;