import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem('hasShownPopup');
    if (!hasShownPopup) {
      setShowPopup(true);
      sessionStorage.setItem('hasShownPopup', 'true');
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    showPopup && (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>Have you heard? We are hosting a webinar!</h2>
          <p>Register now to secure your spot.</p>
          <div className="popup-buttons">
            <button onClick={handleRegister}>Register Now</button>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    )
  );
};

export default Popup;
