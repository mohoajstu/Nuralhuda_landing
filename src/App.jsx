import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';
import { Navigation } from './home/navigation';
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
import FAQ from './home/FAQ';
import QuizGenerator from './quiz/QuizGenerator';
import FetchQuiz from './quiz/FetchQuiz';
import AutograderPage from './AutoGrader/AutGraderPage';
import Onboarding from './AutoGrader/onboarding';
import FiveDThinking from './5D-Thinking/FiveDThinking';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard/dashboard';
import PrivacyPolicyPage from './home/PrivacyPolicyPage';
import TermsOfUsePage from './home/TermsOfUsePage';
// Import the Sidebar component
import Sidebar from './Dashboard/sidebar';

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [landingPageData, setLandingPageData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determine if the navbar should be shown based on the current route
  const shouldShowNavbar = location.pathname === '/' || 
                           location.pathname === '/login' || 
                           location.pathname === '/pricing' || 
                           location.pathname === '/payment-success' || 
                           location.pathname === '/contact-form';

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} hasNavbar={shouldShowNavbar} />}
      {shouldShowNavbar && <Navigation />}
      <Routes>
        <Route path="/" element={landingPageData ? <Home data={landingPageData} /> : <div>Loading...</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account-setup" element={<AccountSetup />} />
        <Route path="/contact-form" element={<Contact />} />
        <Route path="/payment-success/:accountToken" element={<PaymentSuccess />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/quiz-generator" element={<ProtectedRoute element={QuizGenerator} />} />
        <Route path="/quiz/:quizId" element={<FetchQuiz />} />
        <Route path="/autograder" element={<ProtectedRoute element={AutograderPage} />} />
        <Route path="/onboarding" element={<ProtectedRoute element={Onboarding} />} />
        <Route path="/5dthinking" element={<ProtectedRoute element={FiveDThinking} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;
