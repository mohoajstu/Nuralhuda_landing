import React from 'react';
import ResponseBox from './ResponseBox';
import './ResponseContainer.css';

const ResponseContainer = ({ responses }) => {
    return (
        <div className="response-container">
            {responses.length === 0 ? (
                <p>No responses yet</p>
            ) : (
                responses.map((response, index) => (
                    <ResponseBox key={index} index={index} response={response} />
                ))
            )}
        </div>
    );
};

export default ResponseContainer;
