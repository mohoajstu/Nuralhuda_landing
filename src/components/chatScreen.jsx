import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchChatCompletion } from './openai';
import { useParams } from 'react-router-dom';

const Header = ({ title }) => (
  <div style={styles.headerTitle}>
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

const SuggestedPrompts = ({ onSelectPrompt }) => {
  const prompts = ["Who Are You?", "What are the 5 Pillars of Islam?", "What is Ramadan?", "Random Fact!"];

  return (
    <div style={styles.promptsContainer}>
      {prompts.map((prompt, index) => (
        <button key={index} style={styles.promptButton} onClick={() => onSelectPrompt(prompt)}>
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
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const userMessage = { sender: 'user', text: currentMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage('');
  
      try {
        console.log('chatbotType:', chatbotType); // Add this line
        const responseText = await fetchChatCompletion(userMessage.text, chatbotType);
        const botMessage = { sender: 'bot', text: responseText };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
        // Handle the error, e.g., show an error message to the user
      }
    }
  };

  const handleSelectPrompt = (prompt) => {
    setCurrentMessage(prompt);
    handleSendMessage();
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
    <div style={styles.container}>
      <Header title={assistantTitle} />
      <div style={styles.headerContainer}>
        <button style={styles.homeButton} onClick={handleGoToHome}>
          Home
        </button>
      </div>

      <div ref={scrollViewRef} style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.messageContainer,
              ...(message.sender === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            <span style={styles.messageText}>{message.text}</span>
          </div>
        ))}
      </div>
      <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
      <div style={styles.inputContainer}>
    <input
      style={styles.input}
      value={currentMessage}
      onChange={(e) => setCurrentMessage(e.target.value)}
      placeholder="Type your message..."
      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} // Add this line
    />
    <button style={styles.sendButton} onClick={handleSendMessage}>
      Send
    </button>
  </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#357d7c',
  },

  headerTitle: {
    color: '#dcca98', // Corrected the color value to have a '#'
    fontSize: '25px',
    display: 'flex', // This will enable flexbox for this container
    justifyContent: 'center', // This will center the children horizontally
    alignItems: 'center', // This will center the children vertically
    height: '60px', // You can set a specific height for your header
  },
  
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  homeButton: {
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#dcca98',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  messageContainer: {
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '10px',
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#abdbe3',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCF8C6',
  },
  messageText: {
    fontSize: '16px',
  },
  promptsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    //borderTop: '1px solid #ccc',
    backgroundColor: '#357d7c',
  },
  
  promptButton: {
    backgroundColor: '#dcca98',
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#000000',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    marginRight: '10px',
  },

  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    //borderTop: '1px solid #ccc',
    backgroundColor: '#114040',
  },
  
  input: {
    flex: 1,
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    paddingLeft: '10px',
    paddingRight: '10px',
    marginRight: '10px',
  },

  sendButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    fontWeight: 'bold',
    padding: '10px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
  },
};