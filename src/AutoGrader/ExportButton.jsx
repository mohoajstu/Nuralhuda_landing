import React from 'react';
import './ExportButton.css';

const exportToCSV = (responses) => {
    const csvContent = responses.map((response, index) => `Response ${index + 1},${response}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'responses.csv');
    a.click();
};

const ExportButton = ({ responses }) => {
    return (
        <button id="export-button" onClick={() => exportToCSV(responses)}>
            Export to CSV
        </button>
    );
};

export default ExportButton;
