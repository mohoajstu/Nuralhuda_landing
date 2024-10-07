import React, { useState } from 'react';
import processCSV from './processCSV';
import './UploadRubric.css';

const UploadRubric = ({ setRubric, handleNextStep, handlePreviousStep }) => {
    const [file, setFile] = useState(null);
    const [manualInput, setManualInput] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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
            await processCSV({ csvFile3: file }, jsonData);

            if (!jsonData.csvFile3) {
                throw new Error('Failed to process the CSV file.');
            }

            setRubric(jsonData.csvFile3);
            handleNextStep();
        } catch (error) {
            console.error('Error processing CSV file:', error);
        }
    };

    const handleManualSubmit = () => {
        if (!manualInput.trim()) {
            alert('Please enter the grading rubric.');
            return;
        }

        const parsedRubric = manualInput.split('\n').map((line) => line.trim());
        setRubric(parsedRubric);
        handleNextStep();
    };

    return (
        <div className="upload-rubric-container">
            <h2>Step 3: Upload Grading Rubric</h2>
            <p>You can either upload a CSV file or manually enter the grading rubric.</p>

            <div className="upload-section">
                <div className="upload-option">
                    <h3>Upload CSV File</h3>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button className="primary-button" onClick={handleFileUpload}>
                        Upload File
                    </button>
                </div>

                <div className="manual-input-option">
                    <h3>Or Enter Grading Rubric Manually</h3>
                    <textarea
                        placeholder="Enter grading rubric, one line per criteria."
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
                    Next
                </button>
            </div>
        </div>
    );
};

export default UploadRubric;
