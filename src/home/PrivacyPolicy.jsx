import React from "react";

export const PrivacyPolicy = (props) => {
  return (
    <div id="privacy-policy" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Privacy Policy</h2>
          <p>Effective Date: {props.data ? props.data.effective_date : "loading"}</p>
        </div>
        <div className="row">
          {props.data
            ? props.data.sections.map((section, index) => (
                <div key={`${section.heading}-${index}`} className="col-12">
                  <h3 style={{ textAlign: 'left' }}>{section.heading}</h3>
                  <p style={{ textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: section.content }}></p>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
