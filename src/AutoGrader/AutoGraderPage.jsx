import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiStepUploadPage from './MultiStepUploadPage';
import GenerateButton from './GenerateButton';
import ResponseContainer from './ResponseContainer';
import ExportButton from './ExportButton';
import './AutoGraderPage.css';
import autograderIMG from '../img/auto.png';

const AutograderPage = () => {
    const [allResponses, setAllResponses] = useState([]);
    const [questionsAndMaxScores, setQuestionsAndMaxScores] = useState([]);
    const [gradingScheme, setGradingScheme] = useState([]);
    const [rubric, setRubric] = useState([]);
    const [studentResponses, setStudentResponses] = useState([]);

    const handleUploadsComplete = (processedData) => {
        setQuestionsAndMaxScores(processedData.questionsFile || []);
        setGradingScheme(processedData.gradingSchemeFile || []);
        setRubric(processedData.rubricFile || []);
        setStudentResponses(processedData.studentResponsesFile || []);
    };

    return (
        <div className="autograder-page">

            <header className="graderbot-header">
                <h1 className="graderbot-title"> GraderBot  </h1> 
                <img src={autograderIMG} alt="GraderBot" className="graderbot-logo" />    
            </header>
            
            <MultiStepUploadPage onComplete={handleUploadsComplete} />

            <GenerateButton
                questionsAndMaxScores={questionsAndMaxScores}
                gradingScheme={gradingScheme}
                rubric={rubric}
                studentResponses={studentResponses}
                setAllResponses={setAllResponses}
            />
            <ResponseContainer responses={allResponses} />
            <ExportButton responses={allResponses} />
        </div>
    );
};

export default AutograderPage;
