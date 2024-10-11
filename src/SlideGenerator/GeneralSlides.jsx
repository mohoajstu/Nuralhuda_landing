import React from 'react';
import './GeneralSlides.css';

const GeneralSlides = ({ slides }) => {
  return (
    <div className="general-slides-container">
      {slides.map((slide, index) => (
        <div key={index} className="slide">
          <h2>{slide.slideTitle}</h2>
          {typeof slide.slideContent === 'string' ? (
            <p>{slide.slideContent}</p>
          ) : slide.slideContent.paragraphs ? (
            slide.slideContent.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))
          ) : slide.slideContent.bulletPoints ? (
            <ul>
              {slide.slideContent.bulletPoints.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default GeneralSlides;