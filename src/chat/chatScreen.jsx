import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { RenderMarkdown } from './RenderMarkdown';
import { SuggestedPrompts, getPromptsForType } from './SuggestedPrompts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase-config';
import { collection, addDoc, doc, getDoc, setDoc, increment, updateDoc, arrayUnion } from 'firebase/firestore';
import Modal from './modal';
import { StorageManager, LocalStorageStrategy } from '../storage';

import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';
import paliGPTImg from '../img/PaliGPT.png';
import muslimReferenceAIIMG from '../img/muslimReferenceAI.png';
import fiveDThinkingImg from '../img/5dlogotransparent.png';

import './chatScreen.css';

const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  'Muslim Reference AI': 'muslimReferenceAI',
  'PaliGPT': 'paliGPT',
  '5D Thinking': 'fiveDThinking',
  default: 'default',
};

const titleToImageMap = {
  'Nur Al Huda': nurAlHudaImg,
  'Nur Al Huda For Kids': nurAlHudaForKidsImg,
  'Islamic Socratic Method': islamicSocraticMethodImg,
  'Iqra With Us': iqraWithUsImg,
  'Muslim Reference AI': muslimReferenceAIIMG,
  'PaliGPT': paliGPTImg,
  '5D Thinking': fiveDThinkingImg,
};

const storageManager = new StorageManager(new LocalStorageStrategy()); // Initialize storage manager

const ChatScreen = () => {
  const { chatbotType } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const scrollViewRef = useRef(null);
  const assistantTitle = Object.keys(titleToChatbotTypeMap).find(
    (key) => titleToChatbotTypeMap[key] === chatbotType
  );
  const chatbotImage = titleToImageMap[assistantTitle];
  const assistantId = titleToAssistantIDMap[assistantTitle];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenReport, setIsModalOpenReport] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentPrompts, setCurrentPrompts] = useState([]);
  const [accumulatedMessage, setAccumulatedMessage] = useState('');
  const [reportFeedbackMessage, setReportFeedbackMessage] = useState('');
  const [reportedMessage, setReportedMessage] = useState('');
  const [totalPromptCount, setTotalPromptCount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [accountType, setAccountType] = useState('');
  const [maxPrompts, setMaxPrompts] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setCurrentPrompts(getPromptsForType(chatbotType));
  }, [chatbotType]);

  const checkAndResetPromptCount = async (userData) => {
    const now = new Date();
    const today = now.toDateString();

    let userLastResetDate = null;
    if (userData && userData.lastResetDate) {
      userLastResetDate = userData.lastResetDate.toDate().toDateString();
    } else {
      userLastResetDate = storageManager.load('lastResetDate') || null;
    }

    if (userLastResetDate !== today) {
      console.log('Resetting prompt count for the new day');
      if (user) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            totalPromptCount: 0,
            lastResetDate: now,
          },
          { merge: true }
        );
      } else {
        setTotalPromptCount(0);
        storageManager.save('totalPromptCount', 0);
        storageManager.save('lastResetDate', today);
      }
      setLastResetDate(today);
      setTotalPromptCount(0); // Ensure the local state is updated immediately
    } else {
      // If it's the same day, set the lastResetDate to today
      setLastResetDate(today);
    }
  };

  const fetchUserData = async () => {
    let userData = null;
    let sessionPromptCount = 0;
    let sessionLastResetDate = new Date().toDateString();
    let sessionAccountType = '';
  
    if (user) {
      console.log(`Fetching data for user: ${user.uid}`);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('User data:', userData);
      } else {
        // If the user document doesn't exist, create it
        console.log('User document does not exist, creating a new one');
        const currentDate = new Date();
        await setDoc(doc(db, 'users', user.uid), {
          totalPromptCount: 0,
          lastResetDate: currentDate,
          account: '',
        });
        userData = { totalPromptCount: 0, lastResetDate: currentDate, account: '' };
      }
  
      await checkAndResetPromptCount(userData);
  
      sessionPromptCount = userData.totalPromptCount || 0;
      sessionLastResetDate = userData.lastResetDate ? userData.lastResetDate.toDate().toDateString() : new Date().toDateString();
      sessionAccountType = userData.account || '';
    } else {
      // For non-logged-in users
      sessionPromptCount = storageManager.load('totalPromptCount') || 0;
      sessionLastResetDate = storageManager.load('lastResetDate') || new Date().toDateString();
      sessionAccountType = storageManager.load('account') || '';
  
      await checkAndResetPromptCount();
    }
  
    // Update state with user or session data
    setTotalPromptCount(sessionPromptCount);
    setLastResetDate(sessionLastResetDate);
    setAccountType(sessionAccountType);
  
    // Define chatbot type flags
    const isNurAlHuda = chatbotType === 'nurAlHuda';
    const isNurAlHudaForKids = chatbotType === 'nurAlHudaForKids';
    const isPaliGPT = chatbotType === 'paliGPT';
  
    // Set maxPrompts based on user account type and chatbot type
    if (isPaliGPT) {
      setMaxPrompts(Infinity);
    } else if (sessionAccountType === 'premium' || sessionAccountType === 'enterprise') {
      setMaxPrompts(40);
    } else if (sessionAccountType === 'hybrid' && (isNurAlHuda || isNurAlHudaForKids)) {
      setMaxPrompts(40);
    } else if (sessionAccountType === 'basic' && isNurAlHuda) {
      setMaxPrompts(40);
    } else {
      setMaxPrompts(5);
    }
  };  

  useEffect(() => {
    fetchUserData();
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

    const isPaliGPT = chatbotType === 'paliGPT';

    if (!user) {
      // Handle user not logged in
      /*
      if (!isPaliGPT && !currentPrompts.includes(currentMessage.trim())) {
        setModalMessage('Please log in to use this feature.');
        setIsModalOpen(true);
        return;
      }
      */
      // Check if the user has reached the daily limit
      if (!isPaliGPT && totalPromptCount >= maxPrompts) {
        setModalMessage(
          `You have reached the daily limit of ${maxPrompts} prompts. Please log in to continue using the service.`
        );
        setIsModalOpen(true);
        return;
      }
      // Increment prompt count for non-logged-in users
      setTotalPromptCount((prevCount) => prevCount + 1);
      storageManager.save('totalPromptCount', totalPromptCount + 1);
    } else {
      // Fetch the latest prompt count from Firestore
      console.log('Fetching latest prompt count from Firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const currentPromptCount = userData.totalPromptCount || 0;
      const userAccount = userData.account || '';
      const isNurAlHuda = chatbotType === 'nurAlHuda';
      const isNurAlHudaForKids = chatbotType === 'nurAlHudaForKids';

      // Set userMaxPrompts based on user account type and chatbot type
      let userMaxPrompts = maxPrompts;
      if (isPaliGPT) {
        userMaxPrompts = Infinity;
      } else if (userAccount === 'premium'||userAccount === 'enterprise') {
        userMaxPrompts = 40;
      } else if (userAccount === 'hybrid' && (isNurAlHuda || isNurAlHudaForKids)) {
        userMaxPrompts = 40;
      } else if (userAccount === 'basic' && isNurAlHuda) {
        userMaxPrompts = 40;
      } else {
        userMaxPrompts = 5;
      }

      if (currentPromptCount >= userMaxPrompts) {
        setModalMessage(
          `You have reached the daily limit of ${userMaxPrompts} prompts. ${
            (userAccount === 'premium' || userAccount === 'enterprise')
              ? 'Wait until tomorrow to learn more!'
              : 'Upgrade to a premium or enterprise account for more prompts!'
          }`
        );
        setIsModalOpen(true);
        return;
      }      

      // Increment total prompt count using Firebase increment
      console.log('Incrementing total prompt count');
      await updateDoc(doc(db, 'users', user.uid), {
        totalPromptCount: increment(1),
      });

      // Update local state and local storage
      setTotalPromptCount((prevCount) => prevCount + 1);
      storageManager.save('totalPromptCount', totalPromptCount + 1);
    }

    setIsSending(true);
    const userMessage = { sender: 'user', text: currentMessage.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setShowImage(false);

    let localThreadId = threadId;

    if (!localThreadId) {
      try {
        const threadResponse = await createThread(assistantTitle);
        if (threadResponse?.id) {
          setThreadId(threadResponse.id);
          localThreadId = threadResponse.id;
          // Add the thread ID to the user's Firestore document under the correct assistant/chatbot
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              [`${assistantTitle}.Threads`]: arrayUnion(localThreadId),
            });
          }
        } else {
          throw new Error('Thread creation failed: No ID returned');
        }
      } catch (error) {
        console.error('Error creating thread:', error);
        setIsSending(false);
        return;
      }
    }

    try {
      await createMessage(localThreadId, currentMessage, assistantTitle);
      createRun(localThreadId, assistantId, handleNewMessage, handleError, assistantTitle);
    } catch (error) {
      console.error('Communication error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectPrompt = (prompt) => {
    if (totalPromptCount >= maxPrompts) {
      let message = '';
  
      if (accountType === 'premium' || accountType === 'enterprise') {
        message = `You have reached the daily limit of ${maxPrompts} prompts. Wait until tomorrow to learn more!`;
      } else {
        message = `You have reached the daily limit of ${maxPrompts} prompts. Upgrade to a premium or enterprise account for more prompts!`;
      }
  
      setModalMessage(message);
      setIsModalOpen(true);
      return;
    }
  
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

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const sendNegativeReport = (msgReported) => {
    console.log('Negative Report Clicked', msgReported);
    setReportedMessage(msgReported);
    setIsModalOpenReport(true);
  };

  const sendPositiveReport = async (reportedMessage) => {
    console.log('Positive Report Clicked', reportedMessage);
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
    console.log('Message reported\n', reportedMessage, reportFeedbackMessage);
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
    <div className="chatscreen-container" style={{ height: `${windowHeight}px` }}>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleGoToHome}
        confirmLabel="Home"
        closeLabel="Close"
        message={<p className="modal-message">{modalMessage}</p>}
      />

      <Modal
        isOpen={isModalOpenReport}
        onClose={() => setIsModalOpenReport(false)}
        onConfirm={handleReportSubmit}
        confirmLabel="Submit"
        closeLabel="Cancel"
        message={
          <>
            <p className="modal-message">Report this message:</p>
            <div className="modal-submessage-container">{reportedMessage}</div>
            <textarea
              className="modal-textarea"
              onChange={(e) => setReportFeedbackMessage(e.target.value)}
              placeholder="Describe the issue..."
              rows="4"
              cols="50"
            />
          </>
        }
      />

      <div className="chatscreen-header-container">
        <button className="chatscreen-home-button" onClick={handleGoToHome}>
          Home
        </button>
        <div className="chatscreen-header-title">{assistantTitle}</div>
      </div>
      <div ref={scrollViewRef} className="chatscreen-messages-container">
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <div
              className={`chatscreen-message-wrapper ${
                message.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'
              }`}
            >
              {message.sender !== 'user' && (
                <div className="bot-profile-and-actions">
                  <img src={chatbotImage} alt="Bot" className="chatbot-profile-image" />
                  <div className="bot-actions">
                    <button className="thumb-button" onClick={() => sendPositiveReport(message.text)}>
                      👍
                    </button>
                    <button className="thumb-button" onClick={() => sendNegativeReport(message.text)}>
                      👎
                    </button>
                  </div>
                </div>
              )}
              <div
                className={`chatscreen-message-container ${
                  message.sender === 'user' ? 'chatscreen-user-message' : 'chatscreen-bot-message'
                }`}
              >
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
          <img src={chatbotImage} alt={`${assistantTitle} Image`} />
        </div>
      )}

      <SuggestedPrompts
        onSelectPrompt={handleSelectPrompt}
        isSending={isSending}
        chatbotType={chatbotType}
      />

      {maxPrompts - totalPromptCount < 5 && (
        <div className="prompt-count-info">
          <p className="prompt-count-text">
            Prompts used today:{' '}
            {totalPromptCount > maxPrompts
              ? `${maxPrompts}/${maxPrompts}`
              : `${totalPromptCount}/${maxPrompts}`}
          </p>
          {accountType !== 'premium' && totalPromptCount >= maxPrompts && (
            <span className="upgrade-message" onClick={() => navigate('/pricing')}>
              {' '}
              Upgrade for more prompts!
            </span>
          )}
        </div>
      )}

      <div className="chatscreen-input-container">
        <input
          className="chatscreen-input"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSending) handleSendMessage();
          }}
          disabled={isSending}
        />
        <button className="chatscreen-send-button" onClick={handleSendMessage} disabled={isSending}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
