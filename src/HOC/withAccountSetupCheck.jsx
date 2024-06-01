import React from 'react';
import { Navigate } from 'react-router-dom';

const withAccountSetupCheck = (Component) => {
  return (props) => {
    const accountSetupComplete = sessionStorage.getItem('accountSetupComplete');
    if (!accountSetupComplete) {
      return <Navigate to="/account-setup" />;
    }
    return <Component {...props} />;
  };
};

export default withAccountSetupCheck;
