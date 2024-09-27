import React, { useState } from 'react';
import PptxGenJS from 'pptxgenjs';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import { getAccessToken } from '../login/authTokenManager';
import './FiveDAssistant.css';

const titleSubtopicMap = {
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: ['Questions', 'Conclusion'],
  Connect: ['Connections', "Allah's Names", 'Analogical Reflection', 'Deeper Connection', 'Contemplation'],
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

const logoUrl = 'https://drive.google.com/uc?export=view&id=1WoF-kUTfs6mxgeXao2gmM9flISNLkbHT';
const base64ImageString = 'data:image/png;base64,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';

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

      // Add the logo image to each slide
      slide.addImage({
        x: 8.5,
        y: 0.5,
        w: 1, // Adjust width as needed
        h: 1, // Adjust height as needed
        data: base64ImageString,
      });
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
      }

      // Add the logo image to each slide
      const logoElementId = `logo_${pageObjectId}`;

      requests.push({
        createImage: {
          objectId: logoElementId,
          url: logoUrl,
          elementProperties: {
            pageObjectId: pageObjectId,
            size: {
              height: { magnitude: 50, unit: 'PT' }, // Adjust as needed
              width: { magnitude: 50, unit: 'PT' },  // Adjust as needed
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 600, // Adjust positioning as needed
              translateY: 20, // Adjust positioning as needed
              unit: 'PT',
            },
          },
        },
      });
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
      backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 }; // Light gray
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
  
    try {
      const accessToken = await getAccessToken(); // Ensure this is awaited
      console.log(accessToken);
  
      if (!accessToken) {
        setError('Access token not found or expired. Please sign in with Google again.');
        setIsLoading(false);
        return;
      }
  
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
