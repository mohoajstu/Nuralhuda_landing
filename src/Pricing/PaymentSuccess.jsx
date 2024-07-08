import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          paymentStatus: 'paid',
        });
      }
    };

    updatePaymentStatus();
  }, [navigate]);

  const handleGoToHome = () => {
    navigate('/'); // Adjust the path to your dashboard
  };

  return (
    <div className="payment-success-container">
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. Your payment has been successfully processed.</p>
      <div className="button-container">
        <button onClick={handleGoToHome}>Go Home</button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
