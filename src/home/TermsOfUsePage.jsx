import React from 'react';
import TermsOfUse from './TermsOfUse.jsx';
import termsData from '../data/TermsOfUse.json';

const TermsOfUsePage = () => {
  return (
    <div className="terms-of-use-page">
      <TermsOfUse data={termsData} />
    </div>
  );
};

export default TermsOfUsePage;
