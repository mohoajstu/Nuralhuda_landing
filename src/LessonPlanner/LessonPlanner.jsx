import React, { useState, useEffect, useRef } from 'react';
import {
  FaPaperclip,
  FaBook,
  FaGraduationCap,
  FaExclamationCircle,
  FaListAlt,
  FaDownload,
  FaGoogleDrive,
  FaFileWord,
  FaFilePdf
} from 'react-icons/fa';
import { readFileContent } from '../utils/fileUtils';
import './LessonPlanner.css';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';
import bidiFactory from 'bidi-js'
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { unified } from "unified";
import markdown from "remark-parse";
import docx from "remark-docx";
import { jsPDF } from 'jspdf';  
import showdown from 'showdown';
import ReactMarkdown from 'react-markdown';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TurndownService from 'turndown';

const LessonPlanner = () => {
  // State variables to hold user inputs
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [additionalCriteria, setAdditionalCriteria] = useState('');
  const [standards, setStandards] = useState('');
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topicFile, setTopicFile] = useState(null);
  const [standardsFile, setStandardsFile] = useState(null);
  const [additionalCriteriaFile, setAdditionalCriteriaFile] = useState(null);
  const [additionalCriteriaPreview, setAdditionalCriteriaPreview] = useState('');
  const [responseBuffer, setResponseBuffer] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlanReady, setIsPlanReady] = useState(false);
  const [htmlContent, setHTMLContent] = useState('');

  // Handlers for input changes
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleGradeLevelChange = (e) => setGradeLevel(e.target.value);
  const handleAdditionalCriteriaChange = (e) => setAdditionalCriteria(e.target.value);
  const handleStandardsChange = (e) => setStandards(e.target.value);
  const bidi = bidiFactory();

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

  const handleContentChange = (value) => {
    setHTMLContent(value); // Stores the HTML content
  };

  // Function to handle slide generation
  const handleAPI = async () => {
    if (!topic.trim()) {
      alert('Please provide a Topic!');
      return;
    }

    if (!additionalCriteria.trim()) {
        alert('Please provide a description!');
        return;
    }

    setIsLoading(true);

    try {
      const assistantTitle = 'Lesson Planner';
      const thread = await createThread(assistantTitle);

      // Create the prompt for the assistant
      const prompt = `
        Topic: ${topic}
        Grade Level: ${gradeLevel || 'N/A'}
        Standards: ${standards || 'N/A'}
        Additional Criteria: ${additionalCriteria || 'N/A'}
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
      console.error('Error initiating lesson plan generation:', error);
      alert('An error occurred while generating lesson plan. Please try again.');
      setIsLoading(false);
    }
  };

  const handleMessage = (message) => {
    setResponseBuffer((prevAccumulated) => {
        if (message.text === 'END_TOKEN') {
          const finalPlan = prevAccumulated;
          const converter = new showdown.Converter({
            tables: true,
            tasklists: true,
            strikethrough: true,
            ghCodeBlocks: true,
          });
          const html = converter.makeHtml(finalPlan);
          setPlan(prevAccumulated);
          setHTMLContent(html);
          setIsPlanReady(true);
          setIsLoading(false);
          return ''; 
        } else {
            return prevAccumulated + message.text;
        }
      });
  };
  
  useEffect(() => {
    if (plan) {
      const converter = new showdown.Converter({
        tables: true,
        tasklists: true,
        strikethrough: true,
        ghCodeBlocks: true,
      });
      const html = converter.makeHtml(plan);
      setHTMLContent(html);
    }
  }, [plan]);

    const createWordDocument = async (markdownContent) => {
        try {
          // Create a processor that converts markdown to docx
          const processor = unified()
            .use(markdown)
            .use(docx, { 
              output: "blob"
            });
      
          // Process the markdown content
          const doc = await processor.process(markdownContent);
          const blob = await doc.result;
          
          // Save the file using file-saver
          saveAs(blob, "document.docx");
        } catch (error) {
          console.error('Error converting to Word:', error);
        }
    };
  
  const handleError = (error) => {
    console.error('Error during assistant run:', error);
    alert('An error occurred while generating your lesson plan. Please try again.');
    setIsLoading(false);
  };

  const exportAsPdf = async () => {
    
    try {
      const converter = new showdown.Converter({
        tables: true,
        tasklists: true,
        strikethrough: true,
        ghCodeBlocks: true
      });
      
      const html = converter.makeHtml(htmlContent);
      
      const doc = new jsPDF();
      
      doc.html(html, {
        callback: function(doc) {
          doc.save('document.pdf');
        },
        x: 10,
        y: 10,
        width: 190, 
        windowWidth: 675 
      });
      
    } catch (error) {
      console.error('Error converting to PDF:', error);
    }
  };

  const exportToWord = () => {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced', 
    });
    const markdown = turndownService.turndown(htmlContent);
    createWordDocument(markdown);
  };

  const exportToGoogleDocs = () => {
    alert('Export to Google Docs is under construction!');
  };

  // Dropdown toggle
  const handleExportClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="general-slides-container {">
      <header className="prez-header">
        <h1 className="prez-title"> Lesson Plan Generator  </h1> 
        {/* <img src={slideGeneratorIMG} alt="presentation generator" className="prez-gen-img" />     */}
      </header>

      <div className="input-section">
        {/* Topic Input */}
        <div className="input-group">
          <h3><FaBook /> Lesson Topic:</h3>
          <div className="input-container">
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter the lesson topic"
            />
          </div>
        </div>

        {/* Additional Criteria Input */}
        <div className="input-group">
          <h3><FaListAlt /> Brief Lesson Description:</h3>
          <div
            className="input-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setAdditionalCriteriaFile, setAdditionalCriteriaPreview)}
          >
            <textarea
              value={additionalCriteria}
              onChange={handleAdditionalCriteriaChange}
              placeholder="Add any specific requirements (e.g. level of detail, specific focus, etc.)"
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
          </div>
        </div>

        <button onClick={handleAPI} disabled={isLoading}>
          {isLoading ? 'Generating Lesson Plan...' : 'Generate Lesson Plan'}
        </button>
      </div>
      {isPlanReady && (
        <div className='quill-editor'>
          <ReactQuill value={htmlContent} onChange={handleContentChange} />
        </div>
      )}

      {isPlanReady && (
        <div className="export-dropdown-container">
          <button onClick={handleExportClick} className="export-button">
            <FaDownload /> Export Lesson Plan
          </button>
          {isDropdownOpen && (
            <div className="export-dropdown">
                <button onClick={exportToWord}>
                    <FaFileWord /> Export to Microsoft Word
                </button>

                <button onClick={exportAsPdf}>
                    <FaFilePdf /> Export to PDF
                </button>

                <button onClick={exportToGoogleDocs}>
                    <FaGoogleDrive /> Export to Google Docs (Coming Soon!)
                </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default LessonPlanner;
