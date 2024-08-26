import React from 'react';
import PrivacyPolicy from './PrivacyPolicy'; // Corrected import
import privacyData from '../data/PrivacyPolicy.json';

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-policy-page">
      <PrivacyPolicy data={privacyData} />
    </div>
  );
};

export default PrivacyPolicyPage;
