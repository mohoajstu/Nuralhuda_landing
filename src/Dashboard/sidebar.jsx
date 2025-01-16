import React, {
    useContext,
    useRef,
    useEffect,
  } from "react";
  import "./CSS/sidebar.css";
  import { useNavigate } from "react-router-dom";
  import logo from "../img/about-nbg.png";
  import { SidebarContext } from "../SidebarContext";
  import { motion } from "framer-motion";
  // 1) Swap out the arrow icons for Bars/Times
  import { FaBars, FaTimes } from "react-icons/fa";
  
  function useDimensions(ref) {
    const dimensions = React.useRef({ width: 0, height: 0 });
  
    useEffect(() => {
      if (ref.current) {
        dimensions.current.width = ref.current.offsetWidth;
        dimensions.current.height = ref.current.offsetHeight;
      }
    }, [ref]);
  
    return dimensions.current;
  }
  
  // Circle clip-path variants
  const sidebarVariants = {
    open: (height = 1000) => ({
      clipPath: `circle(${(height * 2) + 30}px at 40px 40px)`,
      transition: {
        type: "spring",
        stiffness: 20,
        restDelta: 2,
      },
    }),
    closed: {
      clipPath: "circle(30px at 40px 40px)",
      transition: {
        delay: 0.1,
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };
  
  // Sub-buttons stagger animation
  const subButtonsVariants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };
  
  // Each menu item fade/slide in
  const menuItemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
  };
  
  const Sidebar = ({ hasNavbar, accountType }) => {
    const navigate = useNavigate();
    const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  
    // Measure the sidebar’s height for the circle radius
    const containerRef = useRef(null);
    const { height } = useDimensions(containerRef);
  
    const handleNavigation = (path) => {
      navigate(path);
      window.location.reload(); // Force a full page reload
    };
  
    // Menu items
    const assistants = [
      { name: "Nur Al Huda", path: "/chat/nurAlHuda" },
      { name: "Nur Al Huda For Kids", path: "/chat/nurAlHudaForKids" },
      { name: "Islamic Socratic Method", path: "/chat/islamicSocraticMethod" },
      { name: "Iqra With Us", path: "/chat/iqraWithUs" },
      { name: "PaliGPT", path: "/chat/paliGPT" },
    ];
  
    const tools = [
      { name: "GraderBot", path: "/tools/graderbot" },
      { name: "Quiz Generator", path: "/tools/quiz-generator" },
      { name: "5D Lesson Planner", path: "/tools/5dthinking" },
      { name: "Presentation Generator", path: "/tools/slidegenerator" },
    ];
  
    return (
      <div
      className={`sidebar-container ${isSidebarOpen ? "open" : "closed"} ${
        hasNavbar ? "with-navbar" : ""
      }`}
    >
        <motion.div
          className="sidebar"
          ref={containerRef}
          initial={false}
          animate={isSidebarOpen ? "open" : "closed"}
          custom={height}
          variants={sidebarVariants}
        >
          <motion.div className="sidebar-bg" />
  
          {/* Sidebar Content */}
          <div className="sidebar-content">
             {/* Brand: Always Visible */}
        

          <div className="dashbrand-container">
          <a href="/">
            <img src={logo} alt="Nur Al Huda" className="dashbrand-logo" />
            {/* Removed "isSidebarOpen &&" check */}
            <div>
              <div className="dashbrand-title">Nur Al Huda</div>
              <div className="dashbrand-subtitle">AI for Islamic Research</div>
            </div>
            </a>
          </div>
        

            <div className="main-buttons">
              <div
                className="main-button underline-effect"
                onClick={() => handleNavigation("/dashboard")}
              >
                Assistants
              </div>
              <motion.div
                className="sub-buttons"
                variants={subButtonsVariants}
                initial={false}
                animate={isSidebarOpen ? "open" : "closed"}
              >
                {assistants.map((assistant) => (
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
  
              {accountType === "enterprise" && (
                <div>
                  <div
                    className="main-button underline-effect"
                    onClick={() => handleNavigation("/dashboard")}
                  >
                    Tools
                  </div>
                  <motion.div
                    className="sub-buttons"
                    variants={subButtonsVariants}
                    initial={false}
                    animate={isSidebarOpen ? "open" : "closed"}
                  >
                    {tools.map((tool) => (
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
  
            <div className="footer-buttons">
              <a
                href="https://billing.stripe.com/p/login/14kfYZ43Qa1L63K3cc"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-button"
              >
                Customer Portal
              </a>
              <button
                className="footer-button"
                onClick={() => navigate("/terms-of-use")}
              >
                Terms of Use
              </button>
              <button
                className="footer-button"
                onClick={() => navigate("/privacy-policy")}
              >
                Privacy Policy
              </button>
              <button
                className="footer-button"
                onClick={() => navigate("/contact-form")}
              >
                Contact Us
              </button>
              <p className="footer-text">© 2024 Nur Al Huda. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
  
        {/* 2) Drawer handle with hamburger vs. X */}
        <div className="drawer-handle" onClick={toggleSidebar}>
          <div className="drawer-icon">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    );
  };
  
  export default Sidebar;
  