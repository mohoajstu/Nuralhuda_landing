import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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
        if (user) {
          // Retrieve account type from token
          const accountType = accountTypeMap[accountToken];

          if (!accountType) {
            throw new Error('Invalid token');
          }

          await updateDoc(doc(db, 'users', user.uid), {
            paymentStatus: 'paid',
            account: accountType,
          });
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to update payment status. Please try again.');
        setLoading(false);
      }
    };

    updatePaymentStatus();
  }, [navigate, accountToken]);

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
