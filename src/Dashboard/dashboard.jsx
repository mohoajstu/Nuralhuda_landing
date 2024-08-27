import React, { useState } from 'react';
import Sidebar from './sidebar';
import ContentArea from './contentArea';
import './CSS/dashboard.css';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="main-layout">
            {/* Ensure Sidebar is only included if not already included in App.jsx */}
            <ContentArea isSidebarOpen={isSidebarOpen} />
        </div>
    );
};

export default Dashboard;
