import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config'; // Ensure auth is imported
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation, ShortAnswer } from './QuizComponents';
import './FetchQuiz.css';

const FetchQuiz = () => {
  const { quizId } = useParams();
  const [user, loading] = useAuthState(auth); // Retrieve the authenticated user
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      console.log("Quiz ID from URL:", quizId);
      if (!quizId) {
        console.error('Quiz ID is not defined');
        setError('Quiz ID is not defined');
        return;
      }

      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          const retrievedData = quizDoc.data();
          console.log('Retrieved data:', retrievedData);
          const parsedData = JSON.parse(retrievedData.data);
          console.log('Parsed data:', parsedData);
          setQuizData(parsedData);
        } else {
          console.error('No such document!');
          setError('No quiz found with this ID.');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('An error occurred while fetching the quiz.');
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = async () => {
    if (!user) {
      alert("You need to be signed in to submit the quiz.");
      return;
    }

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

    // Ensure the score is set before writing to Firebase
    setScore(newScore);
    setSubmitted(true);

    try {
      // Save to user's QuizzesSubmitted
      const userSubmissionRef = doc(db, "users", user.uid, "QuizzesSubmitted", quizId);
      await setDoc(userSubmissionRef, { quizId, score: newScore, answers: userAnswers });

      // Save to Quiz's Submissions subcollection
      const quizSubmissionRef = doc(db, "quizzes", quizId, "Submissions", user.uid);
      await setDoc(quizSubmissionRef, { userId: user.uid, score: newScore, answers: userAnswers });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError('An error occurred while submitting the quiz. Please try again.');
    }
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

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!quizData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-generator-container">
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
                questionIndex={index}
              />
            )}
            {q.type === 'true-false' && (
              <TrueFalse
                onChange={(answer) => handleAnswerChange(index, answer)}
                userAnswer={userAnswers[index]}
                correctAnswer={submitted ? q.correctAnswer : null}
                isDisabled={submitted}
                questionIndex={index}
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
        {submitted && (
          <div className="score-section">
            <h3>Your Score: {score} / {quizData.questions.length}</h3>
            <h3>Note: Short answer questions will be manually graded.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchQuiz;
