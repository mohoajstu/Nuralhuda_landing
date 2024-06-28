// src/components/FAQ.jsx
import React, { useState } from 'react';
import faqData from '../data/faqData.json';
import './FAQ.css';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={toggleOpen}>
      <div className="faq-question">{question}</div>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

const FAQ = () => {
  return (
    <section id="faq" className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
