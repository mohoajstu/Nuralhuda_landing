import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { RenderMarkdown } from './RenderMarkdown';
import { SuggestedPrompts, getPromptsForType } from './SuggestedPrompts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase-config';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import Modal from './modal';

import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';
import paliGPTImg from '../img/PaliGPT.png';
import muslimReferenceAIIMG from '../img/muslimReferenceAI.png';

const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  'Muslim Reference AI': 'muslimReferenceAI',
  'PaliGPT': 'paliGPT',
  default: 'default',
};

const titleToImageMap = {
  'Nur Al Huda': nurAlHudaImg,
  'Nur Al Huda For Kids': nurAlHudaForKidsImg,
  'Islamic Socratic Method': islamicSocraticMethodImg,
  'Iqra With Us': iqraWithUsImg,
  'Muslim Reference AI': muslimReferenceAIIMG,
  'PaliGPT': paliGPTImg,
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
  const assistantId = titleToAssistantIDMap[assistantTitle];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenReport, setIsModalOpenReport] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  const [currentPrompts, setCurrentPrompts] = useState([]);
  const [accumulatedMessage, setAccumulatedMessage] = useState('');
  const [reportFeedbackMessage, setReportFeedbackMessage] = useState('');
  const [reportedMessage, setReportedMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

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
    setCurrentPrompts(getPromptsForType(chatbotType));
  }, [chatbotType]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setPaymentStatus(userDoc.data().paymentStatus || 'unpaid');
        }
      }
    };

    checkPaymentStatus();
  }, [user]);

  const handleNewMessage = (message) => {
    setAccumulatedMessage((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        const botMessage = { sender: 'assistant', text: prevAccumulated };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setAccumulatedMessage('');
      } else {
        setIsSending(true);
        const newAccumulated = prevAccumulated + message.text;
        return newAccumulated;
      }
      setIsSending(false);
    });
  };

  const handleError = (error) => {
    console.error('Stream error:', error);
  };

  const handleSendMessage = async () => {
    if (isSending || !currentMessage.trim()) return;

    setIsSending(true);
    const userMessage = { sender: 'user', text: currentMessage.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setShowImage(false);

    if (chatbotType !== "paliGPT" && !user) {
      setModalMessage('Please login to use this feature.');
      setRedirectPath('/login');
      setIsModalOpen(true);
      setIsSending(false);
      return;
    }

    if (chatbotType !== 'paliGPT' && !currentPrompts.includes(currentMessage.trim()) && paymentStatus !== 'paid') {
      setModalMessage('Please complete your payment to use this feature.');
      setRedirectPath('/pricing');
      setIsModalOpen(true);
      setIsSending(false);
      return;
    }

    let localThreadId = threadId;

    if (!localThreadId) {
      try {
        const threadResponse = await createThread(assistantTitle);
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
      await createMessage(localThreadId, currentMessage, assistantTitle);
      createRun(localThreadId, assistantId, handleNewMessage, handleError, assistantTitle);
    } catch (error) {
      console.error("Communication error:", error);
    } finally {
      setIsSending(false);
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

  const handleModalConfirm = () => {
    navigate(redirectPath, { state: { from: location.pathname } });
  };

  const sendNegativeReport = (msgReported) => {
    console.log("Negative Report Clicked", msgReported);
    setReportedMessage(msgReported);
    setIsModalOpenReport(true);
  };

  const sendPositiveReport = async (reportedMessage) => {
    console.log("Positive Report Clicked", reportedMessage);
    if (user) {
      try {
        await addDoc(collection(db, 'positiveReviews'), {
          message: reportedMessage,
          user: user.uid,
          timestamp: new Date(),
        });
        console.log('Positive report saved');
      } catch (error) {
        console.error('Error saving positive report:', error);
      }
    } else {
      console.log('User not logged in');
    }
  };

  const handleReportSubmit = async () => {
    console.log("Message reported\n", reportedMessage, reportFeedbackMessage);
    setIsModalOpenReport(false);
    if (user) {
      try {
        await addDoc(collection(db, 'negativeReviews'), {
          message: reportedMessage,
          feedback: reportFeedbackMessage,
          user: user.uid,
          timestamp: new Date(),
        });
        console.log('Negative report saved');
      } catch (error) {
        console.error('Error saving negative report:', error);
      }
    } else {
      console.log('User not logged in');
    }
  };

  return (
    <div className="chatscreen-container">
      <Modal 
        isOpen={isModalOpen}
        onClose={handleGoToHome}
        onConfirm={handleModalConfirm}
        confirmLabel="Continue"
        closeLabel="Cancel"
        message={<p className="modal-message">{modalMessage}</p>}
      />

      <Modal
        isOpen={isModalOpenReport}
        onClose={() => setIsModalOpenReport(false)}
        onConfirm={handleReportSubmit}
        confirmLabel="Submit"
        closeLabel="Cancel"
        message={(
          <>
            <p className="modal-message">Report this message:</p>
            <div className="modal-submessage-container">
              {reportedMessage}
            </div>
            <textarea
              className="modal-textarea"
              onChange={(e) => setReportFeedbackMessage(e.target.value)}
              placeholder="Describe the issue..."
              rows="4"
              cols="50"
            />
          </>
        )}
      />

      <div className="chatscreen-header-container">
        <button className="chatscreen-home-button" onClick={handleGoToHome}>
          Home
        </button>
        <div className="chatscreen-header-title" style={{ fontSize: titleSize }}>
          {assistantTitle}
        </div>
      </div>
      <div ref={scrollViewRef} className="chatscreen-messages-container">
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <div className={`chatscreen-message-wrapper ${message.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'}`}>
              {message.sender !== 'user' && (
                <div className="bot-profile-and-actions">
                  <img src={chatbotImage} alt="Bot" className="chatbot-profile-image" />
                  <div className="bot-actions">
                    <button className="thumb-button" onClick={() => sendPositiveReport(message.text)}>👍</button>
                    <button className="thumb-button" onClick={() => sendNegativeReport(message.text)}>👎</button>
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
};

export default ChatScreen;
