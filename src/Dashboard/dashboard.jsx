import React, { useContext } from 'react';
import ContentArea from './contentArea';
import './CSS/dashboard.css';
import { SidebarContext } from '../SidebarContext'; // Import SidebarContext

const Dashboard = () => {
    const { isSidebarOpen } = useContext(SidebarContext); // Access sidebar state

    return (
        <div className={`main-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <ContentArea />
        </div>
    );
};

export default Dashboard;
