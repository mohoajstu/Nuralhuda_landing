// Tools.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';


export const Tools = (props) => {
  const navigate = useNavigate();

  // Function to navigate to the appropriate tool page
  const navigateToTool = (toolType) => {
    navigate(`/tools/${encodeURIComponent(toolType)}`);
  };

  return (
    <div id="tools" className="tools-section">
      <div className="tools-container">
        <div className="section-title">
          <h2>Our Tools</h2>
          <p>
            We offer a variety of tools to enhance your learning experience. Explore our tools below.
          </p>
        </div>
        <div className="tools-grid">
          {props.data
            ? props.data.map((tool, index) => (
                <div
                  key={index}
                  className="tool-card"
                  onClick={() => navigateToTool(tool.type)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={tool.smallImage}
                    alt={tool.title}
                    className="tool-image"
                  />
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
              ))
            : 'Loading...'}
        </div>
      </div>
    </div>
  );
};
