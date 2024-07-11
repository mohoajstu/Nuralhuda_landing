import React from 'react';

const PromptCountInfo = ({ totalPromptCount, maxPrompts, isPaidUser, onUpgradeClick }) => (
  <div className="prompt-count-info">
    <p className="prompt-count-text">
      Prompts used today: {totalPromptCount}/{maxPrompts}
    </p>
    {!isPaidUser && totalPromptCount >= maxPrompts && (
      <span className="upgrade-message" onClick={onUpgradeClick}> Upgrade for more prompts!</span>
    )}
  </div>
);

export default PromptCountInfo;
