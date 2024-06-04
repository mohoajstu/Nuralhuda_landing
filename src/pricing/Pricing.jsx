import React, { useEffect } from 'react';
import Slideshow from './Slideshow';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase-config'; // Adjust the path as necessary
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const Pricing = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleSubscribe = async (priceId, planName) => {
    if (!user) {
      alert('You need to complete account setup before subscribing.');
      navigate('/account-setup'); // Redirect to AccountSetup page
      return;
    }

    const docRef = await addDoc(collection(db, 'customers', user.uid, 'checkout_sessions'), {
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
      metadata: { user_id: user.uid, plan: planName },
    });

    onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data();
      if (error) {
        alert(`An error occurred: ${error.message}`);
      }
      if (url) {
        window.location.assign(url);
      }
    });
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleContactUsClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#contact');
    }
  };

  return (
    <div className="pricing-page" id="pricing">
      <div className="container">
        <Slideshow />
      </div>
      <div className="text-container">
        <h4 className="title">Here are all our plans</h4>
        <h4 className="subtitle">Choose the plan that best suits your needs.</h4>
      </div>
      <div id="pricing-section" className="relative">
        {/* Example buttons for subscription plans */}
        <button onClick={() => handleSubscribe('price_1PNZlz05w9FZLaHVo6xcjpGN', 'Basic Plan')}>Subscribe to Basic Plan</button>
        <button onClick={() => handleSubscribe('price_1PNZlz05w9FZLaHVo6xcjpGN', 'Premium Plan')}>Subscribe to Premium Plan</button>

        <stripe-pricing-table 
          pricing-table-id="prctbl_1PNZlz05w9FZLaHVo6xcjpGN"
          publishable-key="pk_test_51PLZjS05w9FZLaHVcT5XcL6yOlScMQBUKoCdZYTKdVqy1jdsyBKglL5pxietT3Q5TXKYd4DiqkQEeV366hYnxBvV00BVKf67vG">
        </stripe-pricing-table>
      </div>
      <div className="enterprise-card-container">
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
