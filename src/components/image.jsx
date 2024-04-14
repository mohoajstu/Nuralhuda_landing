import React from "react";

export const Image = ({ title, largeImage, smallImage, iconImg,size }) => {
  const iconStyle = {
    width: size ? `${size}px` : 'auto', // Use the size prop or default to auto
    height: 'auto', // Maintain aspect ratio
  };
  return (
    <div className="portfolio-item">
      <div className="hover-bg">
        {" "}
        <a href={largeImage} title={title} data-lightbox-gallery="gallery1">
          <div className="hover-text">
            <h4>{title}</h4>
          </div>
          <img src={smallImage} className="img-responsive" alt={title} />{" "}
          <img src={iconImg} style={iconStyle} alt="" />
        </a>{" "}
      </div>
    </div>
  );
};
