import React, { useState, useRef, useEffect, useCallback } from 'react'; // useCallback is removed since it is not being used.
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChatCompletion } from './openai';

const Header = ({ title }) => (
  <div className="chatscreen-header-title">
    <h6>{title}</h6>
  </div>
);


const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  default: 'default', 
};

const SuggestedPrompts = ({ onSelectPrompt, isSending }) => {
  const prompts = ["Who Are You?", "What are the 5 Pillars of Islam?", "What is Ramadan?", "Random Fact!"];

  return (
    <div className="chatscreen-prompts-container">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          className="chatscreen-prompt-button"
          onClick={() => onSelectPrompt(prompt)}
          disabled={isSending} // Disable button if isSending is true
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};


export default function ChatScreen() {
  const { chatbotType } = useParams();
  const assistantTitle = Object.keys(titleToChatbotTypeMap).find(key => titleToChatbotTypeMap[key] === chatbotType);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false); // State to manage if a message is being sent
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();

  
  const handleSendMessage = async () => {
    if (!isSending && currentMessage.trim() !== '') {
      setIsSending(true); // Disable sending of new message until this one is processed
      const userMessage = { sender: 'user', text: currentMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage('');
  
      try {
        const responseText = await fetchChatCompletion(userMessage.text, chatbotType);
        const botMessage = { sender: 'bot', text: responseText };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
      }
      setIsSending(false); // Re-enable sending of messages
    }
  };

  const handleSelectPrompt = (prompt) => {
    if (!isSending) {
      setCurrentMessage(prompt);
      handleSendMessage();
    }
  };

  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="chatscreen-container">
      <Header title={assistantTitle} />
      <div className="chatscreen-header-container">
        <button className="chatscreen-home-button" onClick={handleGoToHome}>
          Home
        </button>
      </div>

      <div ref={scrollViewRef} className="chatscreen-messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatscreen-message-container ${message.sender === 'user' ? 'chatscreen-user-message' : 'chatscreen-bot-message'}`}
          >
            <span className="chatscreen-message-text">{message.text}</span>
          </div>
        ))}
      </div>
      <SuggestedPrompts onSelectPrompt={handleSelectPrompt} isSending={isSending} />
      <div className="chatscreen-input-container">
      <input
  className="chatscreen-input"
  value={currentMessage}
  onChange={(e) => setCurrentMessage(e.target.value)}
  placeholder="Type your message..."
  onKeyDown={(e) => { if (e.key === 'Enter' && !isSending) handleSendMessage(); }}
  disabled={isSending} // Disable the input while sending
/>
<button
  className="chatscreen-send-button"
  onClick={handleSendMessage}
  disabled={isSending} // Disable the button while sending
>
  Send
</button>

      </div>
    </div>
  );
}