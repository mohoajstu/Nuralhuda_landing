import React, { useState } from 'react';
import processCSV from './processCSV';
import './UploadStudentResponses.css';

const UploadStudentResponses = ({ setStudentResponses, handleNextStep, handlePreviousStep }) => {
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
            await processCSV({ csvFile4: file }, jsonData);

            if (!jsonData.csvFile4) {
                throw new Error('Failed to process the CSV file.');
            }

            setStudentResponses(jsonData.csvFile4);
            handleNextStep();
        } catch (error) {
            console.error('Error processing CSV file:', error);
        }
    };

    const handleManualSubmit = () => {
        if (!manualInput.trim()) {
            alert('Please enter the student responses.');
            return;
        }

        const parsedResponses = manualInput.split('\n').map((line) => {
            const [studentNumber, ...responses] = line.split(',');
            return {
                studentNumber: studentNumber.trim(),
                responses: responses.map((response) => response.trim()),
            };
        });

        setStudentResponses(parsedResponses);
        handleNextStep();
    };

    return (
        <div className="upload-student-responses-container">
            <h2>Step 4: Upload Student Responses</h2>
            <p>You can either upload a CSV file or manually enter the student responses.</p>

            <div className="upload-section">
                <div className="upload-option">
                    <h3>Upload CSV File</h3>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button className="primary-button" onClick={handleFileUpload}>
                        Upload File
                    </button>
                </div>

                <div className="manual-input-option">
                    <h3>Or Enter Student Responses Manually</h3>
                    <textarea
                        placeholder="Enter student number and responses, separated by commas (e.g., Student1, Answer1, Answer2, ...)"
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

export default UploadStudentResponses;
