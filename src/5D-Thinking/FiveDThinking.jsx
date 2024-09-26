import React, { useState } from 'react';
import PptxGenJS from 'pptxgenjs';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';

const titleSubtopicMap = {
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: ['Questions', 'Conclusion'],
  Connect: ['Connections', "Allah's Names", 'Analogical Reflection', 'Questions For Deeper Connection', 'Contemplation And Appreciation'],
  Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith'],
};

// Updated color codes for each dimension
const dimensionColors = {
  Explore: 'fa6666',
  Compare: '000000',
  Question: '64aae8',
  Connect: 'ffa600',
  Appreciate: '35b8b1',
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
      { name: 'Appreciate', title: 'Moral thinking - Appreciate' },
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
          createRun(
            threadId,
            titleToAssistantIDMap[assistantTitle],
            (message) => handleMessage(message, dimension.name, resolve),
            handleError,
            assistantTitle
          );
        })
        .catch((error) => {
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
          console.error('Error parsing response:', error);
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
    let subtopicIndex = 0;

    const addSlideIfContentExists = (contentKey, slideData) => {
      const content = response[contentKey];
      if (content && (Array.isArray(content) ? content.length > 0 : Object.keys(content).length > 0)) {
        slides.push({ dimension, ...slideData, subtopicIndex: subtopicIndex++ });
      }
    };

    if (dimension === 'Explore') {
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('observations', { observations: response.observations });
      addSlideIfContentExists('fascinatingFacts', { fascinatingFacts: response.fascinatingFacts });
    } else if (dimension === 'Compare') {
      addSlideIfContentExists('analogy', { analogy: response.analogy });
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('comparison', { comparison: response.comparison });
    } else if (dimension === 'Question') {
      addSlideIfContentExists('questions', { questions: response.questions });
      addSlideIfContentExists('conclusion', { conclusion: response.conclusion });
    } else if (dimension === 'Connect') {
      addSlideIfContentExists('connections', { connections: response.connections });
      if (
        response.allahNames &&
        response.allahNames.namesInEnglish &&
        response.allahNames.namesInEnglish.length > 0
      ) {
        slides.push({
          dimension: 'Connect',
          allahNames: response.allahNames,
          subtopicIndex: subtopicIndex++,
        });
      }
      addSlideIfContentExists('analogicalReflection', { analogicalReflection: response.analogicalReflection });
      addSlideIfContentExists('questionsForDeeperConnection', { questionsForDeeperConnection: response.questionsForDeeperConnection });
      addSlideIfContentExists('contemplationAndAppreciation', { contemplationAndAppreciation: response.contemplationAndAppreciation });
    } else if (dimension === 'Appreciate') {
      addSlideIfContentExists('whatIfs', { whatIfs: response.whatIfs });
      if (response.zikrFikrShukr && Object.keys(response.zikrFikrShukr).length > 0) {
        slides.push({
          dimension: 'Appreciate',
          zikrFikrShukr: {
            zikr: response.zikrFikrShukr.zikr,
            fikr: response.zikrFikrShukr.fikr,
            shukr: response.zikrFikrShukr.shukr,
          },
          subtopicIndex: subtopicIndex++,
        });
      }
      addSlideIfContentExists('characterLessons', { characterLessons: response.characterLessons });
      addSlideIfContentExists('connectWithQuran', { connectWithQuran: response.connectWithQuran });
      addSlideIfContentExists('connectWithHadith', { connectWithHadith: response.connectWithHadith });
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

      // Add title box with rounded edges and background color
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fill: { color: dimensionColors[dimension] },
        line: { color: 'FFFFFF' },
        radius: 10, // Rounded edges
      });

      // Add title text centered in the title box
      slide.addText(`${dimension} - ${subtopic}`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: 30,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });

      // Get the content text
      const contentText = getContentText(slideContent);

      if (contentText !== null && contentText.trim() !== '') {
        // Add content text
        slide.addText(contentText, {
          x: '10%',
          y: '20%',
          w: '80%',
          h: '60%',
          fontSize: 20,
          color: '000000',
          align: 'center',
          valign: 'middle',
        });
      } else {
        // Handle special cases where we need to create a table
        if (dimension === 'Connect' && slideContent.allahNames) {
          // Create a table for Allah's Names
          const { whatItTells, namesInEnglish, namesInArabic } = slideContent.allahNames;
          const tableData = [
            ['What it tells us about Allah', 'Names in English', 'Names in Arabic'],
            ...whatItTells.map((item, index) => [
              item,
              namesInEnglish[index],
              namesInArabic[index],
            ]),
          ];
          slide.addTable(tableData, {
            x: '10%',
            y: '30%',
            w: '80%',
            fontSize: 14,
            color: '000000',
            align: 'center',
          });
        } else if (dimension === 'Appreciate' && slideContent.zikrFikrShukr) {
          // Create a table for Zikr Fikr Shukr
          const { zikr, fikr, shukr } = slideContent.zikrFikrShukr;
          const tableData = [
            ['Zikr', 'Fikr', 'Shukr'],
            ...zikr.map((item, index) => [
              item,
              fikr[index],
              shukr[index],
            ]),
          ];
          slide.addTable(tableData, {
            x: '10%',
            y: '30%',
            w: '80%',
            fontSize: 14,
            color: '000000',
            align: 'center',
          });
        }
      }

      // Set slide background color to white
      slide.background = { fill: 'FFFFFF' };
    });

    pptx.writeFile({ fileName: '5D_Lesson_Plan.pptx' });
  };

  // Function to create a new presentation
  const createPresentation = async (accessToken, title) => {
    const response = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error creating presentation: ${error.error.message}`);
    }

    const presentation = await response.json();
    return presentation.presentationId;
  };

  // Updated updatePresentation function
  const updatePresentation = async (presentationId, accessToken, slides) => {
    const requests = [];

    for (const [index, slideContent] of slides.entries()) {
      const pageObjectId = `slide_${index + 1}`;

      // Create a new slide
      requests.push({
        createSlide: {
          objectId: pageObjectId,
          insertionIndex: index,
        },
      });

      // Set slide background color to white
      requests.push({
        updatePageProperties: {
          objectId: pageObjectId,
          pageProperties: {
            pageBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: { red: 1, green: 1, blue: 1 },
                },
              },
            },
          },
          fields: 'pageBackgroundFill.solidFill.color',
        },
      });

      // Add title shape with rounded corners and background color
      const titleElementId = `title_${pageObjectId}`;
      const subtopicTitle = `${slideContent.dimension} - ${getSubtopicTitle(slideContent)}`;

      requests.push({
        createShape: {
          objectId: titleElementId,
          shapeType: 'RECTANGLE', //rectangle shape
          elementProperties: {
            pageObjectId: pageObjectId,
            size: {
              height: { magnitude: 50, unit: 'PT' },
              width: { magnitude: 600, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 20,
              unit: 'PT',
            },
          },
        },
      });

      // Set background color of the title shape
      requests.push({
        updateShapeProperties: {
          objectId: titleElementId,
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: hexToRgb(dimensionColors[slideContent.dimension]),
                },
              },
            },
          },
          fields: 'shapeBackgroundFill.solidFill.color',
        },
      });

      // Insert title text
      requests.push({
        insertText: {
          objectId: titleElementId,
          insertionIndex: 0,
          text: subtopicTitle,
        },
      });

      // Style the title text
      requests.push({
        updateTextStyle: {
          objectId: titleElementId,
          style: {
            fontSize: { magnitude: 30, unit: 'PT' },
            bold: true,
            foregroundColor: {
              opaqueColor: {
                rgbColor: { red: 1, green: 1, blue: 1 }, // White text
              },
            },
          },
          textRange: { type: 'ALL' },
          fields: 'bold,fontSize,foregroundColor',
        },
      });

      // Center-align title text
      requests.push({
        updateParagraphStyle: {
          objectId: titleElementId,
          style: {
            alignment: 'CENTER',
          },
          textRange: { type: 'ALL' },
          fields: 'alignment',
        },
      });

      // Get the content text
      const contentText = getContentText(slideContent);

      if (contentText !== null && contentText.trim() !== '') {
        // If contentText is not null or empty, add a content text box
        const contentElementId = `content_${pageObjectId}`;

        requests.push({
          createShape: {
            objectId: contentElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 350, unit: 'PT' },
                width: { magnitude: 600, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 100,
                unit: 'PT',
              },
            },
          },
        });

        requests.push({
          insertText: {
            objectId: contentElementId,
            insertionIndex: 0,
            text: contentText,
          },
        });

        // Style the content text
        requests.push({
          updateTextStyle: {
            objectId: contentElementId,
            style: {
              fontSize: { magnitude: 20, unit: 'PT' },
              foregroundColor: {
                opaqueColor: {
                  rgbColor: { red: 0, green: 0, blue: 0 }, // Black text
                },
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        // Center-align content text
        requests.push({
          updateParagraphStyle: {
            objectId: contentElementId,
            style: {
              alignment: 'CENTER',
            },
            textRange: { type: 'ALL' },
            fields: 'alignment',
          },
        });
      } else if (slideContent.allahNames || slideContent.zikrFikrShukr) {
        // Handle special cases where we need to create a table
        if (slideContent.dimension === 'Connect' && slideContent.allahNames) {
          // Create a table for Allah's Names
          const tableElementId = `table_${pageObjectId}`;
          const { whatItTells, namesInEnglish, namesInArabic } = slideContent.allahNames;

          const numRows = namesInEnglish.length + 1; // +1 for header row

          requests.push({
            createTable: {
              objectId: tableElementId,
              elementProperties: {
                pageObjectId: pageObjectId,
                size: {
                  height: { magnitude: 300, unit: 'PT' },
                  width: { magnitude: 600, unit: 'PT' },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 50,
                  translateY: 100,
                  unit: 'PT',
                },
              },
              rows: numRows,
              columns: 3,
            },
          });

          // Insert header row and style it
          const headerCells = ['What it tells us about Allah', 'Names in English', 'Names in Arabic'];
          for (let col = 0; col < 3; col++) {
            requests.push(
              ...insertTableCellTextAndStyle(
                tableElementId,
                0,
                col,
                headerCells[col],
                true // isHeader
              )
            );
          }

          // Insert data rows and style them
          for (let row = 1; row < numRows; row++) {
            const data = [whatItTells[row - 1], namesInEnglish[row - 1], namesInArabic[row - 1]];
            for (let col = 0; col < 3; col++) {
              requests.push(
                ...insertTableCellTextAndStyle(
                  tableElementId,
                  row,
                  col,
                  data[col],
                  false, // isHeader
                  row
                )
              );
            }
          }
        } else if (slideContent.dimension === 'Appreciate' && slideContent.zikrFikrShukr) {
          // Create a table for Zikr Fikr Shukr
          const tableElementId = `table_${pageObjectId}`;
          const { zikr, fikr, shukr } = slideContent.zikrFikrShukr;

          const numRows = zikr.length + 1; // +1 for header row

          requests.push({
            createTable: {
              objectId: tableElementId,
              elementProperties: {
                pageObjectId: pageObjectId,
                size: {
                  height: { magnitude: 300, unit: 'PT' },
                  width: { magnitude: 600, unit: 'PT' },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 50,
                  translateY: 100,
                  unit: 'PT',
                },
              },
              rows: numRows,
              columns: 3,
            },
          });

          // Insert header row and style it
          const headerCells = ['Zikr', 'Fikr', 'Shukr'];
          for (let col = 0; col < 3; col++) {
            requests.push(
              ...insertTableCellTextAndStyle(
                tableElementId,
                0,
                col,
                headerCells[col],
                true // isHeader
              )
            );
          }

          // Insert data rows and style them
          for (let row = 1; row < numRows; row++) {
            const data = [zikr[row - 1], fikr[row - 1], shukr[row - 1]];
            for (let col = 0; col < 3; col++) {
              requests.push(
                ...insertTableCellTextAndStyle(
                  tableElementId,
                  row,
                  col,
                  data[col],
                  false, // isHeader
                  row
                )
              );
            }
          }
        }
      } else {
        // Skip creating content if there's no contentText and no special table data
        continue; // Move to the next slideContent
      }
    }

    // Send the batch update request
    const response = await fetch(
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error updating presentation: ${error.error.message}`);
    }
  };

  // Helper function to insert text and style a table cell
  const insertTableCellTextAndStyle = (
    tableElementId,
    rowIndex,
    columnIndex,
    text,
    isHeader = false,
    dataRowIndex = null
  ) => {
    const requests = [];

    // Insert text into cell
    requests.push({
      insertText: {
        objectId: tableElementId,
        cellLocation: { rowIndex, columnIndex },
        insertionIndex: 0,
        text: text || '',
      },
    });

// Style text
requests.push({
  updateTextStyle: {
    objectId: tableElementId,
    cellLocation: { rowIndex, columnIndex },
    style: {
      bold: isHeader,
      fontSize: { magnitude: isHeader ? 14 : 12, unit: 'PT' },
      foregroundColor: {
        opaqueColor: {
          rgbColor: { red: 0, green: 0, blue: 0 }, // Black text
        },
      },
    },
    textRange: { type: 'ALL' },
    fields: 'bold,fontSize,foregroundColor',
  },
});

    // Set cell background color
    let backgroundColor;
  if (isHeader) {
    backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 }; // light gray
  } else {
    backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 }; // Light gray for body cells
  }

    requests.push({
      updateTableCellProperties: {
        objectId: tableElementId,
        tableRange: {
          location: { rowIndex, columnIndex },
          rowSpan: 1,
          columnSpan: 1,
        },
        tableCellProperties: {
          tableCellBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: backgroundColor,
              },
            },
          },
        },
        fields: 'tableCellBackgroundFill.solidFill.color',        
      },
    });

    // Align text in cell
    requests.push({
      updateParagraphStyle: {
        objectId: tableElementId,
        cellLocation: { rowIndex, columnIndex },
        style: {
          alignment: 'CENTER',
        },
        textRange: { type: 'ALL' },
        fields: 'alignment',
      },
    });

    return requests;
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
      // Step 1: Create a new presentation
      const newPresentationId = await createPresentation(accessToken, 'New 5D Lesson Plan');

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

  // Helper functions
  const getContentText = (slideContent) => {
    const keys = Object.keys(slideContent);
    for (const key of keys) {
      if (key !== 'dimension' && key !== 'subtopicIndex' && slideContent[key]) {
        if (Array.isArray(slideContent[key])) {
          return slideContent[key].join('\n');
        } else if (typeof slideContent[key] === 'object') {
          // Return null to indicate that we should handle this separately
          return null;
        } else {
          return slideContent[key];
        }
      }
    }
    return '';
  };

  // Updated getBackgroundColor function
  const getBackgroundColor = (dimension) => {
    const hexColor = dimensionColors[dimension];
    return hexToRgb(hexColor);
  };

  // Updated getHexBackgroundColor function
  const getHexBackgroundColor = (dimension) => {
    return dimensionColors[dimension] || 'FFFFFF';
  };

  // Helper function to convert hex color to rgb object
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex, 16);
    return {
      red: ((bigint >> 16) & 255) / 255,
      green: ((bigint >> 8) & 255) / 255,
      blue: (bigint & 255) / 255,
    };
  };

  const getSubtopicTitle = (slideContent) => {
    const dimension = slideContent.dimension;
    const subtopics = titleSubtopicMap[dimension];
    const subtopicIndex = slideContent.subtopicIndex || 0;
    return subtopics[subtopicIndex];
  };

  const handleError = (error) => {
    console.error('Error occurred:', error);
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
        <button onClick={handleSubmit} disabled={isLoading}>
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
