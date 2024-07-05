import React, { useState } from 'react';
import { QuizQuestion, MultipleChoice, TrueFalse, FillInTheBlank, Matching, Explanation } from './QuizComponents';

const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleTextChange = (e) => setText(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockQuizData = {
      title: "Introduction to Islamic Studies",
      questions: [
        {
          type: "multiple-choice",
          question: "What is the first pillar of Islam?",
          options: ["Salah", "Shahada", "Zakat", "Sawm"],
          correctAnswer: 1,
          explanation: "The first pillar of Islam is the Shahada, which is the declaration of faith."
        },
        {
          type: "true-false",
          question: "The Quran was revealed over a period of 23 years.",
          correctAnswer: true,
          explanation: "The Quran was indeed revealed to Prophet Muhammad (peace be upon him) over a period of 23 years."
        },
        {
          type: "fill-in-the-blank",
          question: "The Islamic lunar calendar is called the _____ calendar.",
          correctAnswer: "Hijri",
          explanation: "The Islamic lunar calendar is called the Hijri calendar, named after the Hijra of Prophet Muhammad from Mecca to Medina."
        },
        {
          type: "matching",
          question: "Match the Islamic terms with their meanings:",
          columnA: ["Salah", "Zakat", "Sawm"],
          columnB: ["Fasting", "Prayer", "Charity"],
          correctMatches: [1, 2, 0],
          explanation: "Salah means prayer, Zakat refers to obligatory charity, and Sawm means fasting."
        }
      ]
    };
    setQuizData(mockQuizData);
    setIsLoading(false);
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleQuizSubmit = () => {
    let newScore = 0;
    quizData.questions.forEach((question, index) => {
      if (question.type === 'matching') {
        if (JSON.stringify(userAnswers[index]) === JSON.stringify(question.correctMatches)) {
          newScore++;
        }
      } else if (question.type === 'fill-in-the-blank') {
        if (userAnswers[index]?.toLowerCase() === question.correctAnswer.toLowerCase()) {
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
      return userAnswers[questionIndex]?.toLowerCase() === question.correctAnswer.toLowerCase();
    }
    if (question.type === 'true-false') {
      return userAnswers[questionIndex] === (question.correctAnswer ? 0 : 1);
    }
    return userAnswers[questionIndex] === question.correctAnswer;
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
  };

  return (
    <div className="container mx-auto p-8 bg-[#e6d9b8] min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[#005c69] text-center">Islamic Studies Quiz Generator</h1>
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text content here or upload a file"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#005c69]"
          rows={6}
        />
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".txt,.doc,.docx,.pdf"
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-[#005c69] file:text-white
            hover:file:bg-[#00404d]"
        />
        <button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full bg-[#005c69] hover:bg-[#00404d] text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </div>

      {quizData && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-[#005c69] text-center">{quizData.title}</h2>
          {quizData.questions.map((q, index) => (
            <QuizQuestion key={index} question={q.question} index={index}>
              {q.type === 'multiple-choice' && (
                <MultipleChoice 
                  options={q.options} 
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted}
                />
              )}
              {q.type === 'true-false' && (
                <TrueFalse 
                  onChange={(answer) => handleAnswerChange(index, answer)}
                  userAnswer={userAnswers[index]}
                  correctAnswer={submitted ? q.correctAnswer : null}
                  isDisabled={submitted}
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
              className="mt-6 w-full bg-[#005c69] hover:bg-[#00404d] text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Submit Quiz
            </button>
          )}
          {submitted && (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-[#005c69]">Your Score: {score} / {quizData.questions.length}</h3>
              <button 
                onClick={handleSubmit}
                className="mt-4 bg-[#005c69] hover:bg-[#00404d] text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Generate New Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
