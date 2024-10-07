import React from 'react';
import './ExportButton.css';

const exportToCSV = (responses) => {
    if (!responses || responses.length === 0) {
        alert('No data available to export.');
        return;
    }

    // Create an array for CSV rows
    const csvRows = [];

    // Add headers row
    csvRows.push('Student,Reasoning,Score,Maximum Score');

    // Loop over the data and push values
    responses.forEach((responseStr, index) => {
        // Parse the JSON string into an object
        let response;
        try {
            response = JSON.parse(responseStr);
        } catch (error) {
            console.error(`Error parsing JSON for student ${index + 1}:`, error);
            response = {};
        }

        const studentName = `Student ${index + 1}`;
        const reasoning = response.reasoning || '';
        const score = response.score !== undefined ? response.score : '';
        const maximumScore = response.maximumScore !== undefined ? response.maximumScore : '';

        // Handle commas and quotes in the data
        const escapedStudentName = `"${('' + studentName).replace(/"/g, '""')}"`;
        const escapedReasoning = `"${('' + reasoning).replace(/"/g, '""')}"`;
        const escapedScore = `"${('' + score).replace(/"/g, '""')}"`;
        const escapedMaximumScore = `"${('' + maximumScore).replace(/"/g, '""')}"`;

        const row = [escapedStudentName, escapedReasoning, escapedScore, escapedMaximumScore];
        csvRows.push(row.join(','));
    });

    // Combine all rows into a single CSV string
    const csvString = csvRows.join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a link and trigger a download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'responses.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ExportButton = ({ responses }) => {
    return (
        <button id="export-button" onClick={() => exportToCSV(responses)}>
            Export to CSV
        </button>
    );
};

export default ExportButton;
