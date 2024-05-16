import React, { useState, useRef, useEffect, useCallback} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { RenderMarkdown } from './RenderMarkdown';  // Assume RenderMarkdown is exported from another file
import { SuggestedPrompts } from './SuggestedPrompts';  // Assume SuggestedPrompts is exported from another file
// Helper images and prompts maps
import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';



const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  default: 'default', 
};

const titleToImageMap = {
  'Nur Al Huda': nurAlHudaImg,
  'Nur Al Huda For Kids': nurAlHudaForKidsImg,
  'Islamic Socratic Method': islamicSocraticMethodImg,
  'Iqra With Us': iqraWithUsImg,
};

const titleToPromptMap = {
  'Nur Al Huda': ["Who Are You?", "What are the 5 Pillars of Islam?", "What is Ramadan?", "New Random Fact!"],
  'Nur Al Huda For Kids': ["Tell me a story", "Teach me a prayer", "What is Ramadan?", "New Random Fact!"],
  'Islamic Socratic Method': ["Explain Tawhid", "What is Islamic Philosophy?", "Tell me about Ijtihad", "Socratic Method!"],
  'AI for Islamic Research': ["Latest research on Islamic History", "AI and Quranic studies", "Islam and Science intersection", "Research Fact!"],
  'Iqra With Us': ["Let's read a surah together", "Teach me about Tajweed", "What is Iqra?", "Quranic Arabic lesson"],
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
  const chatbotPrompts = titleToPromptMap[assistantTitle] || [];
  const chatbotImage = titleToImageMap[assistantTitle];
  const assistantId = titleToAssistantIDMap[assistantTitle];
  const [streamActive, setStreamActive] = useState(false);  // New state to track stream activity
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [accumulatedMessage, setAccumulatedMessage] = useState('');
  const [isTokenHigh, setIsToken] = useState(false);

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
    let stream;
    if (threadId) {
      stream = createRun(threadId, handleNewMessage, handleError);
      setStreamActive(true);  // Set stream as active
      return () => {
        if (stream) {
          stream.unsubscribe();
          setStreamActive(false);  // Clean up and mark stream as inactive
        }
      };
    }
  }, [threadId]);  // Dependency array

  const handleNewMessage = (message) => {
    //sends bot tokens/words one by one as an object [sender: bot, text: salam] to messages array
    //we need to add code here to make it only send to messages (setMesssage) after concatenated.
    //try finally block to determine end of stream of messages
    //add end token we can detect?
    let botMessage;

    setAccumulatedMessage(prevAccumelated => {
      if(message.text === 'END_TOKEN'){
        setIsToken(true);
        botMessage = { sender: 'assistant', text: prevAccumelated };
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setAccumulatedMessage('');
      } else{
        setIsSending(true);
        const newAccumulated = prevAccumelated + message.text;
        console.log("accum", newAccumulated);  // Logs the actual updated value
        //const partialMessage = { sender: 'assistant', text: message.text };
        return newAccumulated;
      }
      setIsToken(false);
      setIsSending(false);
    });
 };

  const handleError = (error) => {
    console.error('Stream error:', error);
    setStreamActive(false);  // Mark stream as inactive on error
  };

  const handleSendMessage = async () => {
    if (isSending || !currentMessage.trim()) return;

    setIsSending(true);
    const userMessage = { sender: 'user', text: currentMessage.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setShowImage(false);

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
        createRun(localThreadId, assistantId, handleNewMessage, handleError);
    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        setIsSending(false);
    }
};
console.log(messages);
/*  
    try {
      await createMessage(localThreadId, currentMessage);
      createRun(localThreadId, assistantId, (eventType, data) => {
        if (eventType === 'textDelta' || eventType === 'toolCallDelta') {
          setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: data }]);
        }
      });
    } catch (error) {
      console.error("Communication error:", error);
    } finally {
      setIsSending(false);
    }
  };
   */

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
            {messages.map((message, index) => {
              // Only render the divs if message.text has a truthy value
              if (message.text) {
                return (
                  <React.Fragment key={index}>
                    <div className={`chatscreen-message-container ${message.sender === 'user' ? 'chatscreen-user-message' : 'chatscreen-bot-message'}`}>
                      <RenderMarkdown markdown={message.text}/>
                    </div>
                    {isSending && index === messages.length - 1 && (
                      <div className="chatscreen-message-container chatscreen-bot-message">
                        <RenderMarkdown markdown={accumulatedMessage}/>
                      </div>
                    )}
                  </React.Fragment>
                );
              }
              // Return null for falsy message.text values to skip rendering
              return null;
            })}
          </div>

        {showImage && chatbotImage && (
        <div className="chatscreen-message-image">
          <img src={chatbotImage} alt={assistantTitle + " Image"} />
        </div>
        )}

      <SuggestedPrompts onSelectPrompt={handleSelectPrompt} isSending={isSending} prompts={chatbotPrompts} />
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