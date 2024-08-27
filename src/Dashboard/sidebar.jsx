import React, { useContext } from 'react';
import './CSS/sidebar.css';
import { useNavigate } from 'react-router-dom';
import logo from '../img/about-nbg.png';
import { SidebarContext } from '../SidebarContext'; // Import SidebarContext

const Sidebar = ({ hasNavbar }) => {
    const navigate = useNavigate();
    const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext); // Access sidebar state and toggle function

    const handleNavigation = (path) => {
        navigate(path);
        window.location.reload(); // Force a full page reload
    };

    return (
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'} ${hasNavbar ? 'with-navbar' : ''}`}>
            <div className="sidebar">
                <a href="/dashboard">
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
                        <div className="main-button underline-effect" onClick={() => handleNavigation('/dashboard')}>Assistants</div>
                        <div className="sub-buttons">
                            <button className="sub-button" onClick={() => handleNavigation('/chat/nurAlHuda')}>Nur Al Huda</button>
                            <button className="sub-button" onClick={() => handleNavigation('/chat/nurAlHudaForKids')}>Nur Al Huda For Kids</button>
                            <button className="sub-button" onClick={() => handleNavigation('/chat/islamicSocraticMethod')}>Islamic Socratic Method</button>
                            <button className="sub-button" onClick={() => handleNavigation('/chat/iqraWithUs')}>Iqra With Us</button>
                            {/* Uncomment the following lines if you want to include more assistants */}
                            {/* <button className="sub-button" onClick={() => handleNavigation('/chat/muslimReferenceAI')}>Muslim Reference AI</button>
                            <button className="sub-button" onClick={() => handleNavigation('/chat/paliGPT')}>PaliGPT</button>
                            <button className="sub-button" onClick={() => handleNavigation('/chat/fiveDThinking')}>5D Thinking</button> */}
                        </div>

                        {/* <button className={`main-button underline-effect ${activeButton === 'settings' ? 'active' : ''}`} onClick={() => setActiveContent('settings')}>
                            Settings
                        </button>
                        <div className="sub-buttons">
                            <button className="sub-button">Account</button>
                            <button className="sub-button">Preferences</button>
                            <button className="sub-button">Billing</button>
                        </div> */}

                        <button className="main-button underline-effect" onClick={() => handleNavigation('/dashboard')}>Tools</button>
                        <div className="sub-buttons">
                            <button className="sub-button" onClick={() => handleNavigation('/tools/graderbot')}>GraderBot</button>
                            <button className="sub-button" onClick={() => handleNavigation('/tools/quiz-generator')}>Quiz Generator</button>
                            <button className="sub-button" onClick={() => handleNavigation('/tools/5dthinking')}>5D Lesson Planner</button>
                        </div>
                    </div>
                
                    <div className="footer-buttons">
                        {/* Uncomment the following lines if you want to include Terms of Service and Privacy Policy */}
                        {/* <button className="footer-button">Terms of Service</button> 
                        <button className="footer-button">Privacy Policy</button> */}
                        <button className="footer-button" onClick={() => handleNavigation('/contact-form')}>Contact Us</button>
                        <p className="footer-text">© 2024 Nur Al Huda. All rights reserved.</p>
                    </div>
                </div>
            </div>
            <div className="drawer-handle" onClick={toggleSidebar}>
                <div className="drawer-icon">{isSidebarOpen ? '◀' : '▶'}</div>
            </div>
        </div>
    );
};

export default Sidebar;
