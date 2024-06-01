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

  return (
    <div className="payment-success-container">
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. You will be redirected shortly.</p>
    </div>
  );
};

export default PaymentSuccess;
