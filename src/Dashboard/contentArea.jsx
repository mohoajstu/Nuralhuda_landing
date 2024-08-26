import React from 'react';
import './CSS/contentArea.css';
import DashboardAssistants from "./dashboardAssistants";
import DashboardProfile from "./dashboardProfile";
import DashboardTools from "./dashboardTools";

const ContentArea = ({ activeContent, isSidebarOpen }) => {
  const renderContent = () => {
    switch (activeContent) {
        case 'assistants':
            return <DashboardAssistants/>;
        case 'profile':
            return <DashboardProfile/>;
        case 'tools':
            return <DashboardTools/>;
        default:
            return <DashboardAssistants/>;
    }
  };

  return (
    <div className={`content-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {renderContent()}
    </div>
  );
};

export default ContentArea;
