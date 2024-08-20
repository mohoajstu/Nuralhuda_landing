import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation, ShortAnswer } from './QuizComponents';
import LoginModal from '../login/LoginModal';
import './FetchQuiz.css';

const FetchQuiz = () => {
  const { quizId } = useParams();
  const [user, loading, error] = useAuthState(auth); // Destructuring loading and error as well
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizError, setQuizError] = useState('');
  const [proceedWithoutSignIn, setProceedWithoutSignIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    console.log('User:', user);
    console.log('ProceedWithoutSignIn:', proceedWithoutSignIn);

    const fetchQuiz = async () => {
      if (!quizId) {
        console.error('Quiz ID is not defined');
        setQuizError('Quiz ID is not defined');
        return;
      }

      try {
        console.log('Fetching quiz data for ID:', quizId);
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          const retrievedData = quizDoc.data();
          const parsedData = JSON.parse(retrievedData.data);
          console.log('Quiz data fetched successfully:', parsedData);
          setQuizData(parsedData);
        } else {
          console.error('No such document!');
          setQuizError('No quiz found with this ID.');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setQuizError('An error occurred while fetching the quiz.');
      }
    };

    fetchQuiz();
  }, [quizId, user, proceedWithoutSignIn]);

  const handleSignIn = () => {
    console.log('Opening login modal');
    setShowLoginModal(true);
  };

  const handleProceedWithoutSignIn = () => {
    console.log('Proceeding without sign-in');
    setProceedWithoutSignIn(true);
  };

  const handleLoginSuccess = () => {
    console.log('Login successful');
    setProceedWithoutSignIn(false);
    setShowLoginModal(false); // Close the modal on successful login
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = async () => {
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

    if (user && !proceedWithoutSignIn) {
      try {
        // Save to user's QuizzesSubmitted
        await setDoc(doc(db, "users", user.uid, "QuizzesSubmitted", quizId), {
          quizId,
          score: newScore,
          answers: userAnswers
        });

        // Save to Quiz's Submissions subcollection
        await setDoc(doc(db, "quizzes", quizId, "Submissions", user.uid), {
          userId: user.uid,
          score: newScore,
          answers: userAnswers
        });

        console.log("Quiz results saved successfully");
      } catch (error) {
        console.error("Error saving quiz results:", error);
        setQuizError('An error occurred while submitting the quiz. Please try again.');
      }
    } else {
      console.log("Quiz results not saved - user not signed in or chose to proceed without signing in");
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user && !proceedWithoutSignIn) {
    console.log('Rendering sign-in prompt');
    return (
      <div className="sign-in-prompt">
        <h2>Sign In to Save Your Progress</h2>
        <p>Sign in to save your quiz progress and scores, or proceed without signing in.</p>
        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleProceedWithoutSignIn}>Proceed Without Signing In</button>
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
            onLogin={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  if (quizError) {
    console.log('Rendering error state:', quizError);
    return <p className="error-message">{quizError}</p>;
  }

  if (!quizData) {
    console.log('Rendering loading quiz data state');
    return <div>Loading quiz data...</div>;
  }

  console.log('Rendering quiz content');
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
            {!user || proceedWithoutSignIn ? (
              <p>Your results were not saved. Sign in next time to save your progress!</p>
            ) : (
              <p>Your results have been saved.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchQuiz;
