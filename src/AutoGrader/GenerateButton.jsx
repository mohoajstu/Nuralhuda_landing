import React, { useState } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import './GenerateButton.css';

const GenerateButton = ({ 
    questionsAndMaxScores, 
    gradingScheme, 
    studentResponses, 
    setAllResponses, 
    senate, 
    department, 
    course 
}) => {    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        setResponse('Loading Response...');

        try {
            if (!questionsAndMaxScores || !gradingScheme || !studentResponses) {
                throw new Error('Missing required data for generating responses');
            }

            const prompts = createPrompts(questionsAndMaxScores, gradingScheme, studentResponses);
            console.log('Generated prompts:', prompts);

            const responses = await processAllPrompts(prompts);
            console.log('Received responses:', responses);

            setAllResponses(responses);
        } catch (error) {
            setResponse('Error fetching response. Please try again.');
            console.error('Error generating responses:', error);
        } finally {
            setLoading(false);
        }
    };

    // GenerateButton.js

const createPrompts = (questionsAndMaxScores, gradingScheme, studentResponses) => {
    let prompts = [];
    questionsAndMaxScores.forEach((questionItem, i) => {
        studentResponses.forEach((studentResponse, j) => {
            let question = questionItem['Question'];
            let maxScore = questionItem['Maximum Score'];
            let scheme = gradingScheme.find(s => s['Question Number'] === questionItem['Question Number']);
            let response = studentResponse[`Question ${i + 1} Answer`];

            let prompt = `
                You are an assistant teacher at ${senate} in the ${department} department, teaching the ${course} course. You are tasked with grading student answers based on the provided grading rubric. Each entry in the grading rubric corresponds to a score. Some fields in the rubric are left blank, indicating that you should extrapolate what a response for that score might look like based on the provided examples.

                **Guidelines for Grading:**
                - Compare the student's response to the examples in the rubric.
                - Assess how well the response covers the key concepts mentioned in the question.
                - Evaluate the clarity, completeness, and accuracy of the explanation.
                - Consider the depth of detail provided about any examples or tools mentioned.
                - Assign the score that best matches the quality of the response according to the rubric.

                **Question:** ${question}

                **Rubric:** ${JSON.stringify(scheme, null, 2)}

                **Student Answer:** ${response}

                The maximum score for this question is ${maxScore}. Provide detailed reasoning for the assigned score. Your response should be in JSON format as follows:
                {
                    "reasoning": "Your reasoning here",
                    "score": "Assigned score",
                    "maximumScore": ${maxScore}
                }
            `;
            prompts.push(prompt);
        });
    });
    return prompts;
};


    const processAllPrompts = async (prompts) => {
        const assistantTitle = 'Auto Grader'; // Use appropriate assistant title
        const assistantId = titleToAssistantIDMap[assistantTitle];
        const thread = await createThread(assistantTitle);
        let responses = [];

        for (let index = 0; index < prompts.length; index++) {
            try {
                const response = await createMessage(thread.id, prompts[index], assistantTitle);
                console.log('response:', response);
                let currentResponse = '';
                await new Promise((resolve, reject) => {
                    createRun(thread.id, assistantId, (message) => {
                        console.log('Received message:', message);
                        if (message.text !== 'END_TOKEN') {
                            currentResponse += message.text;
                        } else {
                            responses.push(currentResponse);
                            resolve();
                        }
                    }, (error) => {
                        console.error('Error during run:', error);
                        reject(error);
                    }, assistantTitle);
                });
            } catch (error) {
                console.error('Error processing prompt:', error);
            }
        }
        return responses;
    };

    return (
        <button id="generate-button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Loading... 🚀' : 'Generate'}
        </button>
    );
};

export default GenerateButton;
