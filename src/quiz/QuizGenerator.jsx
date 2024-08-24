import React, { useState, useEffect } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation, ShortAnswer } from './QuizComponents';
import { db } from '../config/firebase-config';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import './QuizGenerator.css';
import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';
import { exportToPDF } from './QuizExport';


const QuizGenerator = () => {
  const token = sessionStorage.getItem('googleAuthToken');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [exportWithAnswers, setExportWithAnswers] = useState('questions');
  const [quizLink, setQuizLink] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuizData, setEditedQuizData] = useState(null);
  const [quizDocId, setQuizDocId] = useState(null);

  useEffect(() => {
    if (quizData) {
      setEditedQuizData(JSON.parse(JSON.stringify(quizData)));
    }
  }, [quizData]);

  const handleTextChange = (e) => setText(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleExportChange = (e) => setExportWithAnswers(e.target.value);

  const readDOCX = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      return text;
    } catch (error) {
      console.error("Error reading DOCX file:", error);
      setError('Failed to read the DOCX file. Please try again.');
    }
  };

  /*
  const readPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let text = '';
    for (const page of pages) {
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(' ');
    }
    return text;
  };
  */
  
  const readFileContent = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const type = await fileTypeFromBuffer(buffer);
  
      if (type.mime === 'application/pdf') {
        console.log('Reading PDF file...');
      } else if (type.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await readDOCX(file);
      } else {
        return await file.text();
      }
    } catch (error) {
      console.error("Error reading file:", error);
      setError('Failed to read the file. Please try again.');
    }
  };  
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const assistantTitle = 'Quiz Generator';
    setResponseBuffer('');
    try {
      const thread = await createThread(assistantTitle);
      let messageContent = text;
  
      if (file) {
        messageContent = await readFileContent(file);
      }
  
      await createMessage(thread.id, messageContent, assistantTitle);
      await createRun(thread.id, titleToAssistantIDMap[assistantTitle], handleMessage, handleError, assistantTitle);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError('An error occurred while generating the quiz. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleMessage = (message) => {
    setResponseBuffer((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        setIsLoading(false);
        console.log("Accumulated response buffer:", prevAccumulated);
        try {
          const response = JSON.parse(prevAccumulated);
          setQuizData(response);
          saveQuizToFirestore(response);
        } catch (error) {
          console.error("Error parsing response:", error);
          setError('An error occurred while parsing the quiz data. Please try again.');
        }
        return '';
      } else {
        return prevAccumulated + message.text;
      }
    });
  };

  const handleError = (error) => {
    console.error("Error handling message:", error);
    setError('An error occurred while handling the response. Please try again.');
    setIsLoading(false);
  };

  const saveQuizToFirestore = async (quiz) => {
    try {
      const stringifiedQuiz = JSON.stringify(quiz);
      const docRef = await addDoc(collection(db, "quizzes"), { data: stringifiedQuiz });
      console.log("Document written with ID: ", docRef.id);
      setQuizDocId(docRef.id);
      const newQuizLink = `${window.location.origin}/quiz/${docRef.id}`;
      setQuizLink(newQuizLink);
    } catch (error) {
      console.error("Error saving quiz: ", error);
      setError('An error occurred while saving the quiz. Please try again.');
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = () => {
    try {
      const unansweredQuestions = quizData.questions.some((question, index) => {
        if (question.type === 'matching') {
          return !userAnswers[index] || userAnswers[index].length === 0;
        }
        return userAnswers[index] === undefined || userAnswers[index] === '';
      });
  
      if (unansweredQuestions) {
        alert('Please answer all questions before submitting.');
        return;
      }
  
      let newScore = 0;
      quizData.questions.forEach((question, index) => {
        if (question.type === 'matching') {
          if (JSON.stringify(userAnswers[index]) === JSON.stringify(question.correctMatches)) {
            newScore++;
          }
        } else if (question.type === 'fill-in-the-blank') {
          if (userAnswers[index]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
            newScore++;
          }
        } else if (question.type === 'true-false') {
          if (userAnswers[index] === (question.correctAnswer ? 0 : 1)) {
            newScore++;
          }
        } else if (question.type === 'short-answer') {
          newScore += 0; // Short answers are manually graded
        } else if (userAnswers[index] === question.correctAnswer) {
          newScore++;
        }
      });
      setScore(newScore);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError('An error occurred while submitting the quiz. Please try again.');
    }
  };

  const isCorrect = (questionIndex) => {
    try {
      const question = quizData.questions[questionIndex];
      if (question.type === 'matching') {
        return JSON.stringify(userAnswers[questionIndex]) === JSON.stringify(question.correctMatches);
      }
      if (question.type === 'fill-in-the-blank') {
        return userAnswers[questionIndex]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }
      if (question.type === 'true-false') {
        return userAnswers[questionIndex] === (question.correctAnswer ? 0 : 1);
      }
      return userAnswers[questionIndex] === question.correctAnswer;
    } catch (error) {
      console.error("Error checking answer correctness:", error);
      setError('An error occurred while checking the answer. Please try again.');
      return false;
    }
  };

  const copyQuizLinkToClipboard = () => {
    if (quizLink) {
      navigator.clipboard.writeText(quizLink).then(() => {
        alert('Quiz link copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
        alert('Failed to copy quiz link. Please try again.');
      });
    } else {
      alert('No quiz link available. Please generate a quiz first.');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedQuizData(JSON.parse(JSON.stringify(quizData)));
    }
  };
  const handleQuestionEdit = (index, field, value) => {
    setEditedQuizData(prevData => {
      const newData = { ...prevData };
      newData.questions[index][field] = value;
      return newData;
    });
  };

  const handleOptionEdit = (questionIndex, optionIndex, value) => {
    setEditedQuizData(prevData => {
      const newData = { ...prevData };
      if (newData.questions[questionIndex].type === 'multiple-choice') {
        newData.questions[questionIndex].options[optionIndex] = value;
      } else if (newData.questions[questionIndex].type === 'matching') {
        if (optionIndex < newData.questions[questionIndex].columnA.length) {
          newData.questions[questionIndex].columnA[optionIndex] = value;
        } else {
          newData.questions[questionIndex].columnB[optionIndex - newData.questions[questionIndex].columnA.length] = value;
        }
      }
      return newData;
    });
  };

  const handleCorrectAnswerEdit = (questionIndex, value) => {
    setEditedQuizData(prevData => {
      const newData = { ...prevData };
      const questionType = newData.questions[questionIndex].type;
      switch (questionType) {
        case 'multiple-choice':
          newData.questions[questionIndex].correctAnswer = parseInt(value);
          break;
        case 'true-false':
          newData.questions[questionIndex].correctAnswer = value === 'true';
          break;
        case 'fill-in-the-blank':
        case 'short-answer':
          newData.questions[questionIndex].correctAnswer = value;
          break;
        case 'matching':
          try {
            newData.questions[questionIndex].correctMatches = JSON.parse(value);
          } catch (error) {
            console.error("Error parsing matching correct answers:", error);
          }
          break;
        default:
          console.warn(`Unhandled question type: ${questionType}`);
      }
      return newData;
    });
  };

  const handleExplanationEdit = (questionIndex, value) => {
    setEditedQuizData(prevData => {
      const newData = { ...prevData };
      newData.questions[questionIndex].explanation = value;
      return newData;
    });
  };

  const handleSaveEdits = async () => {
    setQuizData(editedQuizData);
    setIsEditing(false);
    try {
      const stringifiedQuiz = JSON.stringify(editedQuizData);
      await updateDoc(doc(db, "quizzes", quizDocId), { data: stringifiedQuiz });
      alert('Quiz updated successfully!');
    } catch (error) {
      console.error("Error updating quiz: ", error);
      setError('An error occurred while updating the quiz. Please try again.');
    }
  };

  const createGoogleForm = async () => {
    if (!quizData) {
      alert('Please generate a quiz first.');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    const accessToken = sessionStorage.getItem('googleAuthToken');
  
    if (!accessToken) {
      setError('Access token not found. Please authenticate with Google.');
      setIsLoading(false);
      return;
    }
  
    const maxRetries = 3; // Number of retries
    let attempt = 0;
    let success = false;
  
    while (attempt < maxRetries && !success) {
      try {
        attempt++;
        console.log(`Attempt ${attempt} to create Google Form...`);
  
        // Create the form
        const createFormResponse = await fetch(
          'https://forms.googleapis.com/v1/forms',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              info: {
                title: quizData.title || 'New Quiz',
              },
            }),
          }
        );
  
        if (!createFormResponse.ok) {
          throw new Error(`Error creating form: ${createFormResponse.statusText}`);
        }
  
        const createFormData = await createFormResponse.json();
        const formId = createFormData.formId;
  
        // Update the form settings with quiz settings
        console.log("Trying to update form settings");
        await updateQuizSettings(formId, accessToken);
  
        // Add questions to the form
        console.log("Trying to add questions");
        await addQuestionsToGoogleForm(formId, accessToken);
  
        // Get the form's URL
        const formUrl = `https://docs.google.com/forms/d/${formId}/edit`;
  
        setQuizLink(formUrl);
        alert('Google Form created successfully!');
        success = true;
      } catch (error) {
        console.error('Error creating Google Form:', error);
        if (attempt >= maxRetries) {
          setError('Failed to create Google Form after multiple attempts. Please check your permissions and try again.');
        } else {
          console.log('Retrying...');
        }
      }
    }
  
    setIsLoading(false);
  };  
  

  const addQuestionsToGoogleForm = async (formId, accessToken) => {
    const requests = quizData.questions.map((q, index) => {
        let item = {
            title: q.question,
        };

        switch (q.type) {
            case 'multiple-choice':
                item.questionItem = {
                    question: {
                        required: true,
                        choiceQuestion: {
                            type: 'RADIO',
                            options: q.options.map(option => ({ value: option })),
                            shuffle: true,
                        },
                        grading: {
                            pointValue: 1,  // Set the point value
                            correctAnswers: {
                                answers: [
                                    {
                                        value: q.options[q.correctAnswer]  // Assign the correct answer
                                    }
                                ]
                            },
                            whenRight: {
                                text: "Correct!",  // Optional: Feedback for correct answer
                            },
                            whenWrong: {
                                text: "Incorrect. Please try again.",  // Optional: Feedback for wrong answer
                            }
                        }
                    },
                };
                break;
            case 'true-false':
                item.questionItem = {
                    question: {
                        required: true,
                        choiceQuestion: {
                            type: 'RADIO',
                            options: [
                                { value: 'True' },
                                { value: 'False' },
                            ],
                            shuffle: false,
                        },
                        grading: {
                            pointValue: 1,  // Set the point value
                            correctAnswers: {
                                answers: [
                                    {
                                        value: q.correctAnswer ? 'True' : 'False'  // Assign the correct answer
                                    }
                                ]
                            }
                        }
                    },
                };
                break;
            case 'fill-in-the-blank':
            case 'short-answer':
                item.questionItem = {
                    question: {
                        required: true,
                        textQuestion: {
                            paragraph: false,
                        },
                        grading: {
                            pointValue: 1,  // Set the point value
                            correctAnswers: {
                                answers: [
                                    {
                                        value: q.correctAnswer  // Assign the correct answer
                                    }
                                ]
                            },
                            generalFeedback: {
                                text: "Your response has been recorded and will be reviewed.",  // Optional: General feedback
                            }
                        }
                    },
                };
                break;
            case 'matching':
                item.questionGroupItem = {
                    grid: {
                        columns: {
                            type: 'RADIO',
                            options: q.columnB.map(option => ({ value: option })),
                        },
                        shuffleQuestions: false,
                    },
                    questions: q.columnA.map(columnAItem => ({
                        rowQuestion: {
                            title: columnAItem,
                        },
                    })),
                };
                // Note: Matching questions do not have native grading support in Google Forms.
                break;
            default:
                console.warn(`Unhandled question type: ${q.type}`);
                return null;
        }

        return {
            createItem: {
                item,
                location: {
                    index,
                },
            },
        };
    }).filter(request => request !== null);

    try {
        const response = await fetch(
            `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Error adding questions: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error adding questions to Google Form:', error);
        throw error;
    }
};

  const updateQuizSettings = async (formId, accessToken) => {
  try {
    const response = await fetch(
      `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateSettings: {
                settings: {
                  quizSettings: {
                    isQuiz: true,                  
                  },
                },
                updateMask: "quizSettings.isQuiz",
              }
            }
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating quiz settings: ${response.statusText}`);
    }

    console.log('Quiz settings updated successfully');
  } catch (error) {
    console.error('Error updating quiz settings:', error);
    throw error;
  }
};

  

  return (
    <div className="quiz-generator-container">
      <header className="quiz-generator-header">
        <h2>Quiz Generator</h2>
        {quizData && (
          <button
            onClick={handleEditToggle}
            className="edit-button"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Quiz'}
          </button>
        )}
      </header>
      <div className="input-section">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text content here or upload a file"
          rows={6}
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept=".txt,.doc,.docx,.pdf"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
      {quizData && (
        <div className="quiz-content">
          <h2>
            {isEditing ? (
              <input
                type="text"
                value={editedQuizData.title}
                onChange={(e) => setEditedQuizData({...editedQuizData, title: e.target.value})}
                className="edit-input"
              />
            ) : quizData.title}
          </h2>
          {(isEditing ? editedQuizData : quizData).questions.map((q, index) => (
            <QuizQuestion
              key={index}
              question={isEditing ? (
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionEdit(index, 'question', e.target.value)}
                  className="edit-input"
                />
              ) : q.question}
              index={index}
            >
              {q.type === 'multiple-choice' && (
                <div>
                  <MultipleChoice
                    options={q.options}
                    onChange={(answer) => handleAnswerChange(index, answer)}
                    userAnswer={userAnswers[index]}
                    correctAnswer={submitted ? q.correctAnswer : null}
                    isDisabled={submitted || isEditing}
                    questionIndex={index}
                    isEditing={isEditing}
                    onOptionEdit={(optionIndex, value) => handleOptionEdit(index, optionIndex, value)}
                  />
                  {isEditing && (
                    <div className="edit-options">
                      {q.options.map((option, optionIndex) => (
                        <input
                          key={optionIndex}
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionEdit(index, optionIndex, e.target.value)}
                          className="edit-input"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {q.type === 'true-false' && (
                <TrueFalse
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted || isEditing}
                  questionIndex={index}
                />
              )}
              {q.type === 'fill-in-the-blank' && (
                <FillInTheBlank
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted || isEditing}
                />
              )}
              {q.type === 'matching' && (
                <div>
                  <Matching
                    columnA={q.columnA}
                    columnB={q.columnB}
                    onChange={(matches) => handleAnswerChange(index, matches)}
                    userMatches={userAnswers[index]}
                    correctMatches={submitted ? q.correctMatches : null}
                    isDisabled={submitted || isEditing}
                    isEditing={isEditing}
                    onOptionEdit={(optionIndex, value) => handleOptionEdit(index, optionIndex, value)}
                  />
                  {isEditing && (
                    <div className="edit-matching">
                      <div className="column-a">
                        <h4>Column A</h4>
                        {q.columnA.map((item, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={item}
                            onChange={(e) => handleOptionEdit(index, optionIndex, e.target.value)}
                            className="edit-input"
                          />
                        ))}
                      </div>
                      <div className="column-b">
                        <h4>Column B</h4>
                        {q.columnB.map((item, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={item}
                            onChange={(e) => handleOptionEdit(index, optionIndex + q.columnA.length, e.target.value)}
                            className="edit-input"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {q.type === 'short-answer' && (
                <ShortAnswer
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  isDisabled={submitted}
                  correctAnswer={q.correctAnswer}
                  explanation={q.explanation}
                  submitted={submitted}
                />
              )}
              {submitted && q.type !== 'short-answer' && (
                <div className={`mt-2 p-2 rounded ${isCorrect(index) ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect(index) ? 'Correct!' : 'Incorrect'}
                  <Explanation text={q.explanation} />
                </div>
              )}
              {isEditing && (
                <div className="edit-section">
                  <label>Correct Answer:</label>
                  {q.type === 'multiple-choice' && (
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleCorrectAnswerEdit(index, e.target.value)}
                      className="edit-input"
                    >
                      {q.options.map((_, i) => (
                        <option key={i} value={i}>{i + 1}</option>
                      ))}
                    </select>
                  )}
                  {q.type === 'true-false' && (
                    <select
                      value={q.correctAnswer.toString()}
                      onChange={(e) => handleCorrectAnswerEdit(index, e.target.value)}
                      className="edit-input"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  )}
                  {(q.type === 'fill-in-the-blank' || q.type === 'short-answer') && (
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => handleCorrectAnswerEdit(index, e.target.value)}
                      className="edit-input"
                    />
                  )}
                  {q.type === 'matching' && (
                    <textarea
                      value={JSON.stringify(q.correctMatches)}
                      onChange={(e) => handleCorrectAnswerEdit(index, e.target.value)}
                      className="edit-input"
                      rows={3}
                    />
                  )}
                  
                  <label>Explanation:</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => handleExplanationEdit(index, e.target.value)}
                    className="edit-input"
                    rows={3}
                  />
                </div>
              )}
            </QuizQuestion>
          ))}
          {!submitted && !isEditing && (
            <button
              onClick={handleQuizSubmit}
              className="submit-button"
            >
              Submit Quiz
            </button>
          )}
          {submitted && (
            <div className="score-section">
              <h3>Your Score: {score} / {quizData.questions.length}</h3>
              <p>Note: Short answer questions will be manually graded.</p>
            </div>
          )}
          {isEditing && (
            <button
              onClick={handleSaveEdits}
              className="save-button"
            >
              Save Changes
            </button>
          )}
          <div className="export-section">
            <select onChange={handleExportChange} value={exportWithAnswers}>
              <option value="questions">Export Questions Only</option>
              <option value="answers">Export Questions with Answers</option>
            </select>
            <button
              onClick={() => exportToPDF(quizData, exportWithAnswers)}
              className="export-button"
            >
              Export to PDF
            </button>
            <button
              onClick={copyQuizLinkToClipboard}
              className="export-button"
            >
              Export Quiz Link
            </button>
            <button 
              onClick={createGoogleForm} 
              className="export-button"
              disabled={isLoading}
            >
              {isLoading ? 'Exporting...' : 'Export to Google Form'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
