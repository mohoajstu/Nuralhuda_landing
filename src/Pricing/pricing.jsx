import React from 'react';
import Slideshow from './Slideshow';
import { useNavigate } from 'react-router-dom';
import OverlayComponent from './OverlayComponent';

const Pricing = () => {

  const navigate = useNavigate();

  const handleContactUsClick = () => {
    // Assuming you have a contact section with an id "contact"
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback to navigate to the contact route if the section is not found
      navigate('/#contact');
    }
  };
  return (
    <div className="pricing-page py-10 md:px-14 p-4 max-w-screen-2xl mx-auto relative" id="pricing">
      <div className="container">
        <Slideshow />
      </div>
      <div className="text-container">
        <h4 className="md:text-5xl text-2xl font-extrabold text-gray-900 mb-2">Here are all our plans</h4>
        <h4 className="text-tertiary md:w-1/3 mx-auto">Choose the plan that best suits your needs.</h4>
      </div>
      <div id="pricing-section" className="relative">
      <stripe-pricing-table 
      pricing-table-id="prctbl_1PLkpt05w9FZLaHVMFYhXhZN"
      publishable-key="pk_live_51PLZjS05w9FZLaHVPD3797QnhbMKux0srEkA2gotxNHl5Q9HsYTP6EtOXsyfi4BbTPHXS8IZ7pqbHvav7xQXmTq800myJ6Ejsz">
    </stripe-pricing-table>
        <OverlayComponent />
      </div>

      <div className="enterprise-card-container mt-10">
          <div className="enterprise-card">
            <h3 className="enterprise-title">Enterprise Subscription</h3>
            <p className="enterprise-description">Get in touch with us for our enterprise subscription, which is best suited for schools and organizations (10+ members)</p>
            <button className="enterprise-button" onClick={handleContactUsClick}>Contact Us</button>
          </div>
      </div>
    </div>
  );
};

export default Pricing;


