import React from 'react';

export const QuizQuestion = ({ question, children, index }) => (
  <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
    <h3 className="text-xl font-semibold mb-4 text-[#005c69]">Question {index + 1}: {question}</h3>
    {children}
  </div>
);

export const MultipleChoice = ({ options, onChange, userAnswer, correctAnswer, isDisabled }) => (
  <ul className="space-y-2">
    {options.map((option, index) => (
      <li key={index}>
        <label className={`flex items-center p-2 rounded-md transition-colors duration-150 ${
          isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
        } ${correctAnswer !== null && index === correctAnswer ? 'bg-green-100' : ''} 
        ${correctAnswer !== null && userAnswer === index && index !== correctAnswer ? 'bg-red-100' : ''}`}>
          <input 
            type="radio" 
            name="answer" 
            checked={userAnswer === index}
            onChange={() => onChange(index)}
            disabled={isDisabled}
            className="form-radio text-[#005c69] h-5 w-5" 
          />
          <span className="ml-2 text-gray-700">{option}</span>
        </label>
      </li>
    ))}
  </ul>
);

export const TrueFalse = ({ onChange, userAnswer, correctAnswer, isDisabled }) => (
  <div className="space-y-2">
    {['True', 'False'].map((option, index) => (
      <label key={index} className={`flex items-center p-2 rounded-md transition-colors duration-150 ${
        isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
      } ${correctAnswer !== null && index === correctAnswer ? 'bg-green-100' : ''} 
      ${correctAnswer !== null && userAnswer === index && index !== correctAnswer ? 'bg-red-100' : ''}`}>
        <input 
          type="radio" 
          name="answer" 
          checked={userAnswer === index}
          onChange={() => onChange(index)}
          disabled={isDisabled}
          className="form-radio text-[#005c69] h-5 w-5" 
        />
        <span className="ml-2 text-gray-700">{option}</span>
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
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#005c69] ${
        isDisabled ? 'bg-gray-100' : ''
      } ${correctAnswer !== null ? (userAnswer === correctAnswer ? 'bg-green-100' : 'bg-red-100') : ''}`}
      placeholder="Enter your answer"
    />
    {correctAnswer !== null && userAnswer !== correctAnswer && (
      <p className="mt-2 text-sm text-red-600">Correct answer: {correctAnswer}</p>
    )}
  </div>
);

export const Matching = ({ columnA, columnB, onChange, userMatches, correctMatches, isDisabled }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      {columnA.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="mr-2 font-medium">{item}</span>
          <select 
            value={userMatches ? userMatches[index] : ''}
            onChange={(e) => {
              const newMatches = [...(userMatches || [])];
              newMatches[index] = parseInt(e.target.value);
              onChange(newMatches);
            }}
            disabled={isDisabled}
            className={`form-select w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005c69] ${
              isDisabled ? 'bg-gray-100' : ''
            } ${correctMatches !== null ? (userMatches[index] === correctMatches[index] ? 'bg-green-100' : 'bg-red-100') : ''}`}
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
        <div key={index} className="mb-2 font-medium">{item}</div>
      ))}
    </div>
  </div>
);

export const Explanation = ({ text }) => (
  <div className="mt-2 p-3 bg-gray-100 rounded-md">
    <p className="text-sm text-gray-700">{text}</p>
  </div>
);