// src/components/FAQ.jsx
import React, { useState } from 'react';
import faqData from '../data/faqData.json';
import './FAQ.css';
import faqImage from '../img/FAQ.jpg'; // Adjust the path as needed

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

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
        <div className="faq-answer">{answer}</div>
      </div>
    </div>
  );
};

const FAQCategory = ({ category, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

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
      {isOpen && <div className="faq-container">
        {items.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>}
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
