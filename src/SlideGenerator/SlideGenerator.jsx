import React, { useState } from 'react';
import {
  FaPaperclip,
  FaBook,
  FaGraduationCap,
  FaExclamationCircle,
  FaListAlt,
  FaDownload,
  FaFilePowerpoint,
  FaGoogleDrive,
  FaFileWord
} from 'react-icons/fa';
import { readFileContent } from '../utils/fileUtils'; // Assuming there's a utility for reading file content
import './SlideGenerator.css'; // Assuming there's a CSS file for styling
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import GeneralSlides from './GeneralSlides';
import PptxGenJS from 'pptxgenjs';
import slideGeneratorIMG from '../img/prez-gen.png';

const SlideGenerator = () => {
  // State variables to hold user inputs
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [additionalCriteria, setAdditionalCriteria] = useState('');
  const [standards, setStandards] = useState('');
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topicFile, setTopicFile] = useState(null);
  const [standardsFile, setStandardsFile] = useState(null);
  const [additionalCriteriaFile, setAdditionalCriteriaFile] = useState(null);
  const [additionalCriteriaPreview, setAdditionalCriteriaPreview] = useState('');
  const [responseBuffer, setResponseBuffer] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handlers for input changes
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleGradeLevelChange = (e) => setGradeLevel(e.target.value);
  const handleAdditionalCriteriaChange = (e) => setAdditionalCriteria(e.target.value);
  const handleStandardsChange = (e) => setStandards(e.target.value);

  const handleFileChange = async (e, setFile, setInput) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      try {
        const content = await readFileContent(file);
        setInput(content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const handleFileDrop = async (e, setFile, setPreview) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
      try {
        const content = await readFileContent(file);
        setPreview(content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  // Function to handle slide generation
  const handleGenerateSlides = async () => {
    if (!topic.trim()) {
      alert('Please provide a Topic to generate slides.');
      return;
    }

    setIsLoading(true);

    try {
      const assistantTitle = 'Slide Generator';
      const thread = await createThread(assistantTitle);

      // Create the prompt for the assistant
      const prompt = `
        Topic: ${topic}
        Grade Level: ${gradeLevel || 'N/A'}
        Standards: ${standards || 'N/A'}
        Additional Criteria: ${additionalCriteria || 'N/A'}
        
        Please generate detailed content for a slide presentation on the topic provided.
      `;

      // Send the prompt to create a message in the thread
      await createMessage(thread.id, prompt, assistantTitle);

      // Run the assistant to get the response
      createRun(
        thread.id,
        titleToAssistantIDMap[assistantTitle],
        (message) => handleMessage(message),
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error('Error initiating slide generation:', error);
      alert('An error occurred while generating slides. Please try again.');
      setIsLoading(false);
    }
  };

  const handleMessage = (message) => {
    setResponseBuffer((prevAccumulated) => {
      if (message.text === 'END_TOKEN') {
        console.log('Accumulated response buffer:', prevAccumulated);
        try {
          const response = JSON.parse(prevAccumulated);
          console.log('Parsed response:', response);
          if (response.slides && Array.isArray(response.slides)) {
            setSlides(response.slides);
          } else {
            console.error('Response does not contain a valid slides array:', response);
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          alert('An error occurred while parsing the slide data. Please try again.');
        }
        setIsLoading(false);
        return ''; // Reset the buffer after parsing
      } else {
        return prevAccumulated + message.text;
      }
    });
  };

  const handleError = (error) => {
    console.error('Error during assistant run:', error);
    alert('An error occurred while generating slides. Please try again.');
    setIsLoading(false);
  };

  // Export functions
  const exportSlidesAsPptx = (slides) => {
    if (!Array.isArray(slides)) {
      console.error('Slides data is not an array:', slides);
      return;
    }
  
    const pptx = new PptxGenJS();
  
    slides.forEach((slideContent) => {
      const slide = pptx.addSlide();
  
      // Add slide title
      slide.addText(slideContent.slideTitle, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: 24,
        bold: true,
        color: '000000',
        align: 'center',
        valign: 'middle',
      });
  
      // Determine content type and add appropriately
      const { slideContent: content } = slideContent;
  
      // If content is a string, use it directly
      if (typeof content === 'string') {
        slide.addText(content, {
          x: '10%',
          y: '40%',
          w: '80%',
          h: '60%',
          fontSize: 16,
          color: '000000',
          align: 'left',
          valign: 'top',
        });
      }
      // If content contains paragraphs, add them line by line
      else if (content.paragraphs) {
        content.paragraphs.forEach((paragraph, index) => {
          slide.addText(paragraph, {
            x: '10%',
            y: 1.5+index * 20, // Adjust y-position for each paragraph
            w: '80%',
            fontSize: 16,
            color: '000000',
            align: 'left',
            valign: 'top',
          });
        });
      }
      // If content contains bullet points, add them as a list
      else if (content.bulletPoints) {
        const bulletText = content.bulletPoints.map((bullet) => `• ${bullet}`).join('\n');
        slide.addText(bulletText, {
          x: '10%',
          y: '20%',
          w: '80%',
          h: '60%',
          fontSize: 16,
          color: '000000',
          align: 'left',
          valign: 'top',
        });
      }
  
      // Set slide background to white for better readability
      slide.background = { fill: 'FFFFFF' };
    });
  
    // Write the PowerPoint file with a user-friendly name
    pptx.writeFile({ fileName: 'Generated_Slides.pptx' });
  };
  

  const exportAsPdf = () => {
    alert('PDF export is under construction!');
  };

  const exportToGoogleSlides = () => {
    alert('Export to Google Slides is under construction!');
  };

  const exportToGoogleDocs = () => {
    alert('Export to Google Docs is under construction!');
  };

  const exportToWord = () => {
    alert('Export to Microsoft Word is under construction!');
  };

  // Dropdown toggle
  const handleExportClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  return (
    <div className="general-slides-container {">
      <header className="prez-header">
        <h1 className="prez-title"> Presentation Generator  </h1> 
        <img src={slideGeneratorIMG} alt="presentation generator" className="prez-gen-img" />    
      </header>

      <div className="input-section">
        {/* Topic Input */}
        <div className="input-group">
          <h3><FaBook /> Topic (Required):</h3>
          <div className="input-container">
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter the topic of your slide"
            />
            <label htmlFor="topicFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="topicFileInput"
              onChange={(e) => handleFileChange(e, setTopicFile, setTopic)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Grade Level Input */}
        <div className="input-group">
          <h3><FaGraduationCap /> Grade Level (Optional):</h3>
          <input
            type="text"
            value={gradeLevel}
            onChange={handleGradeLevelChange}
            placeholder="Enter the grade level (e.g., 9th Grade, Middle School)"
          />
        </div>

        {/* Additional Criteria Input */}
        <div className="input-group">
          <h3><FaListAlt /> Additional Criteria (Optional):</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setAdditionalCriteriaFile, setAdditionalCriteriaPreview)}
          >
            <textarea
              value={additionalCriteria}
              onChange={handleAdditionalCriteriaChange}
              placeholder="Add any specific requirements (e.g. Number of slides, only bullet points, etc.)"
              rows={4}
            />
            <label htmlFor="additionalCriteriaFileInput" className="file-upload-icon">
              <FaPaperclip />
            </label>
            <input
              type="file"
              id="additionalCriteriaFileInput"
              onChange={(e) => handleFileChange(e, setAdditionalCriteriaFile, setAdditionalCriteriaPreview)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
          {additionalCriteriaPreview && (
            <div className="file-preview">
              <h4>Additional Criteria Preview:</h4>
              <p>{additionalCriteriaPreview.slice(0, 500)}{additionalCriteriaPreview.length > 500 && '...'}</p>
            </div>
          )}
        </div>

        {/* Standards Input */}
        <div className="input-group">
          <h3><FaExclamationCircle /> Standards (Optional):</h3>
          <div className="input-container">
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
              onChange={(e) => handleFileChange(e, setStandardsFile, setStandards)}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Generate Slides Button */}
        <button onClick={handleGenerateSlides} disabled={isLoading}>
          {isLoading ? 'Generating Slides...' : 'Generate Slides'}
        </button>
      </div>


      {/* Display Generated Slides */}
      {slides.length > 0 && <GeneralSlides slides={slides} />}

      {/* Display Export Button */}
      {slides.length > 0 && (
        <div className="export-dropdown-container">
          <button onClick={handleExportClick} className="export-button">
            <FaDownload /> Export Slides
          </button>
          {isDropdownOpen && (
            <div className="export-dropdown">

<button onClick={() => exportSlidesAsPptx(slides)}>
  <FaFilePowerpoint /> Export to Microsoft PowerPoint
</button>

              
              <button onClick={exportToGoogleSlides}>
                <FaGoogleDrive /> Export to Google Slides (Coming Soon!)
              </button>
            
              <button onClick={exportToGoogleDocs}>
                <FaGoogleDrive /> Export to Google Docs (Coming Soon!)
              </button>
              <button onClick={exportToWord}>
                <FaFileWord /> Export to Microsoft Word (Coming Soon!)
              </button>
              
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SlideGenerator;
