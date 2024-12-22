import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FancyBanner.css'; // Make sure this file has the slanted & fancy border CSS

const FancyBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Hooks from react-router-dom:
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we're currently on the /pricing page
  const isPricingPage = location.pathname === '/pricing';

  useEffect(() => {
    // Check sessionStorage if banner was previously closed
    const bannerClosed = sessionStorage.getItem('bannerClosed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    // Store in sessionStorage so it won't show again in this session
    sessionStorage.setItem('bannerClosed', 'true');
  };

  const startFreeTrial = () => {
    // Redirect user to /pricing
    navigate('/pricing');
  };

  // If user already dismissed the banner (isVisible === false),
  // or sessionStorage says 'true', we don't render the banner
  if (!isVisible) return null;

  return (
    <div className="banner-overlay">
      <div className="trial-banner">
        <div className="banner-content">
          {/* Shaped background */}
          <div className="shapes-bg">
            <div className="shape circle circle1"></div>
            <div className="shape circle circle2"></div>
            <div className="shape blob"></div>
          </div>

          {/* Optional vertical label on the side */}
          <div className="limited-time-text">FOR A LIMITED TIME</div>

          {/* Main text & CTA */}
          <div className="text-container">
            <div className="highlight-text">1 WEEK</div>
            <div className="main-text">FREE TRIAL</div>
            <div className="cta-wrapper">
              {!isPricingPage && (
                <button className="cta-button" onClick={startFreeTrial}>
                  Start Free Trial
                </button>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button className="dismiss-button" onClick={dismissBanner}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default FancyBanner;
