import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

export const Navigation = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
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
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

  const assistants = [
    { title: 'Nur Al Huda', type: 'nurAlHuda' },
    { title: 'Nur Al Huda For Kids', type: 'nurAlHudaForKids' },
    { title: 'Islamic Socratic Method', type: 'islamicSocraticMethod' },
    { title: 'Iqra With Us', type: 'iqraWithUs' },
  ];

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
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
            <div className="brand-title">Nur Al Huda</div>
            <div className="brand-subtitle">AI for Islamic Research</div>
          </a>
        </div>
        <div className={`collapse navbar-collapse ${navbarOpen ? 'in' : ''}`} id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            <li className="dropdown">
              <div className="dropdown-wrapper">
                <a href="/#assistants" onClick={() => handleNavigation('/#assistants')} className="page-scroll">
                  Assistants 
                </a>
                <button className="dropdown-toggle" onClick={handleDropdownToggle} aria-haspopup="true" aria-expanded={dropdownOpen}>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
              </div>
              <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                {assistants.map((assistant, index) => (
                  <li key={index}>
                    <a href="#" onClick={() => handleAssistantClick(assistant.type)}>
                      {assistant.title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <a href="/#about" onClick={() => handleNavigation('/#about')} className="page-scroll">
                About
              </a>
            </li>
            <li>
              <a href="/#features" onClick={() => handleNavigation('/#features')} className="page-scroll">
                Features
              </a>
            </li>
            <li>
              <a href="/#team" onClick={() => handleNavigation('/#team')} className="page-scroll">
                Team
              </a>
            </li>
            <li>
              <a href="/#contact" onClick={() => handleNavigation('/#contact')} className="page-scroll">
                Contact
              </a>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>  
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
