import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="thankyou-container">
      <h2>Thank You for Registering!</h2>
      <p>We have sent a confirmation email to your provided address.</p>
      <p>We look forward to seeing you at the webinar.</p>
      <button className="thankyou-home-button" onClick={handleHome}>Home</button>
    </div>
  );
};

export default ThankYou;
