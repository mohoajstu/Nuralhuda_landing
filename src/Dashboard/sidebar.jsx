import React from 'react';
import './CSS/sidebar.css';

const Sidebar = ({ setActiveContent, isOpen, toggleSidebar }) => {
    const handleButtonClick = (content) => {
      setActiveContent(content);
    };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <button onClick={() => handleButtonClick('assistants')}>Assistants</button>
        <button onClick={() => handleButtonClick('profile')}>Profile</button>
        <button onClick={() => handleButtonClick('tools')}>Tools</button>
      </div>
      <div className="drawer-handle" onClick={toggleSidebar}>
        <div className="drawer-icon">{isOpen ? '◀' : '▶'}</div>
      </div>
    </div>
  );
};

export default Sidebar;