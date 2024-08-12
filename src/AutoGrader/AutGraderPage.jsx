import React, { useState, useEffect } from 'react';
import { LocalStorageStrategy, StorageManager } from './storage';
import GenerateButton from './GenerateButton';
import ResponseContainer from './ResponseContainer';
import ExportButton from './ExportButton';
import UploadButton from './UploadButton';
import './AutoGraderPage.css';

const AutograderPage = () => {
    const storageManager = new StorageManager(new LocalStorageStrategy());
    const [allResponses, setAllResponses] = useState([]);
    const [subject, setSubject] = useState(storageManager.load('subject') || '');
    const [courseLevel, setCourseLevel] = useState(storageManager.load('courseLevel') || '');
    const [questionsAndMaxScores, setQuestionsAndMaxScores] = useState(storageManager.load('questionsAndMaxScores') || []);
    const [gradingScheme, setGradingScheme] = useState(storageManager.load('gradingScheme') || []);
    const [studentResponses, setStudentResponses] = useState(storageManager.load('studentResponses') || []);

    useEffect(() => {
        storageManager.save('subject', subject);
        storageManager.save('courseLevel', courseLevel);
        storageManager.save('questionsAndMaxScores', questionsAndMaxScores);
        storageManager.save('gradingScheme', gradingScheme);
        storageManager.save('studentResponses', studentResponses);
    }, [subject, courseLevel, questionsAndMaxScores, gradingScheme, studentResponses]);

    const handleSubjectChange = (e) => setSubject(e.target.value);
    const handleCourseLevelChange = (e) => setCourseLevel(e.target.value);

    console.log('Rendering AutograderPage with subject:', subject, 'and courseLevel:', courseLevel);

    return (
        <div className="autograder-page">
            <h1>GraderBot</h1>
            <p id="description">
                I am grading student's answers for a course in 
                <input 
                    type="text" 
                    id="subject" 
                    value={subject} 
                    onChange={handleSubjectChange} 
                    placeholder="Subject"
                /> 
                at level 
                <input 
                    type="text" 
                    id="courseLevel" 
                    value={courseLevel} 
                    onChange={handleCourseLevelChange} 
                    placeholder="Course Level"
                />.
            </p>
            <UploadButton 
                storageManager={storageManager} 
                setQuestionsAndMaxScores={setQuestionsAndMaxScores}
                setGradingScheme={setGradingScheme}
                setStudentResponses={setStudentResponses}
            />
            <GenerateButton 
                questionsAndMaxScores={questionsAndMaxScores}
                gradingScheme={gradingScheme}
                studentResponses={studentResponses}
                setAllResponses={setAllResponses}
            />
            <ResponseContainer responses={allResponses} />
            <ExportButton responses={allResponses} />
        </div>
    );
};

export default AutograderPage;
