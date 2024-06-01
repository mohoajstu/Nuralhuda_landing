import React from "react";
import { Link, useNavigate } from 'react-router-dom';

export const Navigation = (props) => {
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

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <div className="sr-only">Toggle navigation</div>
            <div className="icon-bar"></div>
            <div className="icon-bar"></div>
            <div className="icon-bar"></div>
          </button>
          <a className="navbar-brand page-scroll" href="/">
            <div className="brand-title">Nur Al Huda</div>
            <div className="brand-subtitle">AI for Islamic Research</div>
          </a>
        </div>

        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
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
              <a href="/#assistants" onClick={() => handleNavigation('/#assistants')} className="page-scroll">
                Assistants
              </a>
            </li>
            <li>
              <a href="/#team" onClick={() => handleNavigation('/#team')} className="page-scroll">
                Team
              </a>
            </li>
            {/*<li><Link to="/pricing">Pricing</Link></li>*/}
            <li>
              <a href="/#contact" onClick={() => handleNavigation('/#contact')} className="page-scroll">
                Contact
              </a>
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