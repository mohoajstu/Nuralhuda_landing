
import React, { useState, useRef, useEffect, useCallback} from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { RenderMarkdown } from './RenderMarkdown';  // Assume RenderMarkdown is exported from another file
import { SuggestedPrompts, getPromptsForType} from './SuggestedPrompts';  // Assume SuggestedPrompts is exported from another file
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config'; // Adjust the path as necessary
import Modal from './modal'; // Import the Modal component

// Helper images and prompts maps
import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';
import musilmReferenceAI from '../img/muslimReferenceAI.png';

import OpenAI from "openai";


const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  'Muslim Reference AI': 'musilmReferenceAI',
  default: 'default', 
};

const titleToImageMap = {
  'Nur Al Huda': nurAlHudaImg,
  'Nur Al Huda For Kids': nurAlHudaForKidsImg,
  'Islamic Socratic Method': islamicSocraticMethodImg,
  'Iqra With Us': iqraWithUsImg,
  'Muslim Reference AI': musilmReferenceAI,
};

const assistantToApiKeyMap = {
  'nurAlHuda': process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  'nurAlHudaForKids': process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA_FOR_KIDS,
  'islamicSocraticMethod': process.env.REACT_APP_OPENAI_API_KEY_ISLAMIC_SOCRATIC_METHOD,
  'aiForIslamicResearch': process.env.REACT_APP_OPENAI_API_KEY_AI_FOR_ISLAMIC_RESEARCH,
  'iqraWithUs': process.env.REACT_APP_OPENAI_API_KEY_IQRA_WITH_US,
  'musilmReferenceAI': process.env.REACT_APP_OPENAI_API_KEY_MUSLIM_REFERENCE_AI,
};


const ChatScreen = () => {
  const { chatbotType } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const scrollViewRef = useRef(null);
  const assistantTitle = Object.keys(titleToChatbotTypeMap).find(key => titleToChatbotTypeMap[key] === chatbotType);
  const chatbotImage = titleToImageMap[assistantTitle];
  const assistantId = titleToAssistantIDMap[assistantTitle];;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
const [user] = useAuthState(auth);
const [isModalOpen, setIsModalOpen] = useState(false);
const [currentPrompts, setCurrentPrompts] = useState([]);

const apiKey = assistantToApiKeyMap[chatbotType];

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const titleSize = windowWidth >= 1200 ? '3em' : windowWidth >= 992 ? '2.5em' : windowWidth >= 768 ? '2em' : '1.5em';

  useEffect(() => {
    scrollViewRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Assuming `SuggestedPrompts` exports `getPromptsForType`
    setCurrentPrompts(getPromptsForType(chatbotType));
  }, [chatbotType]);
  
  const handleSendMessage = async () => {
    if (isSending || !currentMessage.trim()) return;
    const userMessage = { sender: 'user', text: currentMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage('');
    setShowImage(false); // Hide the image after sending a message
    setIsSending(true);

    if (!currentPrompts.includes(currentMessage.trim()) && !user) {
      setIsModalOpen(true);  // Show modal instead of redirecting
      return;
    }
  
    let localThreadId = threadId; 
  
    if (!localThreadId) {
      try {
        const threadResponse = await createThread();
        if (threadResponse?.id) {
          setThreadId(threadResponse.id);
          localThreadId = threadResponse.id;
        } else {
          throw new Error('Thread creation failed: No ID returned');
        }
      } catch (error) {
        console.error("Error creating thread:", error);
        setIsSending(false);
        return;
      }
    }
    try {
      await createMessage(localThreadId, currentMessage);
      //setMessages(prev => [...prev, { sender: 'user', text: currentMessage }]);
      
      const runResponse = await createRun(localThreadId, assistantId);
    if (runResponse?.status === "completed") {
      const newMessagesResponse = await openai.beta.threads.messages.list(localThreadId);
      const formattedMessages = newMessagesResponse.data.map(message => ({
        sender: message.role === 'system' ? 'assistant' : message.role,
        text: message.content[0].text.value,
      }));
      // This will set the messages state to only the latest set of messages from the thread
      setMessages(formattedMessages.reverse());
    } else {
      // The run has not completed yet, handle accordingly
    }
    } catch (error) {
      console.error("Communication error:", error);
    } finally {
      setIsSending(false);
      setCurrentMessage('');
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
      <div className="chatscreen-container">
        <Modal 
        isOpen={isModalOpen}
        onClose={handleGoToHome}  // Redirect home on cancel
        onConfirm={() => navigate('/login', { state: { from: location.pathname } })}  // Redirect to login on confirm
        message="Please Login To Use This Premium Feature."
      />
        <div className="chatscreen-header-container">
          <button className="chatscreen-home-button" onClick={handleGoToHome}>
            Home
          </button>
          <div className="chatscreen-header-title" style={{ fontSize: titleSize }}>
            {assistantTitle}
          </div>
        </div>

        {/* Message container will also show loading dots when isSending is true */}

        <div ref={scrollViewRef} className="chatscreen-messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`chatscreen-message-container ${message.sender === 'user' ? 'chatscreen-user-message' : 'chatscreen-bot-message'}`}>
              <RenderMarkdown markdown={message.text} />
            </div>
          ))}

          {isSending && (
            <div className="chatscreen-message-container chatscreen-bot-message">
              {/* Render your typing indicator here */}
              <div className="typing-indicator">
                <div className="typing-indicator-dot"></div>
                <div className="typing-indicator-dot"></div>
                <div className="typing-indicator-dot"></div>
              </div>
            </div>
          )}
        </div>
        
        {showImage && chatbotImage && (
          <div className="chatscreen-message-image">
            <img src={chatbotImage} alt={assistantTitle + " Image"} />
          </div>
        )}

        <SuggestedPrompts onSelectPrompt={handleSelectPrompt} isSending={isSending} chatbotType={chatbotType} />

          <div className="chatscreen-input-container">
        <input
          className="chatscreen-input"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !isSending) handleSendMessage(); }}
          disabled={isSending}
        />
        <button
          className="chatscreen-send-button"
          onClick={handleSendMessage}
          disabled={isSending}
        >
          Send
        </button>
      </div>
    </div>
    
  );
}

export default ChatScreen;