import React, { useState, useEffect } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation, ShortAnswer } from './QuizComponents';
import { db } from '../config/firebase-config';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import './QuizGenerator.css';
import jsPDF from 'jspdf';

const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const assistantTitle = 'Quiz Generator';
    setResponseBuffer('');
    try {
      const thread = await createThread(assistantTitle);
      const messageContent = text || (file && await file.text());
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
  };

  const isCorrect = (questionIndex) => {
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
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    const lineHeight = 7;
    const questionSpacing = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const fileName = `${quizData.title.replace(/\s+/g, '_')}_${exportWithAnswers === 'answers' ? 'Answers' : 'Questions'}.pdf`;

    const addNewPageIfNeeded = (height) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        return margin;
      }
      return y;
    };

    const writeText = (text, x, maxWidth, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, x, y);
      return splitText.length * lineHeight;
    };

    const calculateQuestionHeight = (question, index) => {
      let height = lineHeight * 2;
      if (question.type === 'multiple-choice') {
        height += question.options.length * lineHeight;
      } else if (question.type === 'true-false') {
        height += 2 * lineHeight;
      } else if (question.type === 'fill-in-the-blank') {
        height += lineHeight;
      } else if (question.type === 'matching') {
        height += (question.columnA.length + 1) * lineHeight * 1.5;
      }
      if (exportWithAnswers === 'answers') {
        height += 3 * lineHeight;
      }
      return height + questionSpacing;
    };

    const writeQuestion = (question, index) => {
      const startY = y;
      y += writeText(`Question ${index + 1}: ${question.question || 'Matching:'}`, margin, contentWidth);
      y += lineHeight;

      if (question.type === 'multiple-choice') {
        question.options.forEach((option, i) => {
          y += writeText(`${i + 1}. ${option}`, margin + 5, contentWidth - 5);
        });
      } else if (question.type === 'true-false') {
        y += writeText('1. True', margin + 5, contentWidth - 5);
        y += writeText('2. False', margin + 5, contentWidth - 5);
      } else if (question.type === 'fill-in-the-blank') {
        y += writeText('Answer: __________', margin + 5, contentWidth - 5);
      } else if (question.type === 'matching') {
        y += writeText('Match the following options:', margin, contentWidth);
        y += lineHeight;
        const columnAWidth = contentWidth * 0.45;
        const columnBWidth = contentWidth * 0.45;
        const columnSpacing = contentWidth * 0.1;
        question.columnA.forEach((item, i) => {
          const lineY = y;
          writeText(item, margin, columnAWidth);
          writeText(question.columnB[i], margin + columnAWidth + columnSpacing, columnBWidth);
          y = lineY + lineHeight * 1.5;
        });
      }

      if (exportWithAnswers === 'answers') {
        y += lineHeight * 1.5;
        if (question.type === 'matching') {
          y += writeText('Correct Matches:', margin, contentWidth);
          question.columnA.forEach((item, i) => {
            y += writeText(`${item} - ${question.columnB[question.correctMatches[i]]}`, margin + 10, contentWidth - 10);
          });
        } else {
          y += writeText(`Correct Answer: ${
            question.type === 'true-false' ? (question.correctAnswer ? 'True' : 'False') :
            question.type === 'multiple-choice' ? question.options[question.correctAnswer] :
            question.correctAnswer
          }`, margin, contentWidth);
        }
        y += lineHeight;
        y += writeText(`Explanation: ${question.explanation}`, margin, contentWidth);
      }

      y += questionSpacing;
      return y - startY;
    };

    writeText('Quiz: ' + (quizData.title || 'Untitled Quiz'), margin, contentWidth, 16);
    y += 20;

    quizData.questions.forEach((question, index) => {
      const questionHeight = calculateQuestionHeight(question, index);
      y = addNewPageIfNeeded(questionHeight);
      writeQuestion(question, index);
    });

    doc.save(fileName);
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
      if (field === 'type' && value === 'short-answer') {
        newData.questions[index] = {
          ...newData.questions[index],
          type: 'short-answer',
          correctAnswer: '',
          explanation: ''
        };
      } else {
        newData.questions[index][field] = value;
      }
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
      if (newData.questions[questionIndex].type === 'multiple-choice') {
        newData.questions[questionIndex].correctAnswer = parseInt(value);
      } else if (newData.questions[questionIndex].type === 'true-false') {
        newData.questions[questionIndex].correctAnswer = value === 'true';
      } else if (newData.questions[questionIndex].type === 'fill-in-the-blank') {
        newData.questions[questionIndex].correctAnswer = value;
      } else if (newData.questions[questionIndex].type === 'matching') {
        newData.questions[questionIndex].correctMatches = JSON.parse(value);
      } else if (newData.questions[questionIndex].type === 'short-answer') {
        newData.questions[questionIndex].correctAnswer = value; // Correct answer for short-answer
      }
      return newData;
    });
  };

  const handleExplanationEdit = (questionIndex, value) => {
    setEditedQuizData(prevData => {
      const newData = { ...prevData };
      if (newData.questions[questionIndex].type === 'short-answer') {
        newData.questions[questionIndex].explanation = value; // Explanation for short-answer
      }
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

  return (
    <div className="quiz-generator-container">
      <header className="quiz-generator-header">
        <h1>Quiz Generator</h1>
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
          <h2>{isEditing ? (
            <input
              type="text"
              value={editedQuizData.title}
              onChange={(e) => setEditedQuizData({...editedQuizData, title: e.target.value})}
              className="edit-input"
            />
          ) : quizData.title}</h2>
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
                  {q.type === 'fill-in-the-blank' && (
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
                  {q.type === 'short-answer' && (
                    <div>
                      <label>Correct Answer:</label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => handleCorrectAnswerEdit(index, e.target.value)}
                        className="edit-input"
                      />
                      <label>Explanation:</label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => handleExplanationEdit(index, e.target.value)}
                        className="edit-input"
                        rows={3}
                        placeholder="Enter explanation for the answer"
                      />
                    </div>
                  )}
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
              onClick={exportToPDF}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
