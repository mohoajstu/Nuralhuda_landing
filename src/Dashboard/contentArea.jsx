import React from 'react';
import './CSS/contentArea.css';
import DashboardAssistants from "./dashboardAssistants";
import DashboardTools from "./dashboardTools";

const ContentArea = ({ isSidebarOpen, accountType }) => {
  return (
    <div className={`content-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="content-section">
        <h2>Assistants</h2>
        <DashboardAssistants />
      </div>
      
      {/*
      {/* Conditionally render Tools section only for enterprise users }
      {accountType === 'enterprise' && (
        <div className="content-section">
          <h2>Tools</h2>
          <DashboardTools />
        </div>
      )}
      */}

      {/* Conditionally render Tools section only for public users */}
      {accountType === '' && (
        <div className="content-section">
          <h2>Tools</h2>
          <DashboardTools />
        </div>
      )}
    </div>
  );
};

export default ContentArea;
