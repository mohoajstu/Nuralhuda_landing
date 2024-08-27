import React from 'react';
import { useNavigate } from 'react-router-dom';
import { titleToToolTypeMap, titleToToolImageMap, titleToToolDescriptionMap } from '../toolsMapping.js'; // Adjust the import path as needed

import './CSS/dashboardTools.css'; // Create this CSS file similarly to dashboardAssistants.css

const DashboardTools = () => {
  const navigate = useNavigate();

  const tools = Object.keys(titleToToolTypeMap);

  return (
    <div className="dashboard-tools-container">
      {tools.map((title) => (
        <div
          key={title}
          className="tool-box"
          onClick={() => navigate(`/tools/${titleToToolTypeMap[title]}`)}
        >
          <div className="tool-image-container">
            <img
              src={titleToToolImageMap[title]}
              alt={title}
              className="tool-image"
            />
          </div>
          <div className="tool-content">
            <h5>{title}</h5>
            <p>{titleToToolDescriptionMap[title]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardTools;
