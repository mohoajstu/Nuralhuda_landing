// src/home/WelcomeVideo.jsx
import React from 'react';

const WelcomeVideo = () => {
  return (
    <div className="welcome-video-container">
      <h2>Welcome to Nur Al Huda</h2>
      <h5>We are excited to have you here. Learn more about our vision and mission:</h5>
      <div className="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/iGUnvlVaXak"
          title="Welcome to Nur Al Huda"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default WelcomeVideo;
