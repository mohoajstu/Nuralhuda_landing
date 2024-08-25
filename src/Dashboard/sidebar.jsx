// Sidebar.jsx
import React from 'react';
import './CSS/sidebar.css';
import { useNavigate } from 'react-router-dom';
import logo from '../img/about-nbg.png';

const Sidebar = ({ isOpen, toggleSidebar, setActiveContent, activeButton }) => {
    const navigate = useNavigate();
    
    return (
        <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar">
                <a href="/">
                    <div className="dashbrand-container">
                        <img src={logo} alt="Nur Al Huda Logo" className="dashbrand-logo" />
                        <div>
                            <div className="dashbrand-title">Nur Al Huda</div>
                            <div className="dashbrand-subtitle">AI for Islamic Research</div>
                        </div>
                    </div>
                </a>
                <div className="sidebar-content">
                    <div className="main-buttons">
                        <button className={`main-button underline-effect ${activeButton === 'assistants' ? 'active' : ''}`} onClick={() => setActiveContent('assistants')}>
                            Assistants
                        </button>
                        <div className="sub-buttons">
                            <button className="sub-button" onClick={() => navigate('/chat/nurAlHuda')}>Nur Al Huda</button>
                            <button className="sub-button" onClick={() => navigate('/chat/nurAlHudaForKids')}>Nur Al Huda For Kids</button>
                            <button className="sub-button" onClick={() => navigate('/chat/islamicSocraticMethod')}>Islamic Socratic Method</button>
                            <button className="sub-button" onClick={() => navigate('/chat/iqraWithUs')}>Iqra With Us</button>
                            <button className="sub-button" onClick={() => navigate('/chat/muslimReferenceAI')}>Muslim Reference AI</button>
                            <button className="sub-button" onClick={() => navigate('/chat/paliGPT')}>PaliGPT</button>
                            <button className="sub-button" onClick={() => navigate('/chat/fiveDThinking')}>5D Thinking</button>
                        </div>
                        
                        {/* <button className={`main-button underline-effect ${activeButton === 'settings' ? 'active' : ''}`} onClick={() => setActiveContent('settings')}>
                            Settings
                        </button>
                        <div className="sub-buttons">
                            <button className="sub-button">Account</button>
                            <button className="sub-button">Preferences</button>
                            <button className="sub-button">Billing</button>
                        </div> */}
                        
                        <button className={`main-button underline-effect ${activeButton === 'tools' ? 'active' : ''}`} onClick={() => setActiveContent('tools')}>
                            Tools
                        </button>
                        <div className="sub-buttons">
                            <button className="sub-button">Automatic Grader</button>
                            <button className="sub-button">AI Quiz Generator</button>
                            <button className="sub-button">5D Lesson Planner</button>
                        </div>
                    </div>
                
                    <div className="footer-buttons">
                        {/* <button className="footer-button">Terms of Service</button> 
                        <button className="footer-button">Privacy Policy</button> */}
                        <button className="footer-button" onClick={() => navigate('/contact-form')}>Contact Us</button>
                        <p className="footer-text">© 2024 Nur Al Huda. All rights reserved.</p>
                    </div>
                </div>
            </div>
            <div className="drawer-handle" onClick={toggleSidebar}>
                <div className="drawer-icon">{isOpen ? '◀' : '▶'}</div>
            </div>
        </div>
    );
};

export default Sidebar;