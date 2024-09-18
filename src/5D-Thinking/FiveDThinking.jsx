import React, { useState } from 'react';
import PptxGenJS from 'pptxgenjs';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';

// The template presentation ID (from your shared Google Slides link)
const templateId = '1heYm0snZ8upxRHmcrt1UZoiHUNUptrbZdpFcTUkZcVA';

const titleSubtopicMap = {
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: ['Questions', 'Conclusion'],
  Connect: ['Connections', "Allah's Names", 'Analogical Reflection', 'Questions For Deeper Connection', 'Contemplation And Appreciation'],
  Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith']
};

const FiveDAssistant = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [error, setError] = useState('');
  const [presentationLink, setPresentationLink] = useState('');

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
      handleError(error);
    }
  };

  const fetchContentForDimension = async (threadId, dimension, inputText, assistantTitle) => {
    const prompt = `${inputText}\n\nFocus only on creating a comprehensive ${dimension.title} thinking response.`;
    return new Promise((resolve, reject) => {
      createMessage(threadId, prompt, assistantTitle)
        .then(() => {
          createRun(threadId, titleToAssistantIDMap[assistantTitle], (message) => handleMessage(message, dimension.name, resolve), handleError, assistantTitle);
        })
        .catch(error => {
          handleError(error);
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
          namesInArabic: response.allahNames.namesInArabic,
        },
        analogicalReflection: response.analogicalReflection,
        questionsForDeeperConnection: response.questionsForDeeperConnection,
        contemplationAndAppreciation: response.contemplationAndAppreciation,
      });
    } else if (dimension === 'Appreciate') {
      slides.push({ dimension: 'Appreciate', whatIfs: response.whatIfs });
      slides.push({
        dimension: 'Appreciate',
        zikrFikrShukr: {
          zikr: response.zikrFikrShukr.zikr,
          fikr: response.zikrFikrShukr.fikr,
          shukr: response.zikrFikrShukr.shukr,
        },
      });
      slides.push({ dimension: 'Appreciate', characterLessons: response.characterLessons });
      slides.push({ dimension: 'Appreciate', connectWithQuran: response.connectWithQuran });
      slides.push({ dimension: 'Appreciate', connectWithHadith: response.connectWithHadith });
    }

    return slides;
  };

  const exportSlidesAsPptx = () => {
    const pptx = new PptxGenJS();

    // Initialize subtopicIndex to 0 for each dimension
    const subtopicIndexes = {
      Explore: 0,
      Compare: 0,
      Question: 0,
      Connect: 0,
      Appreciate: 0,
    };

    slides.forEach((slideContent) => {
      const slide = pptx.addSlide();
      const dimension = slideContent.dimension;

      // Get the current subtopic index for this dimension
      const subtopicIndex = subtopicIndexes[dimension];

      // Get the corresponding subtopic title
      const subtopic = titleSubtopicMap[dimension][subtopicIndex];

      // Increment the subtopic index for the next slide in this dimension
      subtopicIndexes[dimension]++;

      // Add title centered at the top
      slide.addText(`${dimension} - ${subtopic}`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        fontSize: 30,
        bold: true,
        color: 'ffffff',
        align: 'center',
      });

      // Add the content based on the subtopic and dimension
      switch (dimension) {
        case 'Explore':
          if (subtopic === 'Content' && slideContent.content) {
            slide.addText(slideContent.content, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Explanation' && slideContent.explanation) {
            slide.addText(slideContent.explanation, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Observations' && slideContent.observations) {
            slide.addText(slideContent.observations, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Fascinating Facts' && slideContent.fascinatingFacts) {
            slide.addText(slideContent.fascinatingFacts, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          }
          slide.background = { fill: "f4a460" };
          break;

        case 'Compare':
          if (subtopic === 'Analogy' && slideContent.analogy) {
            slide.addText(slideContent.analogy, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Content' && slideContent.content) {
            slide.addText(slideContent.content, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Explanation' && slideContent.explanation) {
            slide.addText(slideContent.explanation, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Comparison' && slideContent.comparison) {
            slide.addText(slideContent.comparison, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          }
          slide.background = { fill: "66cdaa" };
          break;

        case 'Question':
          if (subtopic === 'Questions' && slideContent.questions && slideContent.questions.length > 0) {
            slide.addText(slideContent.questions.join('\n'), {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Conclusion' && slideContent.conclusion) {
            slide.addText(slideContent.conclusion, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          }
          slide.background = { fill: "f08080" };
          break;

        case 'Connect':
          if (subtopic === 'Connections' && slideContent.connections) {
            slide.addText(slideContent.connections, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === "Allah's Names" && slideContent.allahNames && slideContent.allahNames.whatItTells) {
            slide.addTable([
              [
                { text: 'What it tells us about Allah', options: { bold: true, color: 'ffffff' } },
                { text: 'Names in English', options: { bold: true, color: 'ffffff' } },
                { text: 'Names in Arabic', options: { bold: true, color: 'ffffff' } }
              ],
              ...(slideContent.allahNames.whatItTells.map((item, index) => [
                item || '',  // Ensuring no undefined values are passed
                slideContent.allahNames.namesInEnglish[index] || '',
                slideContent.allahNames.namesInArabic[index] || ''
              ]) || [])
            ], {
              x: '10%',
              y: '20%',
              w: '80%',
              fontSize: 12,
              color: 'ffffff',
            });
          } else if (subtopic === 'Analogical Reflection' && slideContent.analogicalReflection) {
            slide.addText(slideContent.analogicalReflection, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Questions For Deeper Connection' && slideContent.questionsForDeeperConnection) {
            slide.addText(slideContent.questionsForDeeperConnection.join('\n'), {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Contemplation And Appreciation' && slideContent.contemplationAndAppreciation) {
            slide.addText(slideContent.contemplationAndAppreciation, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          }
          slide.background = { fill: "90ee90" };
          break;

        case 'Appreciate':
          if (subtopic === 'What ifs' && slideContent.whatIfs) {
            slide.addText(slideContent.whatIfs, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 24,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Zikr Fikr Shukr' && slideContent.zikrFikrShukr && slideContent.zikrFikrShukr.zikr) {
            slide.addTable([
              [
                { text: 'Zikr', options: { bold: true, color: 'ffffff' } },
                { text: 'Fikr', options: { bold: true, color: 'ffffff' } },
                { text: 'Shukr', options: { bold: true, color: 'ffffff' } }
              ],
              ...(slideContent.zikrFikrShukr.zikr.map((item, index) => [
                item || '',
                slideContent.zikrFikrShukr.fikr[index] || '',
                slideContent.zikrFikrShukr.shukr[index] || ''
              ]) || [])
            ], {
              x: '10%',
              y: '30%',
              w: '80%',
              fontSize: 14,
              color: 'ffffff',
            });
          } else if (subtopic === 'Character Lessons' && slideContent.characterLessons) {
            slide.addText(slideContent.characterLessons, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Connect With Quran' && slideContent.connectWithQuran) {
            slide.addText(slideContent.connectWithQuran, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          } else if (subtopic === 'Connect With Hadith' && slideContent.connectWithHadith) {
            slide.addText(slideContent.connectWithHadith, {
              x: '10%',
              y: '50%',
              w: '80%',
              fontSize: 20,
              color: 'ffffff',
              align: 'center',
              valign: 'middle',
            });
          }
          slide.background = { fill: "dda0dd" };
          break;
      }
    });

    pptx.writeFile({ fileName: '5D_Lesson_Plan.pptx' });
  };

  // Function to copy the template
  const copyTemplate = async (templateId, accessToken) => {
    const copyResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${templateId}/copy`, 
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New 5D Lesson Plan',  // Name for the new presentation
        }),
      }
    );
    const copyResult = await copyResponse.json();
    return copyResult.id;  // This is the new copied presentation ID
  };

  // Function to update the new presentation
  const updatePresentation = async (presentationId, accessToken, slides) => {
    const requests = [];

    slides.forEach((slideContent, index) => {
      const pageObjectId = `slide_${index + 1}`;

      // Add content text box
      const contentText = getContentText(slideContent);

      requests.push({
        insertText: {
          objectId: `content_${pageObjectId}`,
          text: contentText,
        },
      });
    });

    await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );
  };

  // Main function to export slides
  const exportSlidesToGoogleSlides = async () => {
    if (!slides.length) {
      alert('Please generate slides first.');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    const accessToken = sessionStorage.getItem('googleAuthToken');
  
    if (!accessToken) {
      setError('Access token not found. Please sign in with Google.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Copy the template presentation
      const newPresentationId = await copyTemplate(templateId, accessToken);

      // Step 2: Modify the new presentation with dynamic content
      await updatePresentation(newPresentationId, accessToken, slides);

      // Step 3: Update the UI with the new presentation link
      const presentationLink = `https://docs.google.com/presentation/d/${newPresentationId}/edit`;
      setPresentationLink(presentationLink);
      alert('Google Slides presentation created successfully!');
    } catch (error) {
      console.error('Error exporting slides:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };  

  const getContentText = (slideContent) => {
    // Extract the appropriate content based on the dimension and subtopic
    const keys = Object.keys(slideContent);
    for (const key of keys) {
      if (key !== 'dimension' && slideContent[key]) {
        if (Array.isArray(slideContent[key])) {
          return slideContent[key].join('\n');
        } else if (typeof slideContent[key] === 'object') {
          // Handle nested objects if necessary
          return JSON.stringify(slideContent[key], null, 2);
        } else {
          return slideContent[key];
        }
      }
    }
    return '';
  };

  const getBackgroundColor = (dimension) => {
    switch (dimension) {
      case 'Explore':
        return { red: 0.956, green: 0.643, blue: 0.376 };
      case 'Compare':
        return { red: 0.4, green: 0.8, blue: 0.667 };
      case 'Question':
        return { red: 0.941, green: 0.502, blue: 0.502 };
      case 'Connect':
        return { red: 0.565, green: 0.933, blue: 0.565 };
      case 'Appreciate':
        return { red: 0.867, green: 0.627, blue: 0.867 };
      default:
        return { red: 1, green: 1, blue: 1 };
    }
  };

  const handleError = (error) => {
    console.error("Error occurred:", error);
    setError('An error occurred. Please try again.');
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
          <div className="export-buttons">
            <button className="export-button" onClick={exportSlidesAsPptx}>
              Export as PowerPoint
            </button>
            <button
              className="export-button"
              onClick={exportSlidesToGoogleSlides}
              disabled={isLoading}
            >
              {isLoading ? 'Exporting...' : 'Export to Google Slides'}
            </button>
          </div>
          {presentationLink && (
            <div className="presentation-link">
              <p>Your presentation is ready:</p>
              <a href={presentationLink} target="_blank" rel="noopener noreferrer">
                Open Presentation
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FiveDAssistant;
