import React from 'react';
import { useNavigate } from 'react-router-dom';
import { titleToChatbotTypeMap, titleToImageMap } from '../assistantMapping'; // Adjust the import path as needed

const DashboardAssistants = () => {
  const navigate = useNavigate();

  const assistants = Object.keys(titleToChatbotTypeMap).filter(
    (title) => titleToChatbotTypeMap[title] !== 'default'
  );

  return (
    <div className="dashboard-assistants">
      {assistants.map((title) => (
        <div
          key={title}
          className="assistant-box"
          onClick={() => navigate(`/chat/${titleToChatbotTypeMap[title]}`)}
        >
          <div className="assistant-image-container">
            <img
              src={titleToImageMap[title]}
              alt={title}
              className="assistant-image"
              style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
            />
          </div>
          <button className="assistant-button">{title}</button>
        </div>
      ))}
    </div>
  );
};

export default DashboardAssistants;