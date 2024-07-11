import React from 'react';
import { RenderMarkdown } from '../RenderMarkdown';

const Messages = ({ messages, chatbotImage, isSending, accumulatedMessage, handlePositiveReport, handleNegativeReport }) => (
  <div className="chatscreen-messages-container">
    {messages.map((message, index) => (
      <React.Fragment key={index}>
        <div className={`chatscreen-message-wrapper ${message.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'}`}>
          {message.sender !== 'user' && (
            <div className="bot-profile-and-actions">
              <img src={chatbotImage} alt="Bot" className="chatbot-profile-image" />
              <div className="bot-actions">
                <button className="thumb-button" onClick={() => handlePositiveReport(message.text)}>👍</button>
                <button className="thumb-button" onClick={() => handleNegativeReport(message.text)}>👎</button>
              </div>
            </div>
          )}
          <div className={`chatscreen-message-container ${message.sender === 'user' ? 'chatscreen-user-message' : 'chatscreen-bot-message'}`}>
            <RenderMarkdown markdown={message.text} />
          </div>
        </div>
        {isSending && index === messages.length - 1 && !accumulatedMessage && (
          <div className="chatscreen-message-wrapper bot-message-wrapper">
            <div className="chatscreen-message-container chatscreen-bot-message">
              <div className="typing-indicator">
                <div className="typing-indicator-dot"></div>
                <div className="typing-indicator-dot"></div>
                <div className="typing-indicator-dot"></div>
              </div>
            </div>
          </div>
        )}
        {isSending && index === messages.length - 1 && accumulatedMessage && (
          <div className="chatscreen-message-wrapper bot-message-wrapper">
            <div className="bot-profile-and-actions">
              <img src={chatbotImage} alt="Bot" className="chatbot-profile-image" />
            </div>
            <div className="chatscreen-message-container chatscreen-bot-message">
              <RenderMarkdown markdown={accumulatedMessage} />
            </div>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default Messages;
