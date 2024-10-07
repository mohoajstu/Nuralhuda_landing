import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageStrategy, StorageManager } from './storage';
import GenerateButton from './GenerateButton';
import ResponseContainer from './ResponseContainer';
import ExportButton from './ExportButton';
import UploadQuestions from './UploadQuestions';
import UploadGradingScheme from './UploadGradingScheme';
import UploadRubric from './UploadRubric';
import UploadStudentResponses from './UploadStudentResponses';
import './AutoGraderPage.css';

const AutograderPage = () => {
    const storageManager = new StorageManager(new LocalStorageStrategy());
    const navigate = useNavigate();

    useEffect(() => {
        if (!storageManager.load('onboardingComplete')) {
            navigate('/onboarding');
        }
    }, [navigate, storageManager]);

    const [currentStep, setCurrentStep] = useState('intro');
    const [allResponses, setAllResponses] = useState([]);
    const [questionsAndMaxScores, setQuestionsAndMaxScores] = useState([]);
    const [gradingScheme, setGradingScheme] = useState([]);
    const [studentResponses, setStudentResponses] = useState([]);
    const [rubric, setRubric] = useState([]);
    const [course, setCourse] = useState(storageManager.load('course') || '');
    const [department, setDepartment] = useState(storageManager.load('department') || '');
    const [senate, setSenate] = useState(storageManager.load('senate') || '');

    const handleNextStep = () => {
        const steps = [
            'intro',
            'uploadQuestions',
            'uploadGradingScheme',
            'uploadRubric',
            'uploadStudentResponses',
            'generateResponses',
            'reviewResponses'
        ];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handlePreviousStep = () => {
        const steps = [
            'intro',
            'uploadQuestions',
            'uploadGradingScheme',
            'uploadRubric',
            'uploadStudentResponses',
            'generateResponses',
            'reviewResponses'
        ];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const handleCourseChange = (e) => {
        setCourse(e.target.value);
        storageManager.save('course', e.target.value);
    };

    const handleDepartmentChange = (e) => {
        setDepartment(e.target.value);
        storageManager.save('department', e.target.value);
    };

    const handleSenateChange = (e) => {
        setSenate(e.target.value);
        storageManager.save('senate', e.target.value);
    };

    return (
        <div className="autograder-container">
            <div className="autograder-content">
                {/* Intro Page - Main Instructions */}
                {currentStep === 'intro' && (
                    <div className="autograder-step intro-step">
                        <h1>Welcome to GraderBot</h1>
                        <p>
                            Welcome to GraderBot. You will be guided through the process of uploading the necessary files and then be presented with the grades that GraderBot recommends.
                        </p>
                        <div className="disclaimer">
                            <h4><strong>⚠️ Remember:</strong> GraderBot results should be compared against your grades for the students and not used verbatim without validation.</h4>
                        </div>
                        <div className="details-card">
                            <h3>Your Details</h3>
                            <p>
                                You are grading student responses for 
                                <input
                                    type="text"
                                    value={course}
                                    onChange={handleCourseChange}
                                    placeholder="Enter Course Name"
                                    className="details-input"
                                />
                                within
                                <input
                                    type="text"
                                    value={department}
                                    onChange={handleDepartmentChange}
                                    placeholder="Enter Department Name"
                                    className="details-input"
                                />
                                at
                                <input
                                    type="text"
                                    value={senate}
                                    onChange={handleSenateChange}
                                    placeholder="Enter School Name"
                                    className="details-input"
                                />
                            </p>
                        </div>

                        <div className="instructions">
                            <h3>Using GraderBot</h3>
                            <p>
                                GraderBot works by processing CSV files you upload and passing the data in those files to a Large Language Model. We need at least 3 files from you, but all 4 are preferred:
                            </p>
                            <ol>
                                <li><strong>Questions</strong> and the associated <strong>maximum score</strong> for each question (required).</li>
                                <li>A <strong>Grading Scheme</strong> (optional if a rubric is provided).</li>
                                <li>A <strong>Rubric</strong> (optional if a grading scheme is provided).</li>
                                <li><strong>Student Responses</strong> associated with their student number (required).</li>
                            </ol>
                        </div>
                        <button className="primary-button" onClick={handleNextStep}>Get Started</button>
                    </div>
                )}

                {/* Upload Questions Page */}
                {currentStep === 'uploadQuestions' && (
                    <UploadQuestions
                        setQuestionsAndMaxScores={setQuestionsAndMaxScores}
                        handleNextStep={handleNextStep}
                        handlePreviousStep={handlePreviousStep}
                    />
                )}

                {/* Upload Grading Scheme Page */}
                {currentStep === 'uploadGradingScheme' && (
                    <UploadGradingScheme
                        setGradingScheme={setGradingScheme}
                        handleNextStep={handleNextStep}
                        handlePreviousStep={handlePreviousStep}
                    />
                )}

                {/* Upload Rubric Page */}
                {currentStep === 'uploadRubric' && (
                    <UploadRubric
                        setRubric={setRubric}
                        handleNextStep={handleNextStep}
                        handlePreviousStep={handlePreviousStep}
                    />
                )}

                {/* Upload Student Responses Page */}
                {currentStep === 'uploadStudentResponses' && (
                    <UploadStudentResponses
                        setStudentResponses={setStudentResponses}
                        handleNextStep={handleNextStep}
                        handlePreviousStep={handlePreviousStep}
                    />
                )}

                {/* Generate Responses Page */}
                {currentStep === 'generateResponses' && (
                    <div className="autograder-step">
                        <h2>Generate Responses</h2>
                        <GenerateButton
                            questionsAndMaxScores={questionsAndMaxScores}
                            gradingScheme={gradingScheme}
                            studentResponses={studentResponses}
                            setAllResponses={(responses) => {
                                const parsedResponses = responses.map(response => {
                                    try {
                                        return JSON.parse(response);
                                    } catch (error) {
                                        console.error("Failed to parse response:", response, error);
                                        return null;
                                    }
                                }).filter(r => r !== null);
                                setAllResponses(parsedResponses);
                            }}
                        />
                        <div className="navigation-buttons">
                            <button className="primary-button" onClick={handleNextStep}>Next</button>
                            <button className="secondary-button" onClick={handlePreviousStep}>Back</button>
                        </div>
                    </div>
                )}

                {/* Review Responses Page */}
{currentStep === 'reviewResponses' && (
    <div className="autograder-step">
        <h2>Review Grading Results</h2>
        <ResponseContainer responses={allResponses} />
        <ExportButton responses={allResponses} />
        <button className="secondary-button" onClick={handlePreviousStep}>Back</button>
    </div>
)}

            </div>
        </div>
    );
};

export default AutograderPage;
