// ChatInput.jsx
import React, { useState } from 'react';

const ChatInput = ({ isSending, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending && inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <>
      <div className="chatscreen-input-container">
        <input
          className="chatscreen-input"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button
          className="chatscreen-send-button"
          onClick={() => { if (!isSending && inputMessage.trim()) { onSendMessage(inputMessage); setInputMessage(''); } }}
          disabled={isSending || !inputMessage.trim()}
        >
          Send
        </button>
      </div>
    </>
  );
};

export default ChatInput;
