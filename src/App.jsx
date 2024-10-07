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
import AutograderPage from './AutoGrader/AutoGraderPage';
import Onboarding from './AutoGrader/onboarding';
import FiveDThinking from './5D-Thinking/FiveDThinking';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard/dashboard';
import PrivacyPolicyPage from './home/PrivacyPolicyPage';
import TermsOfUsePage from './home/TermsOfUsePage';
import Sidebar from './Dashboard/sidebar';
import { SidebarProvider } from './SidebarContext'; // Import SidebarContext

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [landingPageData, setLandingPageData] = useState(null);
  const [accountType, setAccountType] = useState(''); // Add accountType state

  // Define which paths should not show the sidebar
  const shouldShowSidebar = user && location.pathname !== '/';

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

  // Fetch accountType from local storage when the app loads
  useEffect(() => {
    const storedAccountType = localStorage.getItem('accountType') || '';
    setAccountType(storedAccountType);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="App">
        {/* Conditionally render Sidebar and pass accountType */}
        {shouldShowSidebar && <Sidebar accountType={accountType} />} {/* Pass accountType as a prop */}
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
          <Route path="/tools/quiz-generator" element={<ProtectedRoute element={QuizGenerator} />} />
          <Route path="/quiz/:quizId" element={<FetchQuiz />} />
          <Route path="/tools/graderbot" element={<ProtectedRoute element={AutograderPage} />} />
          <Route path="/onboarding" element={<ProtectedRoute element={Onboarding} />} />
          <Route path="/tools/5dthinking" element={<ProtectedRoute element={FiveDThinking} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard accountType={accountType} />} />} /> {/* Pass accountType to Dashboard */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </SidebarProvider>
  );
};

export default App;
