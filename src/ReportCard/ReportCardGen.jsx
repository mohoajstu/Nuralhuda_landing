// ReportCardGen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  FaUser,
  FaGraduationCap,
  FaClipboardList,
  FaTasks,
  FaLightbulb,
  FaChartLine,
  FaInfoCircle,
} from 'react-icons/fa';
import './ReportCardGen.css';
import {
  createThread,
  createMessage,
  createRun,
  titleToAssistantIDMap,
} from '../chat/openAIUtils';
import { Tooltip } from '@mui/material'; // Updated import
import CommentDisplay from './CommentDisplay';
import ReportCardModal from './ReportCardModal';

// Import pdf-lib and fontkit
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { readFileContent } from '../utils/fileUtils'; // Adjust the path as needed
import OntarioAssessmentChart from './OntarioAssessmentChart';

// Import the PDF files
import kindergartenInitialObservation from './pdfTemplates/edu-kindergarten_report_initial_observations.pdf';
import kindergartenFinal from './pdfTemplates/edu-Kindergarten-Communication-of-Learning.pdf';
import grade1to6Progress from './pdfTemplates/edu-elementary-progress-report-card-1-6.pdf';
import grade1to6Final from './pdfTemplates/edu-elementary-provincial-report-card-1-6.pdf';
import grade7to8Progress from './pdfTemplates/edu-elementary-progress-report-card-7-8.pdf';
import grade7to8Final from './pdfTemplates/edu-elementary-provincial-report-card-7-8.pdf';

// Import the GlossaryTooltip component
import GlossaryTooltip from '../Glossary/GlossaryTooltip'; // Adjust the path as needed

const ReportCardGen = () => {
  // State variables
  const [reportType, setReportType] = useState('');
  const [studentName, setStudentName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [gradePercentage, setGradePercentage] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [keyLearning, setKeyLearning] = useState('');
  const [growthInLearning, setGrowthInLearning] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [reportTypeOutput, setReportTypeOutput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedSkillValue, setSelectedSkillValue] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const responseBufferRef = useRef('');

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  // Handle removing an uploaded file
  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Render uploaded files
  const renderUploadedFiles = () => (
    <div
      className="uploaded-files-container"
      style={{ display: uploadedFiles.length > 0 ? 'block' : 'none' }}
    >
      {uploadedFiles.map((file, index) => (
        <div key={index} className="uploaded-file-item">
          <span>{file.name}</span>
          <button className="remove-file-button-report" onClick={() => handleRemoveFile(index)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  // Function to open the modal with the selected skill
  const openModal = (skill, value) => {
    setSelectedSkill(skill);
    setSelectedSkillValue(value);
    setIsModalOpen(true);
  };

  // Function to close the modal and reset selected skill
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
    setSelectedSkillValue('');
  };

  // Function to handle saving changes made in the modal
  const saveSkillValue = () => {
    handleFieldChange(
      `comments.learningSkillsAndHabits.${selectedSkill}`,
      selectedSkillValue
    );
    closeModal();
  };

  const handleInfoIconClick = () => {
    const pdfTemplateUrl = getPdfTemplateUrl(reportType, gradeLevel);
    if (pdfTemplateUrl) {
      window.open(pdfTemplateUrl, '_blank');
    } else {
      alert(
        'Please select a valid report type and enter the grade level to view the template.'
      );
    }
  };

  const shouldShowGradeField = () => {
    const grade = parseInt(gradeLevel, 10);
    if (reportType.includes('Progress Report') || reportType.includes('Term')) {
      return grade >= 1 && grade <= 8;
    }
    return false;
  };

  const handleGenerateComment = async () => {
    setIsLoading(true);
    responseBufferRef.current = '';
    setOutput(null);
    setEditableData(null);

    const prompt = {
      studentName,
      gradeLevel,
      reportType,
      subject,
      gradePercentage,
      ...(reportType.includes('Kindergarten')
        ? {
            keyLearning,
            growthInLearning,
            nextSteps,
          }
        : {
            strengths,
            improvements,
          }),
    };

    console.log('Generated prompt:', prompt);

    try {
      const assistantTitle = 'Report Card Comment Generator';
      const thread = await createThread(assistantTitle);
      console.log('Created thread:', thread);
      setThreadId(thread.id);

      await createMessage(thread.id, JSON.stringify(prompt), assistantTitle);
      console.log('Message sent to assistant:', JSON.stringify(prompt));

      createRun(
        thread.id,
        titleToAssistantIDMap[assistantTitle],
        handleMessage,
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error('Error initiating comment generation:', error);
      alert(
        'An error occurred while initiating the comment generation. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleMessage = (message) => {
    console.log('Received message from assistant:', message);

    const messageText = message.text;

    if (messageText === 'END_TOKEN') {
      if (responseBufferRef.current.trim()) {
        console.log(
          'Final accumulated responseBuffer:',
          responseBufferRef.current
        );

        // Proceed with parsing
        let cleanedResponse = responseBufferRef.current.trim();

        // Remove code block markers and unnecessary whitespace
        cleanedResponse = cleanedResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        // Attempt to extract JSON object
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        } else {
          console.error('Could not find JSON object in the response.');
          alert(
            'An error occurred while parsing the comment data. Please try again.'
          );
          setIsLoading(false);
          responseBufferRef.current = '';
          return;
        }

        try {
          const jsonResponse = JSON.parse(cleanedResponse);
          console.log('Parsed JSON response:', jsonResponse);
          setOutput(jsonResponse);
          setEditableData(jsonResponse);
          setReportTypeOutput(jsonResponse.reportType);
        } catch (error) {
          console.error('Error parsing response:', error);
          alert(
            'An error occurred while parsing the comment data. Please try again.'
          );
        } finally {
          setIsLoading(false);
          responseBufferRef.current = '';
        }
      } else {
        console.error('END_TOKEN received but no content was accumulated.');
        alert('No content was received from the assistant.');
        setIsLoading(false);
      }
    } else if (messageText) {
      console.log('Accumulating message text:', messageText);
      responseBufferRef.current += messageText;
    } else {
      console.warn('Received message without usable text:', message);
    }
  };

  const handleSave = (updatedComment) => {
    console.log('Saving updated comment:', updatedComment);
    setOutput(updatedComment);
    setIsEditing(false);
  };

  const handlePreview = (updatedComment) => {
    console.log('Previewing comment:', updatedComment);
    // Add preview logic if needed
  };

  const handleError = (error) => {
    console.error('Error during agent run:', error);
    alert('An error occurred while generating the report. Please try again.');
    setIsLoading(false);
  };

  const handleRevisionRequest = async () => {
    if (!threadId) {
      alert(
        'No initial report found. Please generate a comment before requesting a revision.'
      );
      return;
    }

    setIsLoading(true);
    responseBufferRef.current = '';

    const revisionPrompt = {
      studentName,
      gradeLevel,
      reportType,
      subject,
      gradePercentage,
      revisionComment,
      ...(reportType.includes('Kindergarten')
        ? {
            keyLearning,
            growthInLearning,
            nextSteps,
          }
        : {
            strengths,
            improvements,
          }),
    };

    console.log('Revision prompt:', revisionPrompt);

    try {
      const assistantTitle = 'Report Card Comment Generator';
      await createMessage(threadId, JSON.stringify(revisionPrompt), assistantTitle);
      console.log('Revision message sent.');

      createRun(
        threadId,
        titleToAssistantIDMap[assistantTitle],
        handleMessage,
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error('Error initiating revision:', error);
      alert('An error occurred while requesting a revision. Please try again.');
      setIsLoading(false);
    }
  };

  const getPlaceholderText = (field) => {
    if (reportType.includes('Kindergarten')) {
      switch (field) {
        case 'keyLearning':
          return 'Describe the most significant skills and knowledge the child demonstrated during this period.';
        case 'growthInLearning':
          return "Describe the child's positive learning developments and personal progress.";
        case 'nextSteps':
          return "Provide suggested ways to further support the child's development at school and home.";
        default:
          return '';
      }
    } else {
      switch (field) {
        case 'strengths':
          return 'Describe the student’s strengths in this area (e.g., active participation, understanding of key concepts).';
        case 'improvements':
          return 'Describe areas for improvement and next steps (e.g., focus on completing assignments on time).';
        default:
          return '';
      }
    }
  };

  const handleFieldChange = (fieldPath, value) => {
    console.log(`Updating field ${fieldPath} with value:`, value);
    setEditableData((prevData) => {
      const updatedData = { ...prevData };
      const keys = fieldPath.split('.');
      let current = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updatedData;
    });
  };

  const getPdfTemplateUrl = (reportType, gradeLevel) => {
    const grade = parseInt(gradeLevel, 10);
    if (reportType === 'Kindergarten Initial Observation') {
      return kindergartenInitialObservation;
    } else if (
      reportType === 'Kindergarten Communication of Learning Term 1' ||
      reportType === 'Kindergarten Communication of Learning Final (Term 2)'
    ) {
      return kindergartenFinal;
    } else if (reportType === 'Progress Report') {
      if (grade >= 1 && grade <= 6) {
        return grade1to6Progress;
      } else if (grade >= 7 && grade <= 8) {
        return grade7to8Progress;
      }
    } else if (
      reportType === 'Term 1 Report Card' ||
      reportType === 'Final (Term 2) Report Card'
    ) {
      if (grade >= 1 && grade <= 6) {
        return grade1to6Final;
      } else if (grade >= 7 && grade <= 8) {
        return grade7to8Final;
      }
    }
    return null;
  };

  const fillPdfForm = async (pdfTemplateBytes, formData) => {
    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();

    // Fill in the form fields
    form.getTextField('studentName').setText(formData.studentName);
    form.getTextField('gradeLevel').setText(formData.gradeLevel);

    if (formData.gradePercentage) {
      form.getTextField('gradePercentage').setText(formData.gradePercentage);
    }

    if (formData.subject) {
      form.getTextField('subject').setText(formData.subject);
    }

    // Fill in comments
    if (formData.comments) {
      // Subject Comments
      if (formData.comments.subjectComments) {
        formData.comments.subjectComments.forEach((commentObj, index) => {
          form
            .getTextField(`subject${index + 1}`)
            .setText(commentObj.subject || '');
          form
            .getTextField(`comment${index + 1}`)
            .setText(commentObj.comment || '');
        });
      }
      // Achievement Level
      if (formData.comments.achievementLevel) {
        form
          .getTextField('KnowledgeAndUnderstanding')
          .setText(
            formData.comments.achievementLevel.KnowledgeAndUnderstanding || ''
          );
        form
          .getTextField('Thinking')
          .setText(formData.comments.achievementLevel.Thinking || '');
        form
          .getTextField('Communication')
          .setText(formData.comments.achievementLevel.Communication || '');
        form
          .getTextField('Application')
          .setText(formData.comments.achievementLevel.Application || '');
      }
      // Learning Skills and Habits
      if (formData.comments.learningSkillsAndHabits) {
        form
          .getTextField('Responsibility')
          .setText(formData.comments.learningSkillsAndHabits.Responsibility || '');
        form
          .getTextField('Organization')
          .setText(formData.comments.learningSkillsAndHabits.Organization || '');
        form
          .getTextField('IndependentWork')
          .setText(
            formData.comments.learningSkillsAndHabits.IndependentWork || ''
          );
        form
          .getTextField('Collaboration')
          .setText(formData.comments.learningSkillsAndHabits.Collaboration || '');
        form
          .getTextField('Initiative')
          .setText(formData.comments.learningSkillsAndHabits.Initiative || '');
        form
          .getTextField('SelfRegulation')
          .setText(
            formData.comments.learningSkillsAndHabits.SelfRegulation || ''
          );
      }
      // Progress Indicators
      if (formData.comments.progressIndicators) {
        form
          .getTextField('letterGrade')
          .setText(formData.comments.progressIndicators.letterGrade || '');
        form
          .getTextField('nextSteps')
          .setText(formData.comments.progressIndicators.nextSteps || '');
      }
      // Kindergarten Specific
      if (formData.comments.kindergartenSpecific) {
        form
          .getTextField('KeyLearning')
          .setText(formData.comments.kindergartenSpecific.KeyLearning || '');
        form
          .getTextField('GrowthInLearning')
          .setText(
            formData.comments.kindergartenSpecific.GrowthInLearning || ''
          );
        form
          .getTextField('NextStepsInLearning')
          .setText(
            formData.comments.kindergartenSpecific.NextStepsInLearning || ''
          );
      }
    }

    // Optionally flatten the form to prevent editing
    // form.flatten();

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };

  const handleDownloadPdf = async () => {
    try {
      // Get the appropriate PDF template based on reportType
      const pdfTemplateUrl = getPdfTemplateUrl(
        editableData.reportType,
        editableData.gradeLevel
      );
      if (!pdfTemplateUrl) {
        alert(
          'No PDF template found for the selected report type and grade level.'
        );
        return;
      }
      // Fetch the PDF template bytes
      const pdfTemplateBytes = await fetch(pdfTemplateUrl).then((res) =>
        res.arrayBuffer()
      );

      // Fill the PDF with the editable data
      const pdfBytes = await fillPdfForm(pdfTemplateBytes, editableData);

      // Create a Blob and download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${editableData.studentName}_ReportCard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  return (
    <div className="report-card-gen-container">
      <header className="report-card-header">
        <h1>Report Card Comment Generator</h1>
      </header>

      <div className="input-section">
        {/* Type of Report Dropdown with GlossaryTooltip */}
        <div className="input-group">
          
            <label>
            <GlossaryTooltip name="Type of Report">
              <FaClipboardList /> Type of Report:
              </GlossaryTooltip>
              <GlossaryTooltip name="Report Document Information">
              <FaInfoCircle
                className="info-icon"
                onClick={handleInfoIconClick}
                style={{ marginLeft: '8px', cursor: 'pointer' }}
              />
              </GlossaryTooltip>
            </label>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="large-input"
          >
            <option value="">Select report type</option>
            <option value="Progress Report">Progress Report</option>
            <option value="Term 1 Report Card">Term 1 Report Card</option>
            <option value="Final (Term 2) Report Card">
              Final (Term 2) Report Card
            </option>
            <option value="Kindergarten Initial Observation">
              Kindergarten Initial Observation
            </option>
            <option value="Kindergarten Communication of Learning Term 1">
              Kindergarten Communication of Learning Term 1
            </option>
            <option value="Kindergarten Communication of Learning Final (Term 2)">
              Kindergarten Communication of Learning Final (Term 2)
            </option>
          </select>
        </div>

        {/* Show other fields only if reportType is selected */}
        {reportType && (
          <>
            {/* Student's Name with GlossaryTooltip */}
            <div className="input-group">
              <GlossaryTooltip name="Student's Name">
                <label>
                  <FaUser /> Student's Name:
                </label>
              </GlossaryTooltip>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter the student's full name"
                className="large-input"
              />
            </div>

            {/* Grade Level - Hidden for Kindergarten Reports */}
            {!reportType.includes('Kindergarten') && (
              <div className="input-group">
                <GlossaryTooltip name="Grade Level">
                  <label>
                    <FaGraduationCap /> Grade Level:
                  </label>
                </GlossaryTooltip>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="Enter the student's grade level (e.g., Grade 2)"
                  className="large-input"
                />
              </div>
            )}

            {/* Subject with File Upload */}
          <div className="input-group">
            <label>
              <FaClipboardList /> Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter the subject (e.g., Mathematics, Science)"
              className="large-input"
            />
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="file-input"
            />
            {renderUploadedFiles()}
          </div>

            {/* Grade Percentage or Letter Grade */}
            {shouldShowGradeField() && (
              <div className="input-group">
              <GlossaryTooltip name="Grade Percentage or Letter Grade">
                <label>
                  <FaChartLine /> {'Grade Percentage or Letter Grade'}
                </label>
              </GlossaryTooltip>
              <input
                type="text"
                value={gradePercentage}
                onChange={(e) => setGradePercentage(e.target.value)}
                placeholder={
                  'Enter grade percentage (e.g., 85%) or letter grade (e.g., A)'
                }
                className="large-input"
              />
            </div>
            )}

            {/* Conditional fields based on report type */}
            {reportType.includes('Kindergarten') ? (
              <>
                <div className="input-group">
                  <GlossaryTooltip name="Key Learning">
                    <label>
                      <FaLightbulb /> Key Learning:
                    </label>
                  </GlossaryTooltip>
                  <textarea
                    value={keyLearning}
                    onChange={(e) => setKeyLearning(e.target.value)}
                    placeholder={getPlaceholderText('keyLearning')}
                    className="large-textarea"
                  />
                </div>
                <div className="input-group">
                  <GlossaryTooltip name="Growth in Learning">
                    <label>
                      <FaChartLine /> Growth in Learning:
                    </label>
                  </GlossaryTooltip>
                  <textarea
                    value={growthInLearning}
                    onChange={(e) => setGrowthInLearning(e.target.value)}
                    placeholder={getPlaceholderText('growthInLearning')}
                    className="large-textarea"
                  />
                </div>
                <div className="input-group">
                  <GlossaryTooltip name="Next Steps in Learning">
                    <label>
                      <FaTasks /> Next Steps in Learning:
                    </label>
                  </GlossaryTooltip>
                  <textarea
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    placeholder={getPlaceholderText('nextSteps')}
                    className="large-textarea"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <GlossaryTooltip name="Strengths">
                    <label>
                      <FaLightbulb /> Strengths:
                    </label>
                  </GlossaryTooltip>
                  <textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder={getPlaceholderText('strengths')}
                    className="large-textarea"
                  />
                </div>
                <div className="input-group">
                  <GlossaryTooltip name="Areas for Improvement">
                    <label>
                      <FaTasks /> Areas for Improvement:
                    </label>
                  </GlossaryTooltip>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder={getPlaceholderText('improvements')}
                    className="large-textarea"
                  />
                </div>
              </>
            )}

            <div className="achievement-levels-section">
                <OntarioAssessmentChart />
            </div>

            <button
              onClick={handleGenerateComment}
              className="generate-button"
              disabled={isLoading}
            >
              {isLoading ? 'Generating Comment...' : 'Generate Comment'}
            </button>
          </>
        )}
      </div>

      {/* Editable Form */}
      {editableData && (
        <div className="edit-section">
          <h2>Edit Report Card Data</h2>

          {/* Log the editableData for debugging */}
          {console.log('Rendering editableData:', editableData)}

          {/* Student Name */}
          <div className="input-group">
            <label>Student Name:</label>
            <input
              type="text"
              value={editableData.studentName || ''}
              onChange={(e) => handleFieldChange('studentName', e.target.value)}
            />
          </div>

          {/* Grade Level - Hidden for Kindergarten Reports */}
          {!editableData.reportType.includes('Kindergarten') && (
            <div className="input-group">
              <label>Grade Level:</label>
              <input
                type="text"
                value={editableData.gradeLevel || ''}
                onChange={(e) => handleFieldChange('gradeLevel', e.target.value)}
              />
            </div>
          )}

          {/* Conditional Rendering Based on Report Type */}
          {editableData.reportType.includes('Kindergarten') ? (
            // Render Kindergarten Specific Comments
            <>
              <div className="section-header">Kindergarten Report</div>
              {editableData.comments?.kindergartenSpecific ? (
                <div>
                  <div className="input-group">
                    <label>Key Learning:</label>
                    <textarea
                      value={
                        editableData.comments.kindergartenSpecific.KeyLearning || ''
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          'comments.kindergartenSpecific.KeyLearning',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Growth in Learning:</label>
                    <textarea
                      value={
                        editableData.comments.kindergartenSpecific.GrowthInLearning ||
                        ''
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          'comments.kindergartenSpecific.GrowthInLearning',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Next Steps in Learning:</label>
                    <textarea
                      value={
                        editableData.comments.kindergartenSpecific.NextStepsInLearning ||
                        ''
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          'comments.kindergartenSpecific.NextStepsInLearning',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>No Kindergarten specific comments available.</p>
              )}
            </>
          ) : (
            // Render Sections for Other Report Types
            <>
              {/* Learning Skills and Habits */}
              {editableData.comments?.learningSkillsAndHabits &&
                Object.keys(editableData.comments.learningSkillsAndHabits).length >
                  0 && (
                <>
                  <div className="section-header">Learning Skills and Habits</div>
                  <div className="learning-skills-grid">
                    {Object.entries(
                      editableData.comments.learningSkillsAndHabits
                    ).map(([skill, value]) => (
                      <div
                        className="input-group"
                        key={skill}
                        onClick={() => openModal(skill, value)}
                      >
                        <label>{skill}:</label>
                        <input type="text" value={value} readOnly />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ReportCardModal for editing skill */}
              {isModalOpen && (
                <ReportCardModal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={selectedSkill}
                >
                  <textarea
                    value={selectedSkillValue}
                    onChange={(e) => setSelectedSkillValue(e.target.value)}
                    rows="6"
                    className="large-textarea"
                    placeholder={`Edit the content for ${selectedSkill}`}
                  />
                  <button onClick={saveSkillValue} className="save-button">
                    Save
                  </button>
                </ReportCardModal>
              )}

              {/* Subject Comments */}
              {editableData.comments?.subjectComments &&
                editableData.comments.subjectComments.length > 0 && (
                  <>
                    <div className="section-header">Subject Comments</div>
                    {editableData.comments.subjectComments.map(
                      (commentObj, index) => (
                        <div key={index} className="input-group">
                          <label>Subject:</label>
                          <input
                            type="text"
                            value={commentObj.subject || ''}
                            onChange={(e) => {
                              const updatedComments = [
                                ...editableData.comments.subjectComments,
                              ];
                              updatedComments[index].subject = e.target.value;
                              handleFieldChange(
                                'comments.subjectComments',
                                updatedComments
                              );
                            }}
                          />
                          <label>Comment:</label>
                          <textarea
                            className="expanded"
                            value={commentObj.comment || ''}
                            onChange={(e) => {
                              const updatedComments = [
                                ...editableData.comments.subjectComments,
                              ];
                              updatedComments[index].comment = e.target.value;
                              handleFieldChange(
                                'comments.subjectComments',
                                updatedComments
                              );
                            }}
                          />
                        </div>
                      )
                    )}
                  </>
                )}

              {/* Progress Indicators */}
              {editableData.comments?.progressIndicators ? (
                <>
                  <div className="section-header">Progress Indicators</div>
                  <div className="input-group">
                    <label>Letter Grade:</label>
                    <input
                      type="text"
                      value={
                        editableData.comments.progressIndicators?.letterGrade || ''
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          'comments.progressIndicators.letterGrade',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Next Steps:</label>
                    <textarea
                      className="expanded"
                      value={
                        editableData.comments.progressIndicators?.nextSteps || ''
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          'comments.progressIndicators.nextSteps',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <p>No progress indicators available.</p>
              )}
            </>
          )}

          {/* Download PDF Button */}
          <button onClick={handleDownloadPdf} className="download-button">
            Download PDF
          </button>
        </div>
      )}

      {/* Revision Section */}
      {output && (
        <div className="revision-section">
          <CommentDisplay
            comment={output}
            onEdit={() => setIsEditing(true)}
            onPreview={handlePreview}
            onSave={handleSave}
            isEditing={isEditing}
          />
          <h2>Request Revision:</h2>
          <textarea
            value={revisionComment}
            onChange={(e) => setRevisionComment(e.target.value)}
            placeholder="Add comments for revision (e.g., specific changes needed)"
            className="large-textarea"
          />
          <button
            onClick={handleRevisionRequest}
            className="revision-button"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting Revision...' : 'Request Revision'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportCardGen;
