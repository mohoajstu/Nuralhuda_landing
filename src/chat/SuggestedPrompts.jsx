import React from 'react';

export const SuggestedPrompts = ({ onSelectPrompt, isSending, prompts }) => (
  <div className="chatscreen-prompts-container">
    {prompts.map((prompt, index) => (
      <button
        key={index}
        className="chatscreen-prompt-button"
        onClick={() => onSelectPrompt(prompt)}
        disabled={isSending}
      >
        {prompt}
      </button>
    ))}
  </div>
);

export default SuggestedPrompts;