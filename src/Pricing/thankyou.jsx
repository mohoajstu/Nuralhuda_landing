import React, { useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase-config'; // Adjust the path as necessary

const ThankYou = () => {
  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    const password = sessionStorage.getItem('userPassword');

    if (email && password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('User account created:', userCredential.user);
          // Clear sessionStorage after account creation
          sessionStorage.removeItem('userEmail');
          sessionStorage.removeItem('userPassword');
        })
        .catch((error) => {
          console.error('Error creating user account:', error);
        });
    }
  }, []);

  return (
    <div>
      <h2>Thank You for Your Purchase!</h2>
      <p>Your account has been successfully created.</p>
    </div>
  );
};

export default ThankYou;
