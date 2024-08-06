import React, { useState } from 'react';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';

const FiveDAssistant = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [error, setError] = useState('');

  const handleTextChange = (e) => setText(e.target.value);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSlides([]);
    const dimensions = [
      { name: 'Explore', title: 'Analytical thinking - Explore' },
      { name: 'Compare', title: 'Analogical thinking - Compare' },
      { name: 'Question', title: 'Critical thinking - Question' },
      { name: 'Connect', title: 'Meditative thinking - Connect' },
      { name: 'Appreciate', title: 'Moral thinking - Appreciate' }
    ];
    try {
      const assistantTitle = '5D Thinking-1';
      const thread = await createThread(assistantTitle);
      for (const dimension of dimensions) {
        await fetchContentForDimension(thread.id, dimension, text, assistantTitle);
      }
    } catch (error) {
      console.error("Error generating slides:", error);
      setError('An error occurred while generating the slides. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchContentForDimension = async (threadId, dimension, inputText, assistantTitle) => {
    const prompt = `${inputText}\n\nFocus only on creating a comprehensive ${dimension.title} thinking response.`;
    setResponseBuffer(''); // Clear the response buffer for the new dimension
    return new Promise((resolve, reject) => {
      createMessage(threadId, prompt, assistantTitle)
        .then(() => {
          createRun(threadId, titleToAssistantIDMap[assistantTitle], (message) => handleMessage(message, dimension.name, resolve), handleError, assistantTitle);
        })
        .catch(error => {
          console.error(`Error generating content for ${dimension.name}:`, error);
          setError(`An error occurred while generating the ${dimension.title} slides. Please try again.`);
          setIsLoading(false);
          reject(error);
        });
    });
  };

  const handleMessage = (message, dimension, resolve) => {
    setResponseBuffer((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        console.log(`Accumulated response buffer for ${dimension}:`, prevAccumulated);
        try {
          const response = JSON.parse(prevAccumulated);
          const slides = createSlidesFromResponse(response, dimension);
          setSlides((prevSlides) => [...prevSlides, ...slides]);
          setIsLoading(false);
          resolve(); // Resolve the promise to move on to the next dimension
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

  const createSlidesFromResponse = (response, dimension) => {
    const slides = [];
    if (dimension === 'Explore') {
      slides.push({ dimension: 'Explore', content: response.content });
      slides.push({ dimension: 'Explore', explanation: response.explanation });
      slides.push({ dimension: 'Explore', observations: response.observations });
      slides.push({ dimension: 'Explore', fascinatingFacts: response.fascinatingFacts });
    } else if (dimension === 'Compare') {
      slides.push({ dimension: 'Compare', analogy: response.analogy });
      slides.push({ dimension: 'Compare', content: response.content });
      slides.push({ dimension: 'Compare', explanation: response.explanation });
      slides.push({ dimension: 'Compare', comparison: response.comparison });
    } else if (dimension === 'Question') {
      slides.push({ dimension: 'Question', questions: response.questions });
      slides.push({ dimension: 'Question', conclusion: response.conclusion });
    } else if (dimension === 'Connect') {
      slides.push({ dimension: 'Connect', connections: response.connections });
      slides.push({
        dimension: 'Connect',
        allahNames: {
          whatItTells: response.allahNames.whatItTells,
          namesInEnglish: response.allahNames.namesInEnglish,
          namesInArabic: response.allahNames.namesInArabic
        },
        reflection: response.reflection,
        analogicalReflection: response.analogicalReflection,
        questionsForDeeperConnection: response.questionsForDeeperConnection,
        contemplationAndAppreciation: response.contemplationAndAppreciation
      });
    } else if (dimension === 'Appreciate') {
      slides.push({ dimension: 'Appreciate', whatIfs: response.whatIfs });
      slides.push({
        dimension: 'Appreciate',
        zikrFikrShukr: {
          zikr: response.zikrFikrShukr.zikr,
          fikr: response.zikrFikrShukr.fikr,
          shukr: response.zikrFikrShukr.shukr
        }
      });
      slides.push({ dimension: 'Appreciate', characterLessons: response.characterLessons });
      slides.push({ dimension: 'Appreciate', connectWithQuranHadith: response.connectWithQuranHadith });
    }
    return slides;
  };

  const handleError = (error) => {
    console.error("Error handling message:", error);
    setError('An error occurred while handling the response. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className="five-d-assistant-container">
      <header className="five-d-assistant-header">
        <h1>5D Lesson Planner</h1>
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
      {slides.length > 0 && (
        <div className="slide-content">
          <h2>Generated Slides</h2>
          {slides.map((slide, index) => (
            <SlideContent key={index} slide={slide} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FiveDAssistant;
