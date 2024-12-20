import React, { useContext } from 'react';
import './CSS/sidebar.css';
import { useNavigate } from 'react-router-dom';
import logo from '../img/about-nbg.png';
import { SidebarContext } from '../SidebarContext'; // Import SidebarContext
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion components
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons

const Sidebar = ({ hasNavbar, accountType }) => {
    const navigate = useNavigate();
    const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext); // Access sidebar state and toggle function

    const handleNavigation = (path) => {
        navigate(path);
        window.location.reload(); // Force a full page reload
    };

    // Animation variants for the sidebar
    const sidebarVariants = {
        open: {
            width: '250px',
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1, // Add delay to the opening animation
            },
        },
        closed: {
            width: '60px',
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.3, // Add delay to the closing animation
            },
        },
    };

    // Animation variants for the sub-buttons container with stagger effect
    const subButtonsVariants = {
        open: {
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.2, // Delay before items start animating in
            },
        },
        closed: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    };

    // Animation variants for individual menu items
    const menuItemVariants = {
        open: {
            opacity: 1,
            x: 0,
        },
        closed: {
            opacity: 0,
            x: -20,
        },
    };

    const assistants = [
        { name: 'Nur Al Huda', path: '/chat/nurAlHuda' },
        { name: 'Nur Al Huda For Kids', path: '/chat/nurAlHudaForKids' },
        { name: 'Islamic Socratic Method', path: '/chat/islamicSocraticMethod' },
        { name: 'Iqra With Us', path: '/chat/iqraWithUs' },
        { name: 'PaliGPT', path: '/chat/paliGPT'}
        // Add more assistants here if needed
    ];

    const tools = [
        { name: 'GraderBot', path: '/tools/graderbot' },
        { name: 'Quiz Generator', path: '/tools/quiz-generator' },
        { name: '5D Lesson Planner', path: '/tools/5dthinking' },
        { name: 'Presentation Generator', path: '/tools/slidegenerator' },
        // Add more tools here if needed
    ];

    return (
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'} ${hasNavbar ? 'with-navbar' : ''}`}>
            <motion.div
                className="sidebar"
                variants={sidebarVariants}
                animate={isSidebarOpen ? 'open' : 'closed'}
                initial={false}
            >
                <a href="/">
                    <div className="dashbrand-container">
                        <img src={logo} alt="Nur Al Huda Logo" className="dashbrand-logo" />
                        {isSidebarOpen && (
                            <div>
                                <div className="dashbrand-title">Nur Al Huda</div>
                                <div className="dashbrand-subtitle">AI for Islamic Research</div>
                            </div>
                        )}
                    </div>
                </a>
                <div className="sidebar-content">
                    <div className="main-buttons">
                        <div className="main-button underline-effect" onClick={() => handleNavigation('/dashboard')}>
                            Assistants
                        </div>
                        <motion.div
                            className="sub-buttons"
                            variants={subButtonsVariants}
                            initial={false}
                            animate={isSidebarOpen ? 'open' : 'closed'}
                        >
                            {assistants.map((assistant, index) => (
                                <motion.button
                                    key={assistant.name}
                                    className="sub-button"
                                    onClick={() => handleNavigation(assistant.path)}
                                    variants={menuItemVariants}
                                >
                                    {assistant.name}
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Conditionally render Tools section for enterprise users */}
                        {accountType === 'enterprise' && (
                            <div>
                                <div className="main-button underline-effect" onClick={() => handleNavigation('/dashboard')}>
                                    Tools
                                </div>
                                <motion.div
                                    className="sub-buttons"
                                    variants={subButtonsVariants}
                                    initial={false}
                                    animate={isSidebarOpen ? 'open' : 'closed'}
                                >
                                    {tools.map((tool, index) => (
                                        <motion.button
                                            key={tool.name}
                                            className="sub-button"
                                            onClick={() => handleNavigation(tool.path)}
                                            variants={menuItemVariants}
                                        >
                                            {tool.name}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </div>
                    {/* <button className={`main-button underline-effect ${activeButton === 'settings' ? 'active' : ''}`} onClick={() => setActiveContent('settings')}>
                        Settings
                    </button>
                    <div className="sub-buttons">
                        <button className="sub-button">Account</button>
                        <button className="sub-button">Preferences</button>
                        <button className="sub-button">Billing</button>
                    </div> */}
                    <div className="footer-buttons">
                        {/* Uncommented footer buttons */}
                        <button className="footer-button" onClick={() => navigate('/terms-of-use')}>
                            Terms of Use
                        </button>
                        <button className="footer-button" onClick={() => navigate('/privacy-policy')}>
                            Privacy Policy
                        </button>
                        <button className="footer-button" onClick={() => navigate('/contact-form')}>
                            Contact Us
                        </button>
                        <p className="footer-text">© 2024 Nur Al Huda. All rights reserved.</p>
                    </div>
                </div>
            </motion.div>
            <div className="drawer-handle" onClick={toggleSidebar}>
                <div className="drawer-icon">
                    {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
