import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const navigateToChat = (chatbotType) => {
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

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
              <li key={index} className={`tab-item ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabClick(index)}>
                {d.title}
              </li>
            ))}
          </ul>
          <div className="tab-content">
            {props.data.map((d, index) => (
              <div key={index} className={`tab-panel ${activeTab === index ? 'active' : ''}`}>
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
                      style={{ width: '300px', height: '300px', objectFit: 'cover', margin: '0 auto' }}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
