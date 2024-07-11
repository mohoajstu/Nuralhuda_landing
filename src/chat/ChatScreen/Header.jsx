import React from 'react';

const Header = ({ assistantTitle, titleSize, onHomeClick }) => (
  <div className="chatscreen-header-container">
    <button className="chatscreen-home-button" onClick={onHomeClick}>
      Home
    </button>
    <div className="chatscreen-header-title" style={{ fontSize: titleSize }}>
      {assistantTitle}
    </div>
  </div>
);

export default Header;
