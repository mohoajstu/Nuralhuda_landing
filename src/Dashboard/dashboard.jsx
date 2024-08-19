import React, { useState } from 'react';
import Sidebar from './sidebar';
import ContentArea from './contentArea';
import './CSS/dashboard.css';

const Dashboard = () => {
    const [activeContent, setActiveContent] = useState('assistants');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="main-layout">
            <Sidebar 
                setActiveContent={setActiveContent} 
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <ContentArea 
                activeContent={activeContent} 
                isSidebarOpen={isSidebarOpen}
            />
        </div>
    );
};

export default Dashboard;