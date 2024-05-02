import React, { useState, useRef, useEffect, useCallback} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OpenAI from "openai";
// Helper images and prompts maps
import nurAlHudaImg from '../img/about-nbg.png';
import nurAlHudaForKidsImg from '../img/nuralhudaforkids.png';
import islamicSocraticMethodImg from '../img/islamic_socratic_method.png';
import iqraWithUsImg from '../img/Nuralhuda-applogo.png';
import { marked } from 'marked';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const parseMarkdown = (markdownText) => {
  // Use marked to convert Markdown text to HTML
  const html = marked(markdownText);
  // Sanitize the HTML using DOMPurify
  const cleanHtml = DOMPurify.sanitize(html);
  // Return the sanitized HTML
  return cleanHtml;
};

const RenderMarkdown = ({ markdown }) => {
  // Convert markdown to sanitized HTML then parse it to JSX
  const html = parseMarkdown(markdown);
  return <>{parse(html)}</>;
};


// Initialize OpenAI client with the default API key
const openai = new OpenAI({apiKey: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA, dangerouslyAllowBrowser: true});

const Header = ({ title }) => (
  <div className="chatscreen-header-title">
    <h6>{title}</h6>
  </div>
);

const SuggestedPrompts = ({ onSelectPrompt, isSending, prompts }) => (
  <div className="chatscreen-prompts-container">
    {prompts.map((prompt, index) => (
      <button
        key={index}
        className="chatscreen-prompt-button"
        onClick={() => onSelectPrompt(prompt)}
        disabled={isSending}
      >
        {prompt}
      </button>
    ))}
  </div>
);

// Function to create a thread
async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

// Function to add a message to the thread and get a response
async function createMessage(threadId, newMessage) {
  try {
    const response = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: newMessage
    });
    return response;
  } catch (error) {
    console.error("Error sending message to thread:", error);
    throw error;
  }
}

// Function to initiate a run with the assistant
async function createRun(threadId, assistantId) {
  try {
    const response = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId
    });
    return response;
  } catch (error) {
    console.error("Error initiating run with assistant:", error);
    throw error;
  }
}

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

const titleToAssistantIDMap = {
  'Nur Al Huda':"asst_0UOsgGXyWL19iwxrR1tqt56p",
  'Nur Al Huda For Kids':"asst_2z9CBAnU88vgmSnZnNHZVaGz",
  'Islamic Socratic Method':"asst_nUrppuSP9pPPjRPHDD3l13bH",
  'Iqra With Us':"asst_NSjlngEyPNwU1PeAcmZZHC9K",
  default: process.env.REACT_APP_NUR_ALHUDA_ASSISTANT_ID, // Use a default assistant if title is not matched
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
  const assistantId = titleToAssistantIDMap[assistantTitle];;

  useEffect(() => {
    scrollViewRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (isSending || !currentMessage.trim()) return;
    const userMessage = { sender: 'user', text: currentMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage('');
    setShowImage(false); // Hide the image after sending a message
    setIsSending(true);

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
      
        <div className="chatscreen-header-container">
        
        <button className="chatscreen-home-button" onClick={handleGoToHome}>
          Home
        </button>
        <Header title={assistantTitle} />
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
