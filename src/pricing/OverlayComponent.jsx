import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import LoginModal from '../login/LoginModal'; // Import LoginModal

const db = getFirestore();
const auth = getAuth();

const OverlayComponent = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [overlayStyles, setOverlayStyles] = useState({});

  useEffect(() => {
    const handleOverlayClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().paymentStatus === 'paid') {
          console.log('User is logged in and has paid');
          return;
        } else {
          console.log('User is logged in but has not paid');
          setLoginModalOpen(false); // You can add further logic here if needed
        }
      } else {
        console.log('No user is logged in');
        setLoginModalOpen(true); // Open the login modal
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
  }, []);

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    console.log('Login successful');
  };

  const accountSetupComplete = sessionStorage.getItem('accountSetupComplete');

  if (accountSetupComplete) {
    return null;
  }

  return (
    <>
      <div id="pricing-overlay" className="pricing-overlay" style={overlayStyles}></div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};

export default OverlayComponent;
