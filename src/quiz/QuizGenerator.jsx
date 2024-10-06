import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config';
import {
  createThread,
  createMessage,
  createRun,
  titleToAssistantIDMap,
} from '../chat/openAIUtils';
import {
  QuizQuestion,
  MultipleChoice,
  TrueFalse,
  FillInTheBlank,
  Matching,
  Explanation,
  ShortAnswer,
} from './QuizComponents';
import { db } from '../config/firebase-config';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import './QuizGenerator.css';
import { exportToPDF } from './QuizExport';
import { FaPaperclip, FaExclamationCircle, FaGraduationCap, FaListAlt, FaAlignLeft } from 'react-icons/fa'; // Import icons
import quizGenIMG from '../img/quiz-gen.png';
import LoginModal from '../login/LoginModal'; // Assuming you have a LoginModal component
import { readFileContent } from '../utils/fileUtils';

const QuizGenerator = () => {
  const [user] = useAuthState(auth); // Get the authenticated user

  const [text, setText] = useState('');
  const [mainContentFile, setMainContentFile] = useState(null);
  const [additionalCriteria, setAdditionalCriteria] = useState('');
  const [additionalCriteriaFile, setAdditionalCriteriaFile] = useState(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [gradeLevelFile, setGradeLevelFile] = useState(null);
  const [standards, setStandards] = useState('');
  const [standardsFile, setStandardsFile] = useState(null);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingGoogleForm, setIsExportingGoogleForm] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const [mainContentPreview, setMainContentPreview] = useState('');
  const [additionalCriteriaPreview, setAdditionalCriteriaPreview] = useState('');
  const [gradeLevelPreview, setGradeLevelPreview] = useState('');
  const [standardsPreview, setStandardsPreview] = useState('');

  useEffect(() => {
    if (quizData) {
      setEditedQuizData(JSON.parse(JSON.stringify(quizData)));
    }
  }, [quizData]);

  const handleTextChange = (e) => setText(e.target.value);
  const handleAdditionalCriteriaChange = (e) => setAdditionalCriteria(e.target.value);
  const handleGradeLevelChange = (e) => setGradeLevel(e.target.value);
  const handleStandardsChange = (e) => setStandards(e.target.value);
  const handleExportChange = (e) => setExportWithAnswers(e.target.value);


  const handleFileChange = async (e, setFileState, setPreviewState) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      setFileState(file);
      const content = await readFileContent(file);
      setPreviewState(content);
    }
  };

  const handleFileDrop = async (e, setFileState, setPreviewState) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      console.log('File dropped:', file.name);
      setFileState(file);
      const content = await readFileContent(file);
      setPreviewState(content);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !mainContentFile) { // Check for both text and file
      setError('Content is required to generate a quiz.');
      return;
    }
  
    setIsGeneratingQuiz(true);
    setError('');
    setSuccessMessage('');
    const assistantTitle = 'Quiz Generator';
  
    try {
      let messageContent = text;

      if (mainContentFile) { // Prioritize file content if file is uploaded
        messageContent = await readFileContent(mainContentFile);
        console.log("File content being used in quiz generation:", messageContent); // Log file content
      }
  
      // Check if messageContent is still empty after trying to load the file content
      if (!messageContent.trim()) {
        setError('Content is required to generate a quiz.');
        setIsGeneratingQuiz(false);
        return;
      }
  
      const thread = await createThread(assistantTitle);
      let additionalCriteriaContent = additionalCriteria;
      if (additionalCriteriaFile) {
        additionalCriteriaContent = await readFileContent(additionalCriteriaFile);
      }
  
      let gradeLevelContent = gradeLevel;
      if (gradeLevelFile) {
        gradeLevelContent = await readFileContent(gradeLevelFile);
      }
  
      let standardsContent = standards;
      if (standardsFile) {
        standardsContent = await readFileContent(standardsFile);
      }
  
      const compiledPrompt = `
      Grade Level: ${gradeLevelContent || 'N/A'}
      Additional Criteria: ${additionalCriteriaContent || 'N/A'}
      Standards to Align To: ${standardsContent || 'N/A'}
      Content: ${messageContent}
      `;
  
      await createMessage(thread.id, compiledPrompt, assistantTitle);
      await createRun(
        thread.id,
        titleToAssistantIDMap[assistantTitle],
        handleMessage,
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('An error occurred while generating the quiz. Please try again.');
      setIsGeneratingQuiz(false);
    }
  };
  

  const handleMessage = (message) => {
    setResponseBuffer((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        setIsGeneratingQuiz(false);
        console.log('Accumulated response buffer:', prevAccumulated);
        try {
          const response = JSON.parse(prevAccumulated);
          setQuizData(response);
          saveQuizToFirestore(response, user.uid); // Pass user ID here
          setSuccessMessage('Quiz generated successfully!');
        } catch (error) {
          console.error('Error parsing response:', error);
          setError('An error occurred while parsing the quiz data. Please try again.');
        }
        return '';
      } else {
        return prevAccumulated + message.text;
      }
    });
  };

  const handleError = (error) => {
    console.error('Error handling message:', error);
    setError('An error occurred while handling the response. Please try again.');
    setIsGeneratingQuiz(false);
  };

  const saveQuizToFirestore = async (quiz, userId) => {
    try {
      const stringifiedQuiz = JSON.stringify(quiz);
      const docRef = await addDoc(collection(db, 'quizzes'), { data: stringifiedQuiz });
      console.log('Document written with ID: ', docRef.id);
      setQuizDocId(docRef.id);
      const newQuizLink = `${window.location.origin}/quiz/${docRef.id}`;
      setQuizLink(newQuizLink);

      // Ensure the user's document exists and add quiz to QuizzesOwned
      const userDocRef = doc(db, 'users', userId); // Use the actual user ID
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {}); // Initialize user document if it doesn't exist
      }

      // Add quiz to the QuizzesOwned subcollection
      const userQuizRef = doc(db, 'users', userId, 'QuizzesOwned', docRef.id);
      await setDoc(userQuizRef, { quizId: docRef.id, title: quiz.title });
    } catch (error) {
      console.error('Error saving quiz: ', error);
      setError('An error occurred while saving the quiz. Please try again.');
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = async () => {
    setIsSubmittingQuiz(true);
    try {
      const unansweredQuestions = quizData.questions.some((question, index) => {
        if (question.type === 'matching') {
          return !userAnswers[index] || userAnswers[index].length === 0;
        }
        return userAnswers[index] === undefined || userAnswers[index] === '';
      });

      if (unansweredQuestions) {
        alert('Please answer all questions before submitting.');
        setIsSubmittingQuiz(false);
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
      setSuccessMessage('Quiz submitted successfully!');

      // Save to user's QuizzesSubmitted
      const userSubmissionRef = doc(db, "users", user.uid, "QuizzesSubmitted", quizDocId);  // Use the actual user ID
      await setDoc(userSubmissionRef, { quizId: quizDocId, score, answers: userAnswers });

      // Save to Quiz's Submissions subcollection
      const quizSubmissionRef = doc(db, "quizzes", quizDocId, "Submissions", user.uid);  // Use the actual user ID
      await setDoc(quizSubmissionRef, { userId: user.uid, score, answers: userAnswers });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError('An error occurred while submitting the quiz. Please try again.');
    }
    setIsSubmittingQuiz(false);
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
  
    setIsExportingGoogleForm(true);
    setError('');
    setSuccessMessage('');
  
    const accessToken = sessionStorage.getItem('googleAuthToken');
    const tokenExpiryTime = sessionStorage.getItem('tokenExpiryTime'); // Assuming you store this on login
  
    // Check if the access token is missing or expired
    if (!accessToken || (tokenExpiryTime && new Date() > new Date(tokenExpiryTime))) {
      // Show the login modal to let the user re-authenticate
      setIsLoginModalOpen(true);
      setError('Access token is invalid or expired. Please authenticate again.');
      setIsExportingGoogleForm(false);
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
        setSuccessMessage('Google Form created successfully!');
      } catch (error) {
        console.error('Error creating Google Form:', error);
        if (attempt >= maxRetries) {
          setError('Failed to create Google Form after multiple attempts. Please check your permissions and try again.');
        } else {
          console.log('Retrying...');
        }
      }
    }
  
    setIsExportingGoogleForm(false);
  };
  

  const addQuestionsToGoogleForm = async (formId, accessToken) => {
    const requests = quizData.questions.map((q, index) => {
      let item = {
        title: q.question || q.instructions,  // Use instructions for matching type
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
          // Matching questions are not directly supported by the Google Forms API.
          // You may need to implement a workaround or skip these questions.
          return null;
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

  const handleExportToPDF = async () => {
    setIsExportingPDF(true);
    setError('');
    setSuccessMessage('');
    try {
      await exportToPDF(quizData, exportWithAnswers);
      setSuccessMessage('PDF exported successfully!');
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError('An error occurred while exporting to PDF. Please try again.');
    }
    setIsExportingPDF(false);
  };

  return (
    
      <div className="quiz-generator-container">
        {error && <p className="error-message">{error}</p>}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={() => {
          setIsLoginModalOpen(false); // Close the modal upon successful login
          setError(''); // Clear the error after login
        }} 
      />
        <header className="quiz-generator-header">
          <h1 className="quiz-title">Quiz Generator</h1>
          <img src={quizGenIMG} alt="Quiz Generator Logo" className="quiz-logo" />      
        </header>
  
      <div className="input-section">
        {/* Main Content Input */}
        <div className="input-group">
          <h3><FaAlignLeft /> Content (Required):</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setMainContentFile, setMainContentPreview)}
          >
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Enter the core content of your quiz here or upload a file (DOCX or TXT, PDF coming soon)"
              rows={6}
            />
            <label htmlFor="mainContentFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="mainContentFileInput"
              onChange={(e) => handleFileChange(e, setMainContentFile, setMainContentPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {mainContentPreview && (
            <div className="file-preview">
              <h4>Content Preview:</h4>
              <p>{mainContentPreview.slice(0, 500)}{mainContentPreview.length > 500 && '...'}</p>
            </div>
          )}
        </div>

        {/* Grade Level Input */}
        <div className="input-group">
          <h3><FaGraduationCap /> Grade Level (Optional):</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setGradeLevelFile, setGradeLevelPreview)}
          >
            <input
              type="text"
              value={gradeLevel}
              onChange={handleGradeLevelChange}
              placeholder="Specify the grade level (e.g., 9th Grade, Middle School)"
            />
          </div>
        </div>

        {/* Additional Criteria Input */}
        <div className="input-group">
          <h3><FaListAlt /> Additional Criteria (Optional):</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setAdditionalCriteriaFile, setAdditionalCriteriaPreview)}
          >
            <textarea
              value={additionalCriteria}
              onChange={handleAdditionalCriteriaChange}
              placeholder="Add any specific requirements (e.g., focus on critical thinking skills, only multiple choice questions, or a specified number of questions)"
              rows={4}
            />
            <label htmlFor="additionalCriteriaFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="additionalCriteriaFileInput"
              onChange={(e) => handleFileChange(e, setAdditionalCriteriaFile, setAdditionalCriteriaPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {additionalCriteriaPreview && (
            <div className="file-preview">
              <h4>Additional Criteria Preview:</h4>
              <p>{additionalCriteriaPreview.slice(0, 500)}{additionalCriteriaPreview.length > 500 && '...'}</p>
            </div>
          )}
        </div>

        {/* Standards Input */}
        <div className="input-group">
          <h3><FaExclamationCircle /> Standards (Optional):</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setStandardsFile, setStandardsPreview)}
          >
            <input
              type="text"
              value={standards}
              onChange={handleStandardsChange}
              placeholder="Enter the standards to align with (e.g., CCSS, TEKS, NGSS, or your own curriculum standards)"
            />
            <label htmlFor="standardsFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="standardsFileInput"
              onChange={(e) => handleFileChange(e, setStandardsFile, setStandardsPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {standardsPreview && (
            <div className="file-preview">
              <h4>Standards Preview:</h4>
              <p>{standardsPreview.slice(0, 500)}{standardsPreview.length > 500 && '...'}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isGeneratingQuiz}
          className="generate-button"
        >
          {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
        {isGeneratingQuiz && <div className="loading-spinner"></div>}
        {error && <p className="error-message">{error}</p>}
      </div>
      
      {quizData && (
        <div className="quiz-content">
          {quizData && (
            <button onClick={handleEditToggle} className="edit-button">
              {isEditing ? 'Cancel Edit' : 'Edit Quiz'}
            </button>
          )}
          <h2>
            {isEditing ? (
              <input
                type="text"
                value={editedQuizData.title}
                onChange={(e) => setEditedQuizData({ ...editedQuizData, title: e.target.value })}
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
              disabled={isSubmittingQuiz}
            >
              {isSubmittingQuiz ? 'Submitting...' : 'Submit Quiz'}
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
              onClick={handleExportToPDF}
              className="export-button"
              disabled={isExportingPDF}
            >
              {isExportingPDF ? 'Exporting to PDF...' : 'Export to PDF'}
            </button>
            <button
              onClick={copyQuizLinkToClipboard}
              className="export-button"
            >
              Copy Quiz Link
            </button>
            <button
              onClick={createGoogleForm}
              className="export-button"
              disabled={isExportingGoogleForm}
            >
              {isExportingGoogleForm ? 'Exporting to Google Form...' : 'Export to Google Form'}
            </button>
            {isExportingGoogleForm && <div className="loading-spinner"></div>}
          </div>
          {error && <p className="error-message">{error}</p>}
          {{successMessage} && <h4 className="success-message"> 🎉 {successMessage} 🎉</h4>}
          </div>
      )}
    </div>
  );
};

export default QuizGenerator;
