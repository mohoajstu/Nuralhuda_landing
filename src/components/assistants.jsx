import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  default: 'default', 
};

export const Assistants = (props) => {
  const navigate = useNavigate();

  const navigateToChat = (chatbotType) => {
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

  // If you need to set the title for an assistant when clicked, you can use setAssistantTitle
   //const handleAssistantClick = (title, type) => {
    //setAssistantTitle(title);
    //navigateToChat(type);
  // };

  return (
    <div id="assistants" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Assistants</h2>
          <p>
            At the heart of our mission is the commitment to provide specialized, user-centric Islamic learning and research tools. Our library of assistants, each with its unique focus, is designed to cater to diverse needs, from general inquiries to educational material for children, and from research assistance to in-depth scholarly exploration.
          </p>
        </div>
        <div className="row">
          <div className="assistants-items">
            {props.data ? props.data.map((d, i) => (
        <div
        key={`${d.title}-${i}`}
        className="col-sm-4 col-md-3 col-lg-3"
        onClick={() => navigateToChat(titleToChatbotTypeMap[d.title] || 'default')} // Or handleAssistantClick(d.title, d.type) if you need to set the title
        style={{ cursor: 'pointer' }}
      >
                <div className="assistants-item">
                  <div className="hover-bg">
                    <div className="hover-text">
                      <h4>{d.title}</h4>
                    </div>
                    <img src={d.smallImage} className="img-responsive" alt={d.title} />
                  </div>
                </div>
              </div>
            )) : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};