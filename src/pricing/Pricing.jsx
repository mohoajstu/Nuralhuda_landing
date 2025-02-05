// Pricing.jsx
import React from 'react';
import Slideshow from './Slideshow';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config';
import OverlayComponent from './OverlayComponent';
import FreeTrialBanner from '../Banner/FancyBanner'; // <-- IMPORT THE BANNER

const Pricing = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleContactUsClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/contact-form');
    }
  };

  return (
    <div className="pricing-page" id="pricing">
      {/* Free Trial Banner at the top */}
      <FreeTrialBanner />

      <div className="container">
        <Slideshow />
      </div>

      <div className="text-container">
        <h6 className="heading">Here are all our plans</h6>
        <h6 className="subheading">Choose the plan that best suits your needs.</h6>
      </div>

      <div id="pricing-section" className="relative">
      <stripe-pricing-table pricing-table-id="prctbl_1QpGfy05w9FZLaHVaFkMJDFt"
        publishable-key="pk_live_51PLZjS05w9FZLaHVPD3797QnhbMKux0srEkA2gotxNHl5Q9HsYTP6EtOXsyfi4BbTPHXS8IZ7pqbHvav7xQXmTq800myJ6Ejsz">
      </stripe-pricing-table>
        
        {!user && <OverlayComponent />}
      </div>

      <div className="enterprise-card-container">
        <div className="enterprise-card">
          <h3 className="enterprise-title">Enterprise Subscription</h3>
          <h3 className="enterprise-description">
            Get in touch with us for our enterprise subscription, which is best 
            suited for schools and organizations (10+ members)
          </h3>
          <button className="enterprise-button" onClick={handleContactUsClick}>
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
