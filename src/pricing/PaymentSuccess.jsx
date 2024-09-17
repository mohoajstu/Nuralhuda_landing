import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import emailjs from 'emailjs-com'; // Import EmailJS

const db = getFirestore();
const auth = getAuth();

// Map cryptic strings to account types
const accountTypeMap = {
  'ab12cd34ef56gh78ij90': 'basic',
  'zx98yv76wu54ts32rq10': 'premium',
  'hy34jd45tk67lm89op00': 'hybrid', // New hybrid plan
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { accountToken } = useParams(); // Assume we have a cryptic token
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const user = auth.currentUser;
        console.log('User:', user);
        if (user) {
          // Retrieve account type from token
          const accountType = accountTypeMap[accountToken];
          console.log('Account Type:', accountType);
  
          if (!accountType) {
            throw new Error('Invalid token');
          }
  
          console.log('Updating user in Firestore');
          await updateDoc(doc(db, 'users', user.uid), {
            paymentStatus: 'paid',
            account: accountType,
          });
  
          console.log('Document updated successfully');
  
          // Send email notification to admin
          sendEmailNotification(user, accountType);
  
          setLoading(false);
        } else {
          console.error('User is not authenticated.');
          setError('User not authenticated.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to update payment status. Please try again.');
        setLoading(false);
      }
    };
  
    updatePaymentStatus();
  }, [navigate, accountToken]);
  
  const sendEmailNotification = (user, accountType) => {
    // Prepare the template parameters to match the EmailJS template
    const templateParams = {
      name: 'Payment System',  // This corresponds to {{name}} in your template
      email: user.email,       // This corresponds to {{email}} in your template
      message: `The user ${user.email} has subscribed to the ${accountType} plan.`  // This corresponds to {{message}} in your template
    };
  
    // Log templateParams to ensure they have the correct values
    console.log('Template Params:', templateParams);
  
    // Replace these with your EmailJS user ID and template ID
    const serviceID = 'service_rpg9tsq';
    const templateID = 'template_t06rk76';
    const userID = '2c0CoID2ucNYaKVFe';
  
    emailjs
      .send(serviceID, templateID, templateParams, userID)
      .then(
        (response) => {
          console.log('Email successfully sent!', response.status, response.text);
        },
        (err) => {
          console.error('Failed to send email. Error:', err);
        }
      );
  };  

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const getMessage = () => {
    if (accountToken === 'ab12cd34ef56gh78ij90') {
      return 'Thank you for subscribing to the Basic plan. Enjoy full access to Nur Al Huda.';
    } else if (accountToken === 'zx98yv76wu54ts32rq10') {
      return 'Thank you for subscribing to the Premium plan. Enjoy full access to Nur Al Huda, Islamic Socratic Method, Iqra with Us and more!';
    } else if (accountToken === 'hy34jd45tk67lm89op00') {
      return 'Thank you for subscribing to the Hybrid plan. Enjoy full access to Nur Al Huda and Nur Al Huda for Kids!';
    } else {
      return 'Thank you for your purchase.';
    }
  };

  if (loading) {
    return <div className="loader">Updating payment status...</div>;
  }

  return (
    <div className="payment-success-container">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <h2>Payment Successful!</h2>
          <p>{getMessage()}</p>
          <div className="button-container">
            <button onClick={handleGoToDashboard}>Go Home</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess;
