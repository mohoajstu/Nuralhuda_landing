import React, { useState } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';

const FiveDAssistant = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slideData, setSlideData] = useState(null);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [error, setError] = useState('');

  const handleTextChange = (e) => setText(e.target.value);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const assistantTitle = '5D Thinking';
    setResponseBuffer('');
    try {
      const thread = await createThread(assistantTitle);
      console.log("Created thread with ID:", thread.id);
      await createMessage(thread.id, text, assistantTitle);
      console.log("Message sent to thread:", text);
      await createRun(thread.id, titleToAssistantIDMap[assistantTitle], handleMessage, handleError, assistantTitle);
    } catch (error) {
      console.error("Error generating slides:", error);
      setError('An error occurred while generating the slides. Please try again.');
      setIsLoading(false);
    }
  };

  const handleMessage = (message) => {
    console.log("Received message:", message.text);
    setResponseBuffer((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        setIsLoading(false);
        console.log("Accumulated response buffer:", prevAccumulated);
        try {
          const response = JSON.parse(prevAccumulated);
          console.log("Parsed response:", JSON.stringify(response, null, 2));

          const slides = response.slides.map((slide) => ({
            dimension: slide.dimension,
            content: slide.content || '',
            explanation: slide.explanation || '',
            observations: slide.observations || '',
            fascinatingFacts: slide.fascinatingFacts || '',
            analogy: slide.analogy || '',
            comparison: slide.comparison || '',
            questions: slide.questions || [],
            conclusion: slide.conclusion || '',
            connections: slide.connections || '',
            allahNames: slide.allahNames ? {
              whatItTells: slide.allahNames.whatItTells || [],
              namesInEnglish: slide.allahNames.namesInEnglish || [],
              namesInArabic: slide.allahNames.namesInArabic || []
            } : null,
            whatIfs: slide.whatIfs || '',
            zikrFikrShukr: slide.zikrFikrShukr ? {
              zikr: slide.zikrFikrShukr.zikr || [],
              fikr: slide.zikrFikrShukr.fikr || [],
              shukr: slide.zikrFikrShukr.shukr || []
            } : null,
            characterLessons: slide.characterLessons || '',
            connectWithQuranHadith: slide.connectWithQuranHadith || ''
          }));
          setSlideData({ title: response.title, slides });
        } catch (error) {
          console.error("Error parsing response:", error);
          setError('An error occurred while parsing the slide data. Please try again.');
        }
        return '';
      } else {
        return prevAccumulated + message.text;
      }
    });
  };

  const handleError = (error) => {
    console.error("Error handling message:", error);
    setError('An error occurred while handling the response. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className="five-d-assistant-container">
      <header className="five-d-assistant-header">
        <h1>5D Assistant</h1>
      </header>
      <div className="input-section">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text content here"
          rows={6}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Generating Slides...' : 'Generate Slides'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
      {slideData && (
        <div className="slide-content">
          <h2>{slideData.title}</h2>
          {slideData.slides.map((slide, index) => (
            <SlideContent key={index} slide={slide} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FiveDAssistant;
