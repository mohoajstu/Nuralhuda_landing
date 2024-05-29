import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component

const OverlayComponent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [overlayStyles, setOverlayStyles] = useState({});

  useEffect(() => {
    const handleOverlayClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const accountSetupComplete = sessionStorage.getItem('accountSetupComplete');
      if (!accountSetupComplete) {
        setModalOpen(true);
      }
    };

    const updateOverlaySize = () => {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        setOverlayStyles({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const overlay = document.getElementById('pricing-overlay');
    if (overlay) {
      overlay.addEventListener('click', handleOverlayClick);
    }

    window.addEventListener('resize', updateOverlaySize);
    window.addEventListener('scroll', updateOverlaySize);
    updateOverlaySize();

    return () => {
      if (overlay) {
        overlay.removeEventListener('click', handleOverlayClick);
      }
      window.removeEventListener('resize', updateOverlaySize);
      window.removeEventListener('scroll', updateOverlaySize);
    };
  }, [navigate]);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
    navigate('/account-setup');
  };

  const accountSetupComplete = sessionStorage.getItem('accountSetupComplete');

  if (accountSetupComplete) {
    return null;
  }

  return (
    <>
      <div id="pricing-overlay" className="pricing-overlay" style={overlayStyles}></div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        message="You need to setup an account before proceeding."
      />
    </>
  );
};

export default OverlayComponent;
