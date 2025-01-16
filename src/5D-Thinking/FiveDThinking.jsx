import React, { useState, useEffect, useRef } from 'react';
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


import exportSlidesAsPptx from './Export/ExportAsPPTX.jsx';
import {
    createPresentation,
    updatePresentation,
  } from './Export/ExportAsGoogleSlides'; // Adjust path as necessary

const dimensionColors = {
  Objectives: '0070C0', // Choose any hex color
  Explore: 'fa6666',
  Compare: '000000',
  Question: '64aae8',
  Connect: 'ffa600',
  Appreciate: '35b8b1',
  Activities: 'ffcccb',
};

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

  const [activitiesInput, setActivitiesInput] = useState('');
  const [activitiesFile, setActivitiesFile] = useState(null);

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
    const dimensionsList = ['Objectives', 'Explore', 'Compare', 'Question', 'Connect', 'Appreciate', 'Activities'];

    for (const dimension of dimensionsList) {
      let inputText = '';
      let inputFile = null;

      switch (dimension) {
        case 'Activities':
          inputText = activitiesInput;
          inputFile = activitiesFile;
          break;
        case 'Objectives':
          inputText = objectivesInput;
          inputFile = objectivesFile;
          break;
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
      { name: 'Activities', title: 'Activities', input: dimensionInputs['Activities'] },
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

       // Handle dua
    if (response.dua) {
      slides.push({
        dimension: 'Appreciate',
        dua: response.dua,
        subtopicIndex: subtopicIndex++,
      });
    } 
  } else if (dimensionName === 'Activities') {
      // Map each activity into the expected structure for ActivitiesContent
      const activities = response.activities || [];
      slides.push({
        dimension: 'Activities',
        activities: activities.map((activity, index) => ({
          title: activity.title,
          dimension: activity.dimension,
          objective: activity.objective,
          materials: activity.materials || [],
          instructions: activity.instructions || [],
        })),
      });
    }
  

    return slides;
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
            <button className="export-button" onClick={() => exportSlidesAsPptx(slides)}>
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
