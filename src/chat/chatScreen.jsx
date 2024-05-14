
import React, { useState, useRef, useEffect, useCallback} from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from './openAIUtils';
import { RenderMarkdown } from './RenderMarkdown';  // Assume RenderMarkdown is exported from another file
import { SuggestedPrompts, getPromptsForType} from './SuggestedPrompts';  // Assume SuggestedPrompts is exported from another file
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config'; // Adjust the path as necessary
import Modal from './modal'; // Import the Modal component
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'; // This is the speaker icon from Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// Helper images and prompts maps
import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';

import OpenAI from "openai";


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

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  dangerouslyAllowBrowser: true,
});

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
const [audioSrc, /*setAudioSrc*/] = useState('');
const [isListening, setIsListening] = useState(false);
//const [transcription, setTranscription] = useState("");
const speechRecognitionRef = useRef(null);
const [isSpeaking, setIsSpeaking] = useState(false);

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
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear the input after sending
    setCurrentMessage('');
    setShowImage(false);  // Optionally hide the image after sending a message
    setIsSending(true);

    if (!currentPrompts.includes(currentMessage.trim()) && !user) {
      setIsModalOpen(true);  // Show modal if the user is not authorized
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
      await createMessage(localThreadId, currentMessage.trim());
      
      const runResponse = await createRun(localThreadId, assistantId);
      if (runResponse?.status === "completed") {
        const newMessagesResponse = await openai.beta.threads.messages.list(localThreadId);
        const formattedMessages = newMessagesResponse.data.map(message => ({
          sender: message.role === 'system' ? 'assistant' : message.role,
          text: message.content[0].text.value,
        }));
        setMessages(formattedMessages.reverse());
      }
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
/*
  const fetchSpeechAudio = async (text) => {
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: text,
      });
      const blob = new Blob([await response.arrayBuffer()], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setAudioSrc(url);
    } catch (error) {
      console.error('Error fetching speech audio:', error);
    }
  };
*/
  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }, [audioSrc]);

  const handleTextToSpeech = (text) => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
        synth.cancel(); // This will stop the speech
        setIsSpeaking(false);
    } else {
        if (synth.speaking) {
            synth.cancel(); // Cancel any ongoing speech
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsSpeaking(false); // Update the state when speech ends
        };
        utterance.onerror = (event) => {
            console.error("SpeechSynthesisUtterance error", event.error);
            setIsSpeaking(false);
        };
        synth.speak(utterance);
        setIsSpeaking(true);
    }
};

  /*
  const handleTextToSpeech = (text) => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel(); // This will stop the speech
      setIsSpeaking(false);
    } else {
      if (synth.speaking) {
        synth.cancel(); // Cancel any ongoing speech
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false); // Update the state when speech ends
      };
      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error", event.error);
        setIsSpeaking(false);
      };
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };
*/  

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => {
        console.log('Speech recognition service has started');
    };
      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            console.log('No speech detected');
        } else if (event.error === 'audio-capture') {
            console.log('Microphone not found');
        } else if (event.error === 'not-allowed') {
            console.log('Permission denied by user or browser');
        }
    };
      recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  setCurrentMessage(event.results[i][0].transcript);
              }
          }
      };
      speechRecognitionRef.current = recognition;

      return () => {
          recognition.stop();  // Ensure the recognition stops when the component unmounts
      };
  } else {
      alert("Speech recognition is not supported in this browser.");
  }
}, []);

/*
const handleStartListening = () => {
  if (speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
      setIsListening(true);
  }
};

const handleStopListening = () => {
  if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
      //alert("Stopped listening");  // Optionally notify the user
  }
};
*/

const toggleListening = () => {
  if (isListening) {
      if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
          setIsListening(false);
      }
  } else {
      if (speechRecognitionRef.current) {
          speechRecognitionRef.current.start();
          setIsListening(true);
      }
  }
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

        

       {/* <button
        className="speechButton"
        onClick={() => messages.length && fetchSpeechAudio(messages[messages.length - 1].text)}
        disabled={!messages.length}
        aria-label="Read aloud the latest message"
      >
        <FaVolumeUp />
        </button>*/}

        <div className="buttonContainer">
          <button 
  className="speechButton"
  onClick={() => messages.length && handleTextToSpeech(messages[messages.length - 1].text)}
  disabled={!messages.length}
  aria-label={isSpeaking ? "Stop reading aloud the latest message" : "Read aloud the latest message"}
>
  {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />} 
</button>


    <button className={`speechButton ${isListening ? 'listening' : ''}`} onClick={toggleListening}>
        <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
    </button>
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
