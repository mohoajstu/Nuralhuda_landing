import React, { useState, useRef } from 'react';
import processCSV from './processCSV'; // Import the CSV processor
import './MultiStepUploadPage.css';

const MultiStepUploadPage = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [files, setFiles] = useState({});
    const [isComplete, setIsComplete] = useState(false); // New state variable
    const fileInputRef = useRef(null); // Reference to the file input element

    // Content map for the steps
    const steps = [
        {
            title: 'Upload Questions with Maximum Scores',
            description:
                'A CSV file containing 3 columns: "Question Number", "Question", and "Maximum Score". Each question on its own row with each column completed.',
            required: true,
            fileKey: 'questionsFile',
            exampleFileLink: '/sample-data/1-questions-and-max-score.csv',
        },
        {
            title: 'Upload Grading Scheme',
            description:
                'A CSV file containing multiple columns. The header for column one must be "Question Number". The remaining column headers are the scores that the answers in that column would receive. Provide as many examples of answers per grade as possible for better results.',
            required: false,
            fileKey: 'gradingSchemeFile',
            exampleFileLink: '/sample-data/1-grading-scheme.csv',
        },
        {
            title: 'Upload Rubric',
            description:
                'A CSV file containing 1 column with the header "Rubric". Below that should be your grading rubric.',
            required: false,
            fileKey: 'rubricFile',
            exampleFileLink: '/sample-data/grading-rubric.csv',
        },
        {
            title: 'Upload Student Responses',
            description:
                'A CSV file containing multiple columns. The first column must be "Student Number". You must then have 1 column per question such as "Question 1 Answer", "Question 2 Answer", etc. One row per student, with each of their answers in separate columns.',
            required: true,
            fileKey: 'studentResponsesFile',
            exampleFileLink: '/sample-data/1-student-answers.csv',
        },
    ];

    const handleFileChange = (e, fileKey) => {
        const fileList = e.target.files;
        setFiles((prevFiles) => ({
            ...prevFiles,
            [fileKey]: fileList,
        }));
    };

    const handleRemoveFile = (fileKey) => {
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            delete updatedFiles[fileKey];
            return updatedFiles;
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            // Clear the file input visually when moving forward
            setTimeout(() => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset the visual input element
                }
            }, 100); // Delay to avoid timing conflicts
        } else {
            const jsonData = {};
            processCSV(files, jsonData)
                .then((processedData) => {
                    onComplete(processedData);
                    setIsComplete(true); // Set completion state
                })
                .catch((error) => {
                    console.error('Error processing files:', error);
                });
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            // No need to reset the file input when moving backward
        }
    };

    const handleSkipStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            // Clear the file input visually when skipping
            setTimeout(() => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 100);
        }
    };

    return (
        <div className="multi-step-upload-container">
            <div className="progress-indicator">
                {steps.map((step, index) => (
                    <div key={index} className={`step ${currentStep === index ? 'active' : ''}`}>
                        <div className="step-number">{index + 1}</div>
                        <div className="step-title">{step.title}</div>
                    </div>
                ))}
            </div>

            <div className="upload-content">
                {isComplete ? (
                    <div className="completion-message">
                        <h2>All files uploaded successfully!</h2>
                        <p>Please click the <strong>'Generate'</strong> button to proceed.</p>
                    </div>
                ) : (
                    <>
                        <h2>
                            Step {currentStep + 1}: {steps[currentStep].title}{' '}
                            <span
                                className={`mini-badge ${
                                    steps[currentStep].required ? 'required' : 'recommended'
                                }`}
                            >
                                {steps[currentStep].required ? 'Required' : 'Recommended'}
                            </span>
                        </h2>

                        <div className="upload-and-instructions">
                            <div className="file-upload">
                                {files[steps[currentStep].fileKey] ? (
                                    <div className="uploaded-file-info">
                                        <p>Uploaded: {files[steps[currentStep].fileKey][0].name}</p>
                                        <button
                                            className="remove-file-button"
                                            onClick={() => handleRemoveFile(steps[currentStep].fileKey)}
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        type="file"
                                        ref={fileInputRef} // Reference the file input
                                        onChange={(e) => handleFileChange(e, steps[currentStep].fileKey)}
                                        className="file-input"
                                        required={steps[currentStep].required}
                                    />
                                )}
                            </div>

                            <div className="file-description">
                                <h3>CSV Instructions</h3>
                                <p className="help">{steps[currentStep].description}</p>
                            
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="navigation-buttons">
                {currentStep > 0 && !isComplete && (
                    <button className="secondary-button" onClick={handlePreviousStep}>
                        Back
                    </button>
                )}
                {!isComplete &&  (
                    <>
                        {steps[currentStep].required === false && currentStep < steps.length - 2 && (
                            <button className="secondary-button" onClick={handleSkipStep}>
                                Skip
                            </button>
                        )}
                        <button className="primary-button" onClick={handleNextStep}>
                            {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MultiStepUploadPage;
