import React from 'react';
import './ResponseBox.css';

const ResponseBox = ({ index, response }) => {
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse response:', error);
        return (
            <div className="response-box">
                <h2>Response {index + 1}</h2>
                <p>Failed to parse response data.</p>
            </div>
        );
    }

    const { reasoning, score, maximumScore } = parsedResponse;

    return (
        <div className="response-box">
            <h2>Response {index + 1}</h2>
            <div className="response-content">
                <div className="response-item">
                    <span className="response-label">Reasoning:</span>
                    <span className="response-value">{reasoning}</span>
                </div>
                <div className="response-item">
                    <span className="response-label">Score:</span>
                    <span className="response-value">{score}</span>
                </div>
                <div className="response-item">
                    <span className="response-label">Maximum Score:</span>
                    <span className="response-value">{maximumScore}</span>
                </div>
            </div>
        </div>
    );
};

export default ResponseBox;
