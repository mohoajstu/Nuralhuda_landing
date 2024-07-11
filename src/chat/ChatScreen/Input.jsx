import React from 'react';

const Input = ({ currentMessage, onMessageChange, onSendMessage, isSending }) => (
  <div className="chatscreen-input-container">
    <input
      className="chatscreen-input"
      value={currentMessage}
      onChange={onMessageChange}
      placeholder="Type your message..."
      onKeyDown={(e) => { if (e.key === 'Enter' && !isSending) onSendMessage(); }}
      disabled={isSending}
    />
    <button
      className="chatscreen-send-button"
      onClick={onSendMessage}
      disabled={isSending}
    >
      Send
    </button>
  </div>
);

export default Input;
