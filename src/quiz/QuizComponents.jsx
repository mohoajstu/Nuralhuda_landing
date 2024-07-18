import React from 'react';
import { Card, CardHeader, CardContent } from './CardComponents';
import './QuizComponents.css';

export const QuizQuestion = ({ question, children, index }) => (
  <Card className="quiz-question">
    <CardHeader>
      <h3 className="question-title">Question {index + 1}: {question || 'Matching:'}</h3>
    </CardHeader>
    <CardContent>
      <div className="question-content">
        {children}
      </div>
    </CardContent>
  </Card>
);

export const MultipleChoice = ({ options, onChange, userAnswer, correctAnswer, isDisabled, questionIndex }) => (
  <ul className="options-list">
    {options.map((option, index) => (
      <li key={index} className="option-item">
        <label className={`option-label ${isDisabled ? 'disabled' : ''} 
          ${correctAnswer !== null && index === correctAnswer ? 'correct' : ''} 
          ${correctAnswer !== null && userAnswer === index && index !== correctAnswer ? 'incorrect' : ''}`}>
          <input 
            type="radio" 
            name={`question-${questionIndex}`} // Unique name attribute
            checked={userAnswer === index}
            onChange={() => onChange(index)}
            disabled={isDisabled}
            className="option-input"
          />
          <div className="option-text">{option}</div>
        </label>
      </li>
    ))}
  </ul>
);

export const TrueFalse = ({ onChange, userAnswer, correctAnswer, isDisabled, questionIndex }) => (
  <div className="options-list">
    {['True', 'False'].map((option, index) => (
      <label key={index} className={`option-label ${isDisabled ? 'disabled' : ''} 
        ${correctAnswer !== null && index === (correctAnswer ? 0 : 1) ? 'correct' : ''} 
        ${correctAnswer !== null && userAnswer === index && index !== (correctAnswer ? 0 : 1) ? 'incorrect' : ''}`}>
        <input 
          type="radio" 
          name={`true-false-${questionIndex}`} // Unique name attribute
          checked={userAnswer === index}
          onChange={() => onChange(index)}
          disabled={isDisabled}
          className="option-input"
        />
        <span className="option-text">{option}</span>
      </label>
    ))}
  </div>
);

export const FillInTheBlank = ({ onChange, userAnswer, correctAnswer, isDisabled }) => (
  <div>
    <input 
      type="text" 
      value={userAnswer || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isDisabled}
      className={`fill-input ${isDisabled ? 'disabled' : ''} 
        ${correctAnswer !== null ? (userAnswer === correctAnswer ? 'correct' : 'incorrect') : ''}`}
      placeholder="Enter your answer"
    />
    {correctAnswer !== null && userAnswer !== correctAnswer && (
      <p className="explanation-text">Correct answer: {correctAnswer}</p>
    )}
  </div>
);

export const Matching = ({ columnA, columnB, onChange, userMatches, correctMatches, isDisabled }) => (
  <Card className="quiz-question">
    <CardHeader>
      <p className="matching-question">Match the following terms with their correct descriptions:</p>
    </CardHeader>
    <CardContent>
      <div className="matching-container">
        <div className="matching-grid">
          <div className="matching-column">
            {columnA.map((item, index) => (
              <div key={index} className="matching-item">
                <span className="matching-term">{item}</span>
                <select 
                  value={userMatches ? userMatches[index] : ''}
                  onChange={(e) => {
                    const newMatches = [...(userMatches || [])];
                    newMatches[index] = parseInt(e.target.value);
                    onChange(newMatches);
                  }}
                  disabled={isDisabled}
                  className={`matching-select ${isDisabled ? 'disabled' : ''} 
                    ${correctMatches !== null ? (userMatches[index] === correctMatches[index] ? 'correct' : 'incorrect') : ''}`}
                >
                  <option value="">Select a match</option>
                  {columnB.map((option, optionIndex) => (
                    <option key={optionIndex} value={optionIndex}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="matching-column">
            {columnB.map((item, index) => (
              <div key={index} className="matching-description">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Explanation = ({ text }) => (
  <div className="explanation">
    <p className="explanation-text">{text}</p>
  </div>
);

export const ShortAnswer = ({ onChange, userAnswer, isDisabled, correctAnswer, explanation, submitted }) => (
  <div className="short-answer-container">
    <textarea 
      value={userAnswer || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isDisabled}
      className={`short-answer-input ${isDisabled ? 'disabled' : ''}`}
      placeholder="Enter your answer here"
      rows={4}
    />
    {submitted && (
      <div className="correct-answer-feedback">
        <h4>Correct Answer:</h4>
        <p>{correctAnswer || 'No correct answer provided'}</p>
        <h4>Explanation:</h4>
        <p>{explanation || 'No explanation provided'}</p>
      </div>
    )}
  </div>
);