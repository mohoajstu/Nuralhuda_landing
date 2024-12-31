import React, { useState, useEffect, useRef } from 'react';
import PptxGenJS from 'pptxgenjs';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import SlideContent from './SlideContent';
import './FiveDAssistant.css';
import LoginModal from '../login/LoginModal'; // Assuming you have a LoginModal component
import { readFileContent } from '../utils/fileUtils';
import { FaBook, FaChevronDown, FaPaperclip, FaExclamationCircle, FaGraduationCap, FaListAlt } from 'react-icons/fa'; // Import icons
import fiveDThinkingImg from '../img/5dlogotransparent.png';

import { auth, db } from '../config/firebase-config'; // Adjust path based on your setup
import { doc, getDoc, updateDoc, arrayUnion, increment, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { title } from 'process';


const titleSubtopicMap = {
  Objectives: ['Learning Objectives'], // Optional
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: ['Negation of Chance', 'Negation of Material Causes', 'Negation of Nature', 'Conclusion'],
  // Old: Connect: ['Connections', "Allah's Names", 'Analogical Reflection', 'Deeper Connection', 'Contemplation'],
  Connect: ['Interdependency', 'Interconnectedness', "Allah's Names"], 
  Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith'],
};


const dimensionColors = {
  Objectives: '0070C0', // Choose any hex color
  Explore: 'fa6666',
  Compare: '000000',
  Question: '64aae8',
  Connect: 'ffa600',
  Appreciate: '35b8b1',
};

const logoUrl = 'https://drive.google.com/uc?export=view&id=1WoF-kUTfs6mxgeXao2gmM9flISNLkbHT';
const base64ImageString = process.env.REACT_APP_BASE64_IMAGE_STRING;

const FiveDAssistant = () => {
  const [user] = useAuthState(auth);

  const [selectedDimension, setSelectedDimension] = useState('Explore');

  // State variables for required and optional inputs
  const [topic, setTopic] = useState(''); // Required Topic input
  const [gradeLevel, setGradeLevel] = useState(''); // Optional Grade Level input
  
  // State variables for Topic file upload
  const [topicFile, setTopicFile] = useState(null);
  const [topicPreview, setTopicPreview] = useState('');

  // State variables for each dimension input (Optional)

  // State variables for Objectives dimension input
  const [objectivesInput, setObjectivesInput] = useState('');
  const [objectivesFile, setObjectivesFile] = useState(null);


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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
  
  const fetchUserData = async () => {
    if (!user) return;
  
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Create the user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        usageCount: 0,
        threads: [],
      });
    }
  };

  // Helper function to capitalize words and replace underscores
const capitalizeWords = (text = '') => {
  return text
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  // Function to handle dimension selection
  const handleDimensionSelect = (dimension) => {
    setSelectedDimension(dimension);
    setIsDropdownOpen(false);
  };

  // Handlers for input changes
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleGradeLevelChange = (e) => setGradeLevel(e.target.value);

  // Handlers for each dimension input

  const handleObjectivesInputChange = (e) => setObjectivesInput(e.target.value);
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
    const dimensionsList = ['Objectives', 'Explore', 'Compare', 'Question', 'Connect', 'Appreciate'];

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
      { name: 'Objectives', title: 'Learning Objectives', input: dimensionInputs ['Objectives']},
      { name: 'Explore', title: 'Analytical thinking - Explore', input: dimensionInputs['Explore'] },
      { name: 'Compare', title: 'Analogical thinking - Compare', input: dimensionInputs['Compare'] },
      { name: 'Question', title: 'Critical thinking - Question', input: dimensionInputs['Question'] },
      { name: 'Connect', title: 'Meditative thinking - Connect', input: dimensionInputs['Connect'] },
      { name: 'Appreciate', title: 'Moral thinking - Appreciate', input: dimensionInputs['Appreciate'] },
    ];

    try {
      const assistantTitle = '5D Thinking-1';
      
      const thread = await createThread(assistantTitle);

      // Store the thread and update usage count in Firebase
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          '5DThinking.threads': arrayUnion(thread.id),
          '5DThinking.usageCount': increment(1),
        });
      }

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

  /**
   * ---------------------------
   * UPDATED createSlidesFromResponse
   * ---------------------------
   */
  const createSlidesFromResponse = (response, dimensionName) => {
    console.log('dimensionName:', dimensionName, 'response:', response);
    const slides = [];
    let subtopicIndex = 0;

    const addSlideIfContentExists = (contentKey, slideData) => {
      const content = response[contentKey];
      if (
        content &&
        (Array.isArray(content) ? content.length > 0 : typeof content === 'object' || content.trim?.())
      ) {
        slides.push({ dimension: dimensionName, ...slideData, subtopicIndex: subtopicIndex++ });
      }
    };
  
  if (dimensionName === 'Objectives') {
    // For example, if the JSON contains "learningObjectives" with categories
    if (response.learningObjectives) {
      // Option A: put everything on ONE slide
      slides.push({
        dimension: 'Objectives',
        learningObjectives: response.learningObjectives,
        subtopicIndex: 0, // If you use subtopics
      });
    }
  }  else if (dimensionName === 'Explore') {
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('observations', { observations: response.observations });
      addSlideIfContentExists('fascinatingFacts', { fascinatingFacts: response.fascinatingFacts });

    } else if (dimensionName === 'Compare') {
      addSlideIfContentExists('analogy', { analogy: response.analogy });
      addSlideIfContentExists('content', { content: response.content });
      addSlideIfContentExists('explanation', { explanation: response.explanation });
      addSlideIfContentExists('comparison', { comparison: response.comparison });

    }  else if (dimensionName === 'Question') {
      // We know the JSON shape is:
      // {
      //   dimension: "Question",
      //   questions: {
      //     negation_of_chance: [...],
      //     negation_of_material_causes: [...],
      //     negation_of_nature: [...]
      //   },
      //   conclusion: "..."
      // }
    
      // 1) Negation of Chance
      if (response.questions?.negation_of_chance) {
        slides.push({
          dimension: 'Question',
          subtopicIndex: 0, // => "Negation of Chance"
          questions: response.questions.negation_of_chance,
        });
      }
    
      // 2) Negation of Material Causes
      if (response.questions?.negation_of_material_causes) {
        slides.push({
          dimension: 'Question',
          subtopicIndex: 1, // => "Negation of Material Causes"
          questions: response.questions.negation_of_material_causes,
        });
      }
    
      // 3) Negation of Nature
      if (response.questions?.negation_of_nature) {
        slides.push({
          dimension: 'Question',
          subtopicIndex: 2, // => "Negation of Nature"
          questions: response.questions.negation_of_nature,
        });
      }
    
      // 4) Conclusion
      if (response.conclusion) {
        slides.push({
          dimension: 'Question',
          subtopicIndex: 3, // => "Conclusion"
          conclusion: response.conclusion,
        });
      }
    }  else if (dimensionName === 'Connect') {
      // We expect:
      // {
      //   "dimension": "Connect",
      //   "connections": {
      //     "interdependency": "...",
      //     "interconnectedness": "..."
      //   },
      //   "allahNames": {
      //     "namesInEnglish": [...],
      //     "namesInArabic": [...],
      //     "whatItTells": [...]
      //   }
      // }
    
      const c = response.connections || {};
    
      // 1) Interdependency => subtopicIndex = 0
      if (c.interdependency) {
        slides.push({
          dimension: 'Connect',
          subtopicIndex: 0, // "Interdependency"
          interdependency: c.interdependency, 
        });
      }
    
      // 2) Interconnectedness => subtopicIndex = 1
      if (c.interconnectedness) {
        slides.push({
          dimension: 'Connect',
          subtopicIndex: 1, // "Interconnectedness"
          interconnectedness: c.interconnectedness,
        });
      }
    
      // 3) Allah's Names => subtopicIndex = 2
      //   Note: allahNames is top-level in the JSON, not inside `connections`
      if (response.allahNames) {
        slides.push({
          dimension: 'Connect',
          subtopicIndex: 2, // "Allah's Names"
          allahNames: response.allahNames,
        });
      }
    
      // If for some reason we also have additional fields (like analogicalReflection, etc.),
      // we can still do an addSlideIfContentExists approach:
      addSlideIfContentExists('analogicalReflection', {
        analogicalReflection: response.analogicalReflection,
      });
      addSlideIfContentExists('questionsForDeeperConnection', {
        questionsForDeeperConnection: response.questionsForDeeperConnection,
      });
      addSlideIfContentExists('contemplationAndAppreciation', {
        contemplationAndAppreciation: response.contemplationAndAppreciation,
      });

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
      Objectives: 0,
      Explore: 0,
      Compare: 0,
      Question: 0,
      Connect: 0,
      Appreciate: 0,
    };
  
    slides.forEach((slideContent) => {
      const slide = pptx.addSlide();
      const dimension = slideContent.dimension;
  
      // Get subtopic index and increment
      const subtopicIndex = subtopicIndexes[dimension];
      subtopicIndexes[dimension]++;
  
      // Title text
      const subtopic = titleSubtopicMap[dimension][subtopicIndex] || 'Output';
  
      // ─────────────────────────────────────────────────────────
      // 1) Draw the colored title bar across the top
      // ─────────────────────────────────────────────────────────
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,         // 0.5 inch from left
        y: 0.3,         // 0.3 inch from top (so it's higher up)
        w: 9,           // 9 inches wide
        h: 0.7,         // 0.7 inch tall
        fill: { color: dimensionColors[dimension] },
        line: { color: 'FFFFFF' },
        radius: 10,     // Rounded corners
      });
  
      slide.addText(`${dimension} - ${subtopic}`, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.7,
        fontSize: 30,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
  
      // ─────────────────────────────────────────────────────────
      // 2) If it's the Objectives dimension, do a custom layout.
      //    Otherwise, check contentText or special cases.
      // ─────────────────────────────────────────────────────────
      if (dimension === 'Objectives') {
        const learningObjectives = slideContent.learningObjectives || {};
  
        // Flatten all objective arrays into one
        const bulletPoints = Object.values(learningObjectives)
          .flat()
          .filter((obj) => obj.trim().length > 0);
  
        // Intro text
        slide.addText('After this lesson, learners will be able to:', {
          x: 0.7,
          y: 1.2,        // start below the title bar
          w: 8.6,
          fontSize: 20,
          bold: true,
          color: '000000',
          align: 'left',
        });
  
        if (bulletPoints.length > 0) {
          // Add bullet list
          slide.addText(bulletPoints.join('\n'), {
            x: 0.7,
            y: 1.8,       // a bit lower
            w: 8.6,
            h: 3.5,       // reserve vertical space
            fontSize: 18,
            color: '000000',
            align: 'left',
            bullet: true,
            autoFit: true,
          });
        } else {
          slide.addText('No learning objectives available.', {
            x: 1,
            y: 2,
            w: 8,
            fontSize: 20,
            color: '000000',
            align: 'center',
          });
        }
  
      } else {
        // ─────────────────────────────────────────────────────────
        // 3) For other dimensions, see if we have contentText
        // ─────────────────────────────────────────────────────────
        const contentText = getContentText(slideContent);
  
        // If contentText is non-empty
        if (contentText && contentText.trim() !== '') {
          slide.addText(contentText, {
            x: 0.7,
            y: 1.2,
            w: 8.6,
            h: 3.5,
            fontSize: 20,
            color: '000000',
            align: 'center',
            valign: 'middle',
            autoFit: true,  // helps if text is large
          });
        } else {
          // 4) Special-case for Connect or Appreciate tables
          if (dimension === 'Connect' && slideContent.allahNames) {
            const { whatItTells, namesInEnglish, namesInArabic } = slideContent.allahNames;
            const tableData = [
              ['What it tells us about Allah', 'Names in English', 'Names in Arabic'],
              ...whatItTells.map((item, idx) => [
                item,
                namesInEnglish[idx],
                namesInArabic[idx],
              ]),
            ];
            slide.addTable(tableData, {
              x: 0.7,
              y: 1.8,
              w: 8.6,
              fontSize: 14,
              color: '000000',
              align: 'center',
            });
          } else if (dimension === 'Appreciate' && slideContent.zikrFikrShukr) {
            const { zikr, fikr, shukr } = slideContent.zikrFikrShukr;
            const tableData = [
              ['Zikr', 'Fikr', 'Shukr'],
              ...zikr.map((item, idx) => [item, fikr[idx], shukr[idx]]),
            ];
            slide.addTable(tableData, {
              x: 0.7,
              y: 1.8,
              w: 8.6,
              fontSize: 14,
              color: '000000',
              align: 'center',
            });
          }
        }
      }
  
      // ─────────────────────────────────────────────────────────
      // 5) Set background color and add your logo
      // ─────────────────────────────────────────────────────────
      slide.background = { fill: 'FFFFFF' };
  
      slide.addImage({
        x: 8.5,
        y: 0.3,
        w: 0.7,
        h: 0.7,
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
    const dimension = slideContent.dimension;
    const pageObjectId = `slide_${index + 1}`;

    // 1) Create a new slide
    requests.push({
      createSlide: {
        objectId: pageObjectId,
        insertionIndex: index,
      },
    });

    // 2) Set slide background color to white
    requests.push({
      updatePageProperties: {
        objectId: pageObjectId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: { red: 1, green: 1, blue: 1 }, // White
              },
            },
          },
        },
        fields: 'pageBackgroundFill.solidFill.color',
      },
    });

    // 3) Create a title rectangle (like a header bar)
    const titleElementId = `title_${pageObjectId}`;
    const subtopicTitle = `${dimension} - ${getSubtopicTitle(slideContent)}`;

    requests.push({
      createShape: {
        objectId: titleElementId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: pageObjectId,
          size: {
            height: { magnitude: 50, unit: 'PT' },
            width: { magnitude: 600, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,  // ~0.7 in from left
            translateY: 20,  // ~0.28 in from top
            unit: 'PT',
          },
        },
      },
    });

    // 4) Fill that rectangle using the dimension color
    requests.push({
      updateShapeProperties: {
        objectId: titleElementId,
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: hexToRgb(dimensionColors[dimension]),
              },
            },
          },
        },
        fields: 'shapeBackgroundFill.solidFill.color',
      },
    });

    // 5) Insert the slide title text
    requests.push({
      insertText: {
        objectId: titleElementId,
        insertionIndex: 0,
        text: subtopicTitle,
      },
    });

    // 6) Style the title text
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

    // 7) Center-align title text
    requests.push({
      updateParagraphStyle: {
        objectId: titleElementId,
        style: { alignment: 'CENTER' },
        textRange: { type: 'ALL' },
        fields: 'alignment',
      },
    });

    // ─────────────────────────────────────────────
    //  Special Handling for "Objectives" Dimension
    // ─────────────────────────────────────────────
    if (dimension === 'Objectives') {
      // Flatten all categories of learningObjectives
      const lo = slideContent.learningObjectives || {};
      const bulletPoints = Object.values(lo).flat().filter((obj) => obj.trim() !== '');

      // 1) Create shape for the intro text
      const introElementId = `intro_${pageObjectId}`;
      requests.push({
        createShape: {
          objectId: introElementId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: pageObjectId,
            size: {
              height: { magnitude: 30, unit: 'PT' },
              width: { magnitude: 500, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 100, // below the title bar
              unit: 'PT',
            },
          },
        },
      });

      // Insert "After this lesson..." text
      requests.push({
        insertText: {
          objectId: introElementId,
          insertionIndex: 0,
          text: 'After this lesson, learners will be able to:',
        },
      });

      // Style the intro text
      requests.push({
        updateTextStyle: {
          objectId: introElementId,
          style: {
            fontSize: { magnitude: 18, unit: 'PT' },
            bold: true,
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } }, // black
            },
          },
          textRange: { type: 'ALL' },
          fields: 'bold,fontSize,foregroundColor',
        },
      });

      // 2) If we have bullet points, create a shape for them
      if (bulletPoints.length > 0) {
        const bulletsElementId = `objectivesBullets_${pageObjectId}`;
        requests.push({
          createShape: {
            objectId: bulletsElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 250, unit: 'PT' },
                width: { magnitude: 500, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 140, 
                unit: 'PT',
              },
            },
          },
        });

        // Insert the bullet text
        requests.push({
          insertText: {
            objectId: bulletsElementId,
            insertionIndex: 0,
            text: bulletPoints.join('\n'),
          },
        });

        // Style bullet text
        requests.push({
          updateTextStyle: {
            objectId: bulletsElementId,
            style: {
              fontSize: { magnitude: 16, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } }, // black
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        // Turn each line into bullets
        requests.push({
          createParagraphBullets: {
            objectId: bulletsElementId,
            textRange: { type: 'ALL' },
            bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
          },
        });
      } else {
        // fallback text if no objectives
        const fallbackId = `fallback_${pageObjectId}`;
        requests.push({
          createShape: {
            objectId: fallbackId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 50, unit: 'PT' },
                width: { magnitude: 500, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 140,
                unit: 'PT',
              },
            },
          },
        });
        requests.push({
          insertText: {
            objectId: fallbackId,
            insertionIndex: 0,
            text: 'No learning objectives available.',
          },
        });
      }

    } else {
      // ──────────────────────────────────────────────────
      // For other dimensions, we do the contentText logic
      // ──────────────────────────────────────────────────
      const contentText = getContentText(slideContent);

      if (contentText && contentText.trim() !== '') {
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
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        // Center align
        requests.push({
          updateParagraphStyle: {
            objectId: contentElementId,
            style: { alignment: 'CENTER' },
            textRange: { type: 'ALL' },
            fields: 'alignment',
          },
        });
      } 
      else if (slideContent.allahNames || slideContent.zikrFikrShukr) {
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
            const data = [
              whatItTells[row - 1] || '',
              namesInEnglish[row - 1] || '',
              namesInArabic[row - 1] || '',
            ];
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
            const data = [
              zikr[row - 1] || '',
              fikr[row - 1] || '',
              shukr[row - 1] || '',
            ];
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
    }

    // 8) Add your logo image
    const logoElementId = `logo_${pageObjectId}`;
    requests.push({
      createImage: {
        objectId: logoElementId,
        url: logoUrl,
        elementProperties: {
          pageObjectId: pageObjectId,
          size: {
            height: { magnitude: 50, unit: 'PT' },
            width: { magnitude: 50, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 600,
            translateY: 20,
            unit: 'PT',
          },
        },
      },
    });
  } // end for-of

  // Finally, send the batch update
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
  
  /**
   * ------------------------------------
   * UPDATED getContentText
   *  - to gracefully handle questionCategory
   * ------------------------------------
   */

    const getContentText = (slideContent) => {
        if (slideContent.dimension === 'Objectives') {
          // Convert the `learningObjectives` object into a bullet list of categories and items
          const lo = slideContent.learningObjectives || {};
          let bulletString = '';
          for (const [category, items] of Object.entries(lo)) {
            bulletString += `${capitalizeWords(category)}:\n`;
            items.forEach((obj) => {
              bulletString += ` - ${obj}\n`;
            });
            bulletString += '\n';
          }
          return bulletString;
        }
      
      if (slideContent.dimension === 'Question') {
        // If it's one of the first 3 subtopics, we have questions (an array)
        if (
          slideContent.subtopicIndex < 3 &&
          Array.isArray(slideContent.questions) &&
          slideContent.questions.length > 0
        ) {
          // Join them with newline so it looks like bullet points in a text box
          return slideContent.questions.join('\n');
        }
        // If it's subtopicIndex 3, it's the conclusion
        if (slideContent.subtopicIndex === 3 && slideContent.conclusion) {
          // Prepend a label if you want
          return  slideContent.conclusion;
        }
      }

    // Check for other keys
    const keys = Object.keys(slideContent);
    for (const key of keys) {
      // Skip dimension, subtopicIndex, questionCategory, questions already handled
      if (
        ['dimension', 'subtopicIndex', 'questionCategory', 'questions', 'allahNames', 'zikrFikrShukr'].includes(key)
      ) {
        continue;
      }
      if (slideContent[key]) {
        if (Array.isArray(slideContent[key])) {
          return slideContent[key].join('\n');
        } else if (typeof slideContent[key] === 'string') {
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
    return subtopics[subtopicIndex] || 'Output';
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
      case 'Objectives':
        inputValue = objectivesInput;
        onChangeHandler = handleObjectivesInputChange;
        fileValue = objectivesFile;
        setFileHandler = setObjectivesFile;
        break;
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
        <h1 className="five-d-title"> 5D Lesson Planner </h1> 
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

        {/* Standards Input (Optional) */}
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
