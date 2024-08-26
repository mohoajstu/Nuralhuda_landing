import React from 'react';
import { useNavigate } from 'react-router-dom';
import { titleToChatbotTypeMap, titleToImageMap, titleToDescriptionMap } from '../assistantMapping'; // Adjust the import path as needed

import './CSS/dashboardAssistants.css';

const DashboardAssistants = () => {
  const navigate = useNavigate();

  const assistants = Object.keys(titleToChatbotTypeMap).filter(
    (title) => titleToChatbotTypeMap[title] !== 'default'
  );

  return (
    <div className="dashboard-assistants-container">
      {assistants.map((title) => (
        <div
          key={title}
          className="assistant-box"
          onClick={() => navigate(`/chat/${titleToChatbotTypeMap[title]}`)} // Corrected this line
        >
          <div className="assistant-image-container">
            <img
              src={titleToImageMap[title]}
              alt={title}
              className="assistant-image"
            />
          </div>
          <div className="assistant-content">
            <h5>{title}</h5>
            <p>{titleToDescriptionMap[title]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardAssistants;
