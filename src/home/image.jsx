import React from "react";

export const Image = ({ title, largeImage, smallImage, iconImg, size, onClick }) => {
  const iconStyle = {
    width: size ? `${size}px` : 'auto',
    height: 'auto',
  };

  return (
    <div className="assistants-item" onClick={onClick}>
      <div className="hover-bg">
        <a href={largeImage} title={title} data-lightbox-gallery="gallery1">
          <div className="hover-text">
            <h4 className="h4-text">{title}</h4>
          </div>
          <img src={smallImage} className="img-responsive" alt={title} />
          <img src={iconImg} style={iconStyle} alt="" />
        </a>
      </div>
    </div>
  );
};
