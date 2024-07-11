import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { getPromptsForType } from './SuggestedPrompts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase-config';
import { doc, getDoc, setDoc, increment, addDoc, collection } from 'firebase/firestore';
import Modal from './modal';
import Header from './ChatScreen/Header';
import Messages from './ChatScreen/Messages';
import Input from './ChatScreen/Input';
import PromptCountInfo from './ChatScreen/PromptCountInfo';
import SuggestedPrompts from './SuggestedPrompts';

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
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [maxPrompts, setMaxPrompts] = useState(5);

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
    const fetchUserData = async () => {
      if (user) {
        console.log(`Fetching data for user: ${user.uid}`);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setTotalPromptCount(userData.totalPromptCount || 0);
          setLastResetDate(userData.lastResetDate ? userData.lastResetDate.toDate() : null);
          const userIsPaid = userData.paymentStatus === 'paid';
          setIsPaidUser(userIsPaid);
          setMaxPrompts(userIsPaid ? 40 : 5);
        } else {
          // If the user document doesn't exist, create it
          console.log('User document does not exist, creating a new one');
          await setDoc(doc(db, 'users', user.uid), {
            totalPromptCount: 0,
            lastResetDate: new Date(),
            paymentStatus: 'unpaid'
          });
        }
      } else {
        const sessionPromptCount = sessionStorage.getItem('totalPromptCount');
        const sessionLastResetDate = sessionStorage.getItem('lastResetDate');

        if (sessionPromptCount) {
          setTotalPromptCount(parseInt(sessionPromptCount, 10));
        }

        if (sessionLastResetDate) {
          setLastResetDate(new Date(sessionLastResetDate));
        } else {
          setLastResetDate(new Date());
          sessionStorage.setItem('lastResetDate', new Date().toISOString());
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const checkAndResetPromptCount = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (lastResetDate && lastResetDate < today) {
        console.log('Resetting prompt count for the new day');
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            totalPromptCount: 0,
            lastResetDate: today
          }, { merge: true });
        } else {
          setTotalPromptCount(0);
          sessionStorage.setItem('totalPromptCount', '0');
          sessionStorage.setItem('lastResetDate', today.toISOString());
        }
        setLastResetDate(today);
      }
    };

    checkAndResetPromptCount();
  }, [lastResetDate, user]);

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

    if (!user) {
      if (totalPromptCount >= maxPrompts) {
        setModalMessage(`You have reached the daily limit of ${maxPrompts} prompts. Please log in to continue using the service.`);
        setIsModalOpen(true);
        return;
      }
      setTotalPromptCount(prevCount => prevCount + 1);
      sessionStorage.setItem('totalPromptCount', (totalPromptCount + 1).toString());
    } else {
      // Fetch the latest prompt count from Firestore
      console.log('Fetching latest prompt count from Firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const currentPromptCount = userData.totalPromptCount || 0;
      const userIsPaid = userData.paymentStatus === 'paid';
      const userMaxPrompts = userIsPaid ? 40 : 5;

      if (currentPromptCount >= userMaxPrompts) {
        setModalMessage(`You have reached the daily limit of ${userMaxPrompts} prompts. ${userIsPaid ? 'Wait until tomorrow to learn more!' : 'Upgrade to a paid account for more prompts!'}`);
        setIsModalOpen(true);
        return;
      }

      // Increment total prompt count using Firebase increment
      console.log('Incrementing total prompt count');
      await setDoc(doc(db, 'users', user.uid), {
        totalPromptCount: increment(1)
      }, { merge: true });

      // Update local state
      setTotalPromptCount(prevCount => prevCount + 1);
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
    if (totalPromptCount >= maxPrompts) {
      setModalMessage(`You have reached the daily limit of ${maxPrompts} prompts.`);
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

  const handleModalConfirm = () => {
    navigate('/');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        confirmLabel="Go Home"
        closeLabel="Close"
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

      <Header assistantTitle={assistantTitle} titleSize={titleSize} onHomeClick={handleGoToHome} />
      
      <div ref={scrollViewRef}>
        <Messages
          messages={messages}
          chatbotImage={chatbotImage}
          isSending={isSending}
          accumulatedMessage={accumulatedMessage}
          handlePositiveReport={sendPositiveReport}
          handleNegativeReport={sendNegativeReport}
        />
      </div>

      {showImage && chatbotImage && (
        <div className="chatscreen-message-image">
          <img src={chatbotImage} alt={assistantTitle + " Image"} />
        </div>
      )}

      <SuggestedPrompts onSelectPrompt={handleSelectPrompt} isSending={isSending} chatbotType={chatbotType} />

      {maxPrompts - totalPromptCount < 5 && (
        <PromptCountInfo
          totalPromptCount={totalPromptCount}
          maxPrompts={maxPrompts}
          isPaidUser={isPaidUser}
          onUpgradeClick={() => navigate('/pricing')}
        />
      )}

      <Input
        currentMessage={currentMessage}
        onMessageChange={(e) => setCurrentMessage(e.target.value)}
        onSendMessage={handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
};

export default ChatScreen;
