import React, { useState, useEffect, useRef } from 'react';
import PptxGenJS from 'pptxgenjs';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';
import LoginModal from '../login/LoginModal'; // Assuming you have a LoginModal component
import { readFileContent } from '../utils/fileUtils';
import { FaBook, FaChevronDown, FaPaperclip, FaExclamationCircle, FaGraduationCap, FaListAlt, FaAlignLeft } from 'react-icons/fa'; // Import icons
import fiveDThinkingImg from '../img/5dlogotransparent.png';

const titleSubtopicMap = {
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: ['Questions', 'Conclusion'],
  Connect: ['Connections', "Allah's Names", 'Analogical Reflection', 'Deeper Connection', 'Contemplation'],
  Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith'],
};

const dimensionColors = {
  Explore: 'fa6666',
  Compare: '000000',
  Question: '64aae8',
  Connect: 'ffa600',
  Appreciate: '35b8b1',
};

const logoUrl = 'https://drive.google.com/uc?export=view&id=1WoF-kUTfs6mxgeXao2gmM9flISNLkbHT';
const base64ImageString = process.env.REACT_APP_BASE64_IMAGE_STRING;

const FiveDAssistant = () => {

  const [selectedDimension, setSelectedDimension] = useState('Explore');

  // State variables for required and optional inputs
  const [topic, setTopic] = useState(''); // Required Topic input
  const [gradeLevel, setGradeLevel] = useState(''); // Optional Grade Level input
  
  // State variables for Topic file upload
  const [topicFile, setTopicFile] = useState(null);
  const [topicPreview, setTopicPreview] = useState('');


  // State variables for each dimension input (Optional)
  const [exploreInput, setExploreInput] = useState('');
  const [exploreFile, setExploreFile] = useState(null);

  const [compareInput, setCompareInput] = useState('');
  const [compareFile, setCompareFile] = useState(null);

  const [questionInput, setQuestionInput] = useState('');
  const [questionFile, setQuestionFile] = useState(null);

  const [connectInput, setConnectInput] = useState('');
  const [connectFile, setConnectFile] = useState(null);

  const [appreciateInput, setAppreciateInput] = useState('');
  const [appreciateFile, setAppreciateFile] = useState(null);

  // Existing state variables
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [responseBuffer, setResponseBuffer] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Add this state variable
  const [error, setError] = useState('');
  const [presentationLink, setPresentationLink] = useState('');

  const [standards, setStandards] = useState('');
  const [standardsFile, setStandardsFile] = useState(null);
  const [standardsPreview, setStandardsPreview] = useState('');

  // State to control the visibility of the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reference for the dropdown to handle clicks outside
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close the dropdown when clicking outside of it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Function to handle dimension selection
  const handleDimensionSelect = (dimension) => {
    setSelectedDimension(dimension);
    setIsDropdownOpen(false);
  };

  // Handlers for input changes
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleGradeLevelChange = (e) => setGradeLevel(e.target.value);

  // Handlers for each dimension input
  const handleExploreInputChange = (e) => setExploreInput(e.target.value);
  const handleCompareInputChange = (e) => setCompareInput(e.target.value);
  const handleQuestionInputChange = (e) => setQuestionInput(e.target.value);
  const handleConnectInputChange = (e) => setConnectInput(e.target.value);
  const handleAppreciateInputChange = (e) => setAppreciateInput(e.target.value);
  

  const handleStandardsChange = (e) => setStandards(e.target.value);

  const handleFileChange = (e, setFile, setPreview = null) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      if (setPreview) {
        readFileContent(file)
          .then((content) => {
            setPreview(content);
          })
          .catch((error) => {
            setError(error.message);
            setPreview('');
            setFile(null);
          });
      }
    }
  };
  

  const handleFileDrop = (e, setFile, setPreview = null) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
      if (setPreview) {
        readFileContent(file)
          .then((content) => {
            setPreview(content);
          })
          .catch((error) => {
            setError(error.message);
            setPreview('');
            setFile(null);
          });
      }
    }
  };
  

  const handleSubmit = async () => {
    // Get topicContent
    let topicContent = topic;
    if (topicFile) {
      topicContent = await readFileContent(topicFile);
    }

    if (!topicContent.trim()) {
      setError('Topic is required to generate the lesson plan.');
      return;
    }

    // Get standardsContent
  let standardsContent = standards;
  if (standardsFile) {
    standardsContent = await readFileContent(standardsFile);
  }

     // Prepare dimension inputs
     const dimensionInputs = {};

    // For each dimension, get the input content
    const dimensionsList = ['Explore', 'Compare', 'Question', 'Connect', 'Appreciate'];
    for (const dimension of dimensionsList) {
      let inputText = '';
      let inputFile = null;

      switch (dimension) {
        case 'Explore':
          inputText = exploreInput;
          inputFile = exploreFile;
          break;
        case 'Compare':
          inputText = compareInput;
          inputFile = compareFile;
          break;
        case 'Question':
          inputText = questionInput;
          inputFile = questionFile;
          break;
        case 'Connect':
          inputText = connectInput;
          inputFile = connectFile;
          break;
        case 'Appreciate':
          inputText = appreciateInput;
          inputFile = appreciateFile;
          break;
        default:
          break;
      }

      let inputContent = inputText;
      if (inputFile) {
        const fileContent = await readFileContent(inputFile);
        inputContent += '\n' + fileContent;
      }

      dimensionInputs[dimension] = inputContent;
    }

    setIsLoading(true);
    setError('');
    setSlides([]);
    const dimensions = [
      { name: 'Explore', title: 'Analytical thinking - Explore', input: dimensionInputs['Explore'] },
      { name: 'Compare', title: 'Analogical thinking - Compare', input: dimensionInputs['Compare'] },
      { name: 'Question', title: 'Critical thinking - Question', input: dimensionInputs['Question'] },
      { name: 'Connect', title: 'Meditative thinking - Connect', input: dimensionInputs['Connect'] },
      { name: 'Appreciate', title: 'Moral thinking - Appreciate', input: dimensionInputs['Appreciate'] },
    ];
    try {
      const assistantTitle = '5D Thinking-1';
      const thread = await createThread(assistantTitle);
      for (const dimension of dimensions) {
        await fetchContentForDimension(
          thread.id,
          dimension,
          topicContent,
          gradeLevel,
          standardsContent,
          assistantTitle
        );
      }
    } catch (error) {
      handleError(error);
    }
  };
  
  const fetchContentForDimension = async (
    threadId,
    dimension,
    topicContent,
    gradeLevel,
    standardsContent,
    assistantTitle
  ) => {
    const dimensionInput = dimension.input || 'N/A';
    const prompt = `
Topic: ${topicContent}
Grade Level: ${gradeLevel || 'N/A'}
Standards: ${standardsContent || 'N/A'}

Dimension: ${dimension.name}
Dimension Input: ${dimensionInput}

Focus only on creating a comprehensive ${dimension.title} thinking response.
`;

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
          setIsLoading(false);
          resolve(); // Resolve to move on even if there's an error
        }
        return '';
      } else {
        return prevAccumulated + message.text;
      }
    });
  };

  const createSlidesFromResponse = (response, dimensionName) => {
    // Existing logic to create slides from the assistant's response
    const slides = [];
    let subtopicIndex = 0;

    const addSlideIfContentExists = (contentKey, slideData) => {
      const content = response[contentKey];
      if (content && (Array.isArray(content) ? content.length > 0 : Object.keys(content).length > 0)) {
        slides.push({ dimension: dimensionName, ...slideData, subtopicIndex: subtopicIndex++ });
      }
    };

    if (dimensionName === 'Explore') {
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('observations', { observations: response.observations });
      addSlideIfContentExists('fascinatingFacts', { fascinatingFacts: response.fascinatingFacts });
    } else if (dimensionName === 'Compare') {
      addSlideIfContentExists('analogy', { analogy: response.analogy });
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('comparison', { comparison: response.comparison });
    } else if (dimensionName === 'Question') {
      addSlideIfContentExists('questions', { questions: response.questions });
      addSlideIfContentExists('conclusion', { conclusion: response.conclusion });
    } else if (dimensionName === 'Connect') {
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
    } else if (dimensionName === 'Appreciate') {
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
      const accessToken = sessionStorage.getItem('googleAuthToken');
      const tokenExpiryTime = sessionStorage.getItem('tokenExpiryTime');
  
      // Check if access token is missing or expired
      if (!accessToken || (tokenExpiryTime && new Date() > new Date(tokenExpiryTime))) {
        throw new Error('Access token is invalid or expired. Please authenticate again.');
      }
  
      const maxRetries = 3;
      let attempt = 0;
      let success = false;
  
      while (attempt < maxRetries && !success) {
        try {
          attempt++;
          const newPresentationId = await createPresentation(accessToken, 'New 5D Lesson Plan');
          await updatePresentation(newPresentationId, accessToken, slides);
          const presentationLink = `https://docs.google.com/presentation/d/${newPresentationId}/edit`;
          setPresentationLink(presentationLink);
          alert('Google Slides presentation created successfully!');
          success = true;
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error);
          if (attempt >= maxRetries) {
            throw new Error('Failed to create Google Slides presentation after multiple attempts.');
          }
        }
      }
    } catch (error) {
      console.error('Error during Google Slides export:', error);
      setError(error.message);
  
      // If an authentication-related error occurs, prompt the user to log in again
      if (error) {
        console.log('Triggering login modal due to expired or missing access token');
        setIsLoginModalOpen(true);
      }
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

  // Function to render the input for the selected dimension
  const renderDimensionInput = () => {
    let inputValue = '';
    let onChangeHandler = () => {};
    let fileValue = null;
    let setFileHandler = () => {};

    switch (selectedDimension) {
      case 'Explore':
        inputValue = exploreInput;
        onChangeHandler = handleExploreInputChange;
        fileValue = exploreFile;
        setFileHandler = setExploreFile;
        break;
      case 'Compare':
        inputValue = compareInput;
        onChangeHandler = handleCompareInputChange;
        fileValue = compareFile;
        setFileHandler = setCompareFile;
        break;
      case 'Question':
        inputValue = questionInput;
        onChangeHandler = handleQuestionInputChange;
        fileValue = questionFile;
        setFileHandler = setQuestionFile;
        break;
      case 'Connect':
        inputValue = connectInput;
        onChangeHandler = handleConnectInputChange;
        fileValue = connectFile;
        setFileHandler = setConnectFile;
        break;
      case 'Appreciate':
        inputValue = appreciateInput;
        onChangeHandler = handleAppreciateInputChange;
        fileValue = appreciateFile;
        setFileHandler = setAppreciateFile;
        break;
      default:
        break;
    }

    return (
      <div className="input-group">
        <h3> <FaBook/> {selectedDimension} Input (Optional):</h3>
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={onChangeHandler}
            placeholder={`Provide specific input for the '${selectedDimension}' dimension`}
            rows={4}
          />
          <label htmlFor={`${selectedDimension}FileInput`} className="file-upload-icon">
            <FaPaperclip />
          </label>
          <input
            type="file"
            id={`${selectedDimension}FileInput`}
            onChange={(e) => handleFileChange(e, setFileHandler)}
            accept=".txt,.doc,.docx,.pdf"
            style={{ display: 'none' }}
          />
        </div>
        {/* Display the uploaded file name if a file is selected */}
        {fileValue && (
          <div className="file-name">
            <p>Uploaded file: {fileValue.name}</p>
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className="five-d-assistant-container">
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={() => {
            console.log('Login successful, closing modal');
            setIsLoginModalOpen(false);
            setError('');
          }}
        />
      )}

      <header className="five-d-assistant-header">
        <h1 className="five-d-title"> 5D Lesson Planner  </h1> 
        <img src={fiveDThinkingImg} alt="5D Lesson Planner" className="five-d-logo" />    
      </header>

      <div className="input-section">
        {/* Topic Input (Required) */}
        <div className="input-group">
          <h3>
            <FaListAlt /> Topic Content (Required):
          </h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setTopicFile, setTopicPreview)}
          >
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter the main topic here"
            />
            <label htmlFor="topicFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="topicFileInput"
              onChange={(e) => handleFileChange(e, setTopicFile, setTopicPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {topicPreview && (
            <div className="file-preview">
              <h4>Topic Preview:</h4>
              <p>
                {topicPreview.slice(0, 500)}
                {topicPreview.length > 500 && '...'}
              </p>
            </div>
          )}
        </div>

        {/* Grade Level Input (Optional) */}
        <div className="input-group">
          <h3> <FaGraduationCap/> Grade Level (Optional):</h3>
          <input
            type="text"
            value={gradeLevel}
            onChange={handleGradeLevelChange}
            placeholder="Specify the grade level (e.g., 9th Grade, Middle School)"
          />
        </div>

        {/* Standards Input */}
        <div className="input-group">
          <h3>
            <FaExclamationCircle /> Standards (Optional):
          </h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setStandardsFile, setStandardsPreview)}
          >
            <input
              type="text"
              value={standards}
              onChange={handleStandardsChange}
              placeholder="Enter the standards to align with (e.g., CCSS, TEKS, NGSS, or your own curriculum standards)"
            />
            <label htmlFor="standardsFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="standardsFileInput"
              onChange={(e) => handleFileChange(e, setStandardsFile, setStandardsPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {standardsPreview && (
            <div className="file-preview">
              <h4>Standards Preview:</h4>
              <p>
                {standardsPreview.slice(0, 500)}
                {standardsPreview.length > 500 && '...'}
              </p>
            </div>
          )}
        </div>

        
      {/* Dimension Selector */}
      <div className="input-group">
        <h4>Select Dimension:</h4>
        <div className="custom-dropdown" ref={dropdownRef}>
          <div
            className="custom-dropdown-selected"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ borderColor: `#${dimensionColors[selectedDimension]}` }}
          >
            {selectedDimension}
            <FaChevronDown style={{ marginLeft: '8px' }} />
          </div>
          {isDropdownOpen && (
            <div className="custom-dropdown-options">
              {Object.keys(dimensionColors).map((dimension) => (
                <div
                  key={dimension}
                  className="custom-dropdown-option"
                  onClick={() => handleDimensionSelect(dimension)}
                  style={{
                    backgroundColor: `#${dimensionColors[dimension]}`,
                    color: '#fff',
                  }}
                >
                  {dimension}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

{/* Input for Selected Dimension */}
{renderDimensionInput()}
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
