import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import faqData from '../data/faqData.json';
import './FAQ.css';
import faqImage from '../img/FAQ.jpg'; // Adjust the path as needed

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const animationProps = useSpring({
    maxHeight: isOpen ? 1000 : 0,
    opacity: isOpen ? 1 : 0,
    marginTop: isOpen ? 10 : 0,
  });

  return (
    <div 
      className={`faq-item ${isOpen ? 'open' : ''}`} 
      onClick={toggleOpen}
      role="button"
      aria-expanded={isOpen}
      tabIndex={0}
    >
      <img src={faqImage} alt="FAQ Icon" className="faq-icon" />
      <div className="faq-content">
        <div className="faq-question">{question}</div>
        <animated.div className="faq-answer" style={animationProps}>
          {answer}
        </animated.div>
      </div>
    </div>
  );
};

const FAQCategory = ({ category, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const animationProps = useSpring({
    opacity: isOpen ? 1 : 0,
    maxHeight: isOpen ? 1000 : 0,
    overflow: 'hidden',
  });

  return (
    <div>
      <div 
        className="category-header"
        onClick={toggleOpen}
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        {category}
      </div>
      <animated.div style={animationProps}>
        <div className="faq-container">
          {items.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </animated.div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section id="faq" className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-categories">
        {Object.entries(faqData).map(([category, items], index) => (
          <FAQCategory key={index} category={category} items={items} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;