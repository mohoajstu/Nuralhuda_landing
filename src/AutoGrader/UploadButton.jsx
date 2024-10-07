import React, { useState } from 'react';
import processCSV from './processCSV';
import './UploadButton.css';

const UploadButton = ({ storageManager, setQuestionsAndMaxScores, setGradingScheme, setStudentResponses }) => {
    const [files, setFiles] = useState({});

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFiles(prevFiles => ({ ...prevFiles, [name]: files }));
        console.log('File selected for', name, files);
    };

    const handleUpload = async () => {
        console.log('Starting CSV upload and processing');
        try {
            const jsonData = {};
            await processCSV(files, jsonData);

            console.log('Processed JSON data:', jsonData);

            const questionsAndMaxScores = jsonData.csvFile1;
            const gradingScheme = jsonData.csvFile2;
            const studentResponses = jsonData.csvFile3;

            console.log('questionsAndMaxScores:', questionsAndMaxScores);
            console.log('gradingScheme:', gradingScheme);
            console.log('studentResponses:', studentResponses);

            if (!questionsAndMaxScores || !gradingScheme || !studentResponses) {
                throw new Error('Failed to process one or more CSV files');
            }

            storageManager.save('questionsAndMaxScores', questionsAndMaxScores);
            storageManager.save('gradingScheme', gradingScheme);
            storageManager.save('studentResponses', studentResponses);

            setQuestionsAndMaxScores(questionsAndMaxScores);
            setGradingScheme(gradingScheme);
            setStudentResponses(studentResponses);

        } catch (error) {
            console.error('Error processing CSV files:', error);
        }
    };

    return (
        <div>
            <div id="upload-container" className="layout-container">
                <div className="box">
                    <h2>Upload Questions with Max Scores</h2>
                    <p className="upload-details">Details here about this</p>
                    <input type="file" id="csvFile1" name="csvFile1" onChange={handleFileChange} />
                </div>
                <div className="box">
                    <h2>Upload Grading Scheme</h2>
                    <p className="upload-details">Details here about this</p>
                    <input type="file" id="csvFile2" name="csvFile2" onChange={handleFileChange} />
                </div>
                <div className="box">
                    <h2>Upload Student Responses</h2>
                    <p className="upload-details">Details here about this</p>
                    <input type="file" id="csvFile3" name="csvFile3" onChange={handleFileChange} />
                </div>
            </div>
            <button id="uploadButton" onClick={handleUpload}>
                Upload CSV
            </button>
        </div>
    );
};

export default UploadButton;
