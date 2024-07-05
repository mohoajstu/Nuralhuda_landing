import React from 'react';
import './QuizComponents.css';

export const QuizQuestion = ({ question, children, index }) => (
  <div className="quiz-question">
    <h3 className="question-title">Question {index + 1}: {question}</h3>
    <div className="question-content">
      {children}
    </div>
  </div>
);


export const MultipleChoice = ({ options, onChange, userAnswer, correctAnswer, isDisabled }) => (
  <ul className="options-list">
    {options.map((option, index) => (
      <li key={index} className="option-item">
        <label className={`option-label ${isDisabled ? 'disabled' : ''} 
          ${correctAnswer !== null && index === correctAnswer ? 'correct' : ''} 
          ${correctAnswer !== null && userAnswer === index && index !== correctAnswer ? 'incorrect' : ''}`}>
          <input 
            type="radio" 
            name={`question-${index}`}
            checked={userAnswer === index}
            onChange={() => onChange(index)}
            disabled={isDisabled}
            className="option-input"
          />
          <span className="option-text">{option}</span>
        </label>
      </li>
    ))}
  </ul>
);

export const TrueFalse = ({ onChange, userAnswer, correctAnswer, isDisabled }) => (
  <div className="options-list">
    {['True', 'False'].map((option, index) => (
      <label key={index} className={`option-label ${isDisabled ? 'disabled' : ''} 
        ${correctAnswer !== null && index === (correctAnswer ? 0 : 1) ? 'correct' : ''} 
        ${correctAnswer !== null && userAnswer === index && index !== (correctAnswer ? 0 : 1) ? 'incorrect' : ''}`}>
        <input 
          type="radio" 
          name="true-false-answer" 
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
  <div className="matching-grid">
    <div>
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
    <div>
      {columnB.map((item, index) => (
        <div key={index} className="matching-term">{item}</div>
      ))}
    </div>
  </div>
);

export const Explanation = ({ text }) => (
  <div className="explanation">
    <p className="explanation-text">{text}</p>
  </div>
);