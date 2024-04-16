import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchChatCompletion } from './openai';
import { useParams } from 'react-router-dom';


const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  default: 'default', 
};

const SuggestedPrompts = ({ onSelectPrompt }) => {
  const prompts = ["What are the 5 Pillars of Islam?", "What is Ramadan?", "Random Fact!"];

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
    backgroundColor: '#dcca98',
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
    color: '#144040',
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
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ade6e6',
  },
  messageText: {
    fontSize: '16px',
  },
  promptsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#DccA98',
  },
  promptButton: {
    backgroundColor: '#144040',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#fff',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderTop: '1px solid #ccc',
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