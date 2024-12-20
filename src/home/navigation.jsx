import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config';
import logo from '../img/about-nbg.png';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion components

// Animated Toggle Icon Component
const AnimatedToggleIcon = ({ toggle }) => {
  const variant = toggle ? "open" : "closed";

  // Define the variants for each line of the icon
  const topVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 7 },
  };

  const middleVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 },
  };

  const bottomVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -7 },
  };

  const lineProps = {
    stroke: "#000",
    strokeWidth: 2,
    strokeLinecap: "round",
    transition: { duration: 0.3 },
  };

  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      animate={variant}
      style={{ cursor: "pointer" }}
    >
      <motion.line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        variants={topVariants}
        {...lineProps}
      />
      <motion.line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        variants={middleVariants}
        {...lineProps}
      />
      <motion.line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        variants={bottomVariants}
        {...lineProps}
      />
    </motion.svg>
  );
};

export const Navigation = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [user] = useAuthState(auth); // Get the current user
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const handleNavigation = (path) => {
    setNavbarOpen(false);
    setDropdownOpen(false);
    navigate(path);
    if (path.includes('#')) {
      setTimeout(() => {
        const element = document.getElementById(path.split('#')[1]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavbarToggle = () => {
    setNavbarOpen(!navbarOpen);
  };

  const handleAssistantClick = (chatbotType) => {
    setNavbarOpen(false);
    setDropdownOpen(false);
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

  const assistants = [
    { title: 'Nur Al Huda', type: 'nurAlHuda' },
    { title: 'Nur Al Huda For Kids', type: 'nurAlHudaForKids' },
    { title: 'Islamic Socratic Method', type: 'islamicSocraticMethod' },
    { title: 'Iqra With Us', type: 'iqraWithUs' },
    { title: 'PaliGPT', type: 'paliGPT'},
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setNavbarOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarRef]);

  // Animation variants for the dropdown menu
  const dropdownVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        when: 'afterChildren',
      },
    },
  };

  // Animation variants for each menu item
  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
    },
    closed: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <nav id="menu" ref={navbarRef} className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          {/* Navbar Toggle Button for Mobile */}
          <button
            type="button"
            className="navbar-toggle collapsed"
            onClick={handleNavbarToggle}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand page-scroll" href="/">
            <div className="brand-container">
              <img src={logo} alt="Nur Al Huda Logo" className="brand-logo" />
              <div className="brand-text">
                <div className="brand-title">Nur Al Huda</div>
                <div className="brand-subtitle">AI for Islamic Research</div>
              </div>
            </div>
          </a>
        </div>
        <div className={`collapse navbar-collapse ${navbarOpen ? 'in' : ''}`} id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            <li className="dropdown">
              <div className="dropdown-wrapper">
                <a href="/#assistants" onClick={() => handleNavigation('/#assistants')} className="page-scroll">
                  Assistants 
                </a>
                <button
                  className="dropdown-toggle"
                  onClick={handleDropdownToggle}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  style={{ background: 'none', border: 'none', padding: 0, marginLeft: '5px' }}
                >
                  <AnimatedToggleIcon toggle={dropdownOpen} />
                </button>
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    className="dropdown-menu show"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                    style={{ overflow: 'hidden' }}
                  >
                    {assistants.map((assistant, index) => (
                      <motion.li
                        key={index}
                        variants={itemVariants}
                      >
                        <a href="#" onClick={() => handleAssistantClick(assistant.type)}>
                          {assistant.title}
                        </a>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
            <li>
              <a href="/#about" onClick={() => handleNavigation('/#about')} className="page-scroll">
                About
              </a>
            </li>
            {/*<li>
              <a href="/#features" onClick={() => handleNavigation('/#features')} className="page-scroll">
                Features
              </a>
            </li>
            <li>
              <a href="/#team" onClick={() => handleNavigation('/#team')} className="page-scroll">
                Team
              </a>
            </li>*/}
            <li>
              <a href="/contact-form" onClick={() => handleNavigation('/contact-form')} className="page-scroll">
                Contact
              </a>
            </li>
            <li>
              <Link to="/pricing" onClick={() => handleNavigation('/pricing')}>Pricing</Link>
            </li>
            <li>
              <Link to="/login" onClick={() => handleNavigation('/login')}>Login</Link>  
            </li>
            {user && (
              <li>
                <Link to="/dashboard" onClick={() => handleNavigation('/dashboard')}>Dashboard</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
