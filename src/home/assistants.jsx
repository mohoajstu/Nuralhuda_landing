import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'Iqra With Us': 'iqraWithUs',
  default: 'default',
};

export const Assistants = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  // Function to navigate to the appropriate chat
  const navigateToChat = (chatbotType) => {
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

  // Function to handle manual tab click
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // Slideshow effect: Automatically cycle through tabs every 10 seconds
  useEffect(() => {
    const tabCount = props.data.length;
    const interval = setInterval(() => {
      setActiveTab((prevTab) => (prevTab + 1) % tabCount); // Cycle through tabs
    }, 10000); // 10-second interval

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [props.data.length]);

  return (
    <div id="assistants" className="assistants-section text-center">
      <div className="container">
        <div className="section-title">
          <h2>Meet Your Assistants</h2>
          <p>
            At the heart of our mission is the commitment to provide specialized, user-centric Islamic learning and research tools. Our library of assistants, each with its unique focus, is designed to cater to diverse needs, from general inquiries to educational material for children, and from research assistance to in-depth scholarly exploration.
          </p>
          <h3>Try Us Now!</h3>
        </div>
        <div className="tabs">
          <ul className="tab-list">
            {props.data.map((d, index) => (
              <li
                key={index}
                className={`tab-item ${activeTab === index ? 'active' : ''}`}
                onClick={() => handleTabClick(index)}
                role="button"
                tabIndex={0}
                aria-selected={activeTab === index}
              >
                {d.title}
              </li>
            ))}
          </ul>
          <div className="tab-content" style={{ position: 'relative', height: '450px' }}>
            <AnimatePresence exitBeforeEnter>
              {props.data.map((d, index) =>
                activeTab === index ? (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <div className="assistant-details">
                      <div
                        className="clickable-image"
                        onClick={() => navigateToChat(titleToChatbotTypeMap[d.title] || 'default')}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={d.smallImage}
                          className="img-responsive hover-effect"
                          alt={d.title}
                          style={{
                            width: '300px',
                            height: '300px',
                            objectFit: 'cover',
                            margin: '0 auto',
                          }}
                        />
                      </div>
                      <h4 className="h4-text">{d.title}</h4>
                      <p>{d.text}</p>
                      <button
                        className="assistant-title-button"
                        onClick={() => navigateToChat(titleToChatbotTypeMap[d.title] || 'default')}
                      >
                        Chat Now
                      </button>
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
