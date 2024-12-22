import React, { useContext, useState, useEffect } from 'react';
import ContentArea from './contentArea';
import './CSS/dashboard.css';
import { SidebarContext } from '../SidebarContext'; // Import SidebarContext

const Dashboard = () => {
    const { isSidebarOpen } = useContext(SidebarContext); // Access sidebar state
    const [accountType, setAccountType] = useState(''); // Add accountType state

    useEffect(() => {
        // Check local storage for accountType
        const storedAccountType = localStorage.getItem('accountType');
        if (storedAccountType) {
            setAccountType(storedAccountType);
        } else {
            // Optional: Fallback logic if needed
            setAccountType(''); // Default to '' if not found
        }
    }, []);

    return (
        <div className="main-layout">
            <ContentArea accountType={accountType} />
        </div>
    );
};

export default Dashboard;
