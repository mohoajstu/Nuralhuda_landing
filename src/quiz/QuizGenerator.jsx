import React, { useState } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation } from './QuizComponents';
import { db } from '../config/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
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

  const handleTextChange = (e) => setText(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleExportChange = (e) => setExportWithAnswers(e.target.value);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const assistantTitle = 'Quiz Generator';
    setResponseBuffer(''); // Reset the response buffer
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
        console.log("Accumulated response buffer:", prevAccumulated); // Log the accumulated response
        try {
          const response = JSON.parse(prevAccumulated);
          setQuizData(response);
          saveQuizToFirestore(response); // Save the quiz to Firestore
        } catch (error) {
          console.error("Error parsing response:", error);
          setError('An error occurred while parsing the quiz data. Please try again.');
        }
        return '';
      } else {
        const newAccumulated = prevAccumulated + message.text;
        return newAccumulated;
      }
    });
  };

  const handleError = (error) => {
    console.error("Error handling message:", error);
    setError('An error occurred while handling the response. Please try again.');
    setIsLoading(false);
  };

  const handleQuizSubmit = () => {
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

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const addNewPageIfNeeded = (doc, y, additionalHeight) => {
    const pageHeight = 270;
    if (y + additionalHeight > pageHeight) {
      doc.addPage();
      return 10; // Reset y position
    }
    return y;
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
      let height = lineHeight * 2; // Question text + extra space
      if (question.type === 'multiple-choice') {
        height += question.options.length * lineHeight;
      } else if (question.type === 'true-false') {
        height += 2 * lineHeight; // True and False options
      } else if (question.type === 'fill-in-the-blank') {
        height += lineHeight; // Answer line
      } else if (question.type === 'matching') {
        height += (question.columnA.length + 1) * lineHeight * 1.5; // +1 for the instruction line, 1.5 for extra spacing
      }
      if (exportWithAnswers === 'answers') {
        height += 3 * lineHeight; // Correct answer and explanation
      }
      return height + questionSpacing;
    };

    const writeQuestion = (question, index) => {
      const startY = y;
      y += writeText(`Question ${index + 1}: ${question.question || 'Matching:'}`, margin, contentWidth);
      y += lineHeight; // Add extra space after question text
      
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
        y += lineHeight; // Add extra space after instruction
        const columnAWidth = contentWidth * 0.45;
        const columnBWidth = contentWidth * 0.45;
        const columnSpacing = contentWidth * 0.1;
        question.columnA.forEach((item, i) => {
          const lineY = y;
          writeText(item, margin, columnAWidth);
          writeText(question.columnB[i], margin + columnAWidth + columnSpacing, columnBWidth);
          y = lineY + lineHeight * 1.5; // Increase spacing between matching items
        });
      }

      if (exportWithAnswers === 'answers') {
        y += lineHeight * 1.5; // Add more space before answers
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

  const saveQuizToFirestore = async (quiz) => {
    try {
      const stringifiedQuiz = JSON.stringify(quiz); // Stringify the quiz data
      const docRef = await addDoc(collection(db, "quizzes"), { data: stringifiedQuiz });
      console.log("Document written with ID: ", docRef.id);
      const quizLink = `${window.location.origin}/quiz/${docRef.id}`;
      copyToClipboard(quizLink);
      alert(`Quiz saved! Link copied to clipboard: ${quizLink}`);
    } catch (error) {
      console.error("Error saving quiz: ", error);
      setError('An error occurred while saving the quiz. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard successfully!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="quiz-generator-container">
      <header className="quiz-generator-header">
        <h1>Islamic Studies Quiz Generator</h1>
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
          <h2>{quizData.title}</h2>
          {quizData.questions.map((q, index) => (
            <QuizQuestion key={index} question={q.question} index={index}>
              {q.type === 'multiple-choice' && (
                <MultipleChoice
                  options={q.options}
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted}
                  questionIndex={index} // Pass the questionIndex to ensure unique name attribute
                />
              )}
              {q.type === 'true-false' && (
                <TrueFalse
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted}
                  questionIndex={index} // Pass the questionIndex to ensure unique name attribute
                />
              )}
              {q.type === 'fill-in-the-blank' && (
                <FillInTheBlank
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted}
                />
              )}
              {q.type === 'matching' && (
                <Matching
                  columnA={q.columnA}
                  columnB={q.columnB}
                  onChange={(matches) => handleAnswerChange(index, matches)}
                  userMatches={userAnswers[index]}
                  correctMatches={submitted ? q.correctMatches : null}
                  isDisabled={submitted}
                />
              )}
              {submitted && (
                <div className={`mt-2 p-2 rounded ${isCorrect(index) ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect(index) ? 'Correct!' : 'Incorrect'}
                  <Explanation text={q.explanation} />
                </div>
              )}
            </QuizQuestion>
          ))}
          {!submitted && (
            <button
              onClick={handleQuizSubmit}
              className="submit-button"
            >
              Submit Quiz
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
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
