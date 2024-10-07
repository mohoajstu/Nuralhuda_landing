// UploadGradingScheme.js
import React, { useState } from 'react';
import processCSV from './processCSV';
import './UploadGradingScheme.css';

const UploadGradingScheme = ({ setGradingScheme, handleNextStep, handlePreviousStep }) => {
    const [file, setFile] = useState(null);
    const [manualInput, setManualInput] = useState('');

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const selectedFile = files[0];
            if (selectedFile.size > 5 * 1024 * 1024) { // 5 MB size limit
                alert('File size exceeds 5MB limit. Please upload a smaller file.');
                return;
            }
            setFile(selectedFile);
            console.log('File selected:', selectedFile);
        } else {
            console.error('No file selected.');
        }
    };

    const handleTextInputChange = (e) => {
        setManualInput(e.target.value);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        try {
            const jsonData = {};
            await processCSV({ csvFile2: file }, jsonData);

            if (!jsonData.csvFile2) {
                throw new Error('Failed to process the CSV file. Ensure the file format is correct and each line has the necessary values.');
            }

            setGradingScheme(jsonData.csvFile2);
            handleNextStep();
        } catch (error) {
            console.error('Error processing CSV file:', error);
            alert('Failed to process CSV file. Please check the file format and try again. Common issues include incorrect headers or missing values.');
        }
    };

    const handleManualSubmit = () => {
        if (!manualInput.trim()) {
            alert('Please enter the grading scheme.');
            return;
        }
    
        const parsedScheme = manualInput.split('\n')
            .filter(line => line.trim() !== '') // Remove any empty lines
            .map((line) => {
                return { score: null, criteria: line.trim() }; // Leave score as null if not provided
            });
    
        if (parsedScheme.length === 0) {
            alert('No valid grading criteria entered. Please provide at least one criterion.');
            return;
        }

        setGradingScheme(parsedScheme);
        handleNextStep();
    };

    return (
        <div className="upload-grading-scheme-container">
            <h2>Step 2: Upload Grading Scheme <span className="recommended-badge">Recommended</span></h2>
            <p>You can either upload a CSV file or manually enter the grading scheme.</p>

            <div className="upload-section">
                <div className="upload-option">
                    <h3>Upload CSV File</h3>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button className="primary-button" onClick={handleFileUpload}>
                        Upload File
                    </button>
                </div>

                <div className="manual-input-option">
                    <h3>Or Enter Grading Scheme Manually</h3>
                    <textarea
                        placeholder="Enter grading criteria, one per line"
                        value={manualInput}
                        onChange={handleTextInputChange}
                        className="input-textarea"
                    />
                    <button className="primary-button" onClick={handleManualSubmit}>
                        Submit Manually
                    </button>
                </div>
            </div>

            <div className="navigation-buttons">
                <button className="secondary-button" onClick={handlePreviousStep}>
                    Back
                </button>
                <button className="primary-button" onClick={handleNextStep}>
                    Skip to Rubric
                </button>
            </div>
        </div>
    );
};

export default UploadGradingScheme;
