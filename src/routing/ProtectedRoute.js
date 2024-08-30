import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase-config'; // Ensure `db` is imported correctly
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ element, requireEnterprise = false }) => {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, 'users', user.uid); // Use `db` instead of `firestore`
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      };
      fetchUserData();
    }
  }, [user]);

  if (loading || (user && !userData)) {
    return <div>Loading...</div>;
  }

  // Check if the element is a React component or an element
  const Component = typeof element === 'function' ? element : () => element;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireEnterprise && !userData?.enterprise) {
    return <Navigate to="/not-authorized" />;
  }

  return <Component />;
};

export default ProtectedRoute;
