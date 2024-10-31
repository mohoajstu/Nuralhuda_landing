import React, { useState } from 'react';
import { FaUser, FaGraduationCap, FaClipboardList, FaTasks, FaLightbulb, FaChartLine } from 'react-icons/fa';
import './ReportCardGen.css';
import { createThread, createMessage, createRun, titleToAssistantIDMap } from '../chat/openAIUtils';

const ReportCardGen = () => {
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
  const [responseBuffer, setResponseBuffer] = useState(''); // For accumulating response fragments
  const [threadId, setThreadId] = useState(null); // Store thread ID for reuse in revisions

  const shouldShowGradeField = () => {
    const grade = parseInt(gradeLevel, 10);
    if (reportType.includes('Progress Report') || reportType.includes('Final')) {
      return grade >= 7 && grade <= 8; // Show percentage for Grades 7-8
    }
    if (reportType.includes('Term 1') || reportType.includes('Final')) {
      return grade >= 1 && grade <= 6; // Show letter grade for Grades 1-6
    }
    return false;
  };

  const handleGenerateComment = async () => {
    setIsLoading(true);
    setResponseBuffer(''); // Clear previous response buffer

    const prompt = {
      studentName,
      gradeLevel,
      reportType,
      subject,
      gradePercentage,
      ...(reportType.includes('Kindergarten') ? {
        keyLearning,
        growthInLearning,
        nextSteps
      } : {
        strengths,
        improvements
      })
    };

    console.log("Generated prompt:", prompt);

    try {
      const assistantTitle = 'Report Card Comment Generator';
      console.log("Creating thread for assistant:", assistantTitle);
      const thread = await createThread(assistantTitle);
      setThreadId(thread.id); // Store thread ID for future revisions
      console.log("Thread created with ID:", thread.id);

      console.log("Sending message to thread...");
      await createMessage(thread.id, JSON.stringify(prompt), assistantTitle);

      console.log("Initiating agent run...");
      createRun(
        thread.id,
        titleToAssistantIDMap[assistantTitle],
        handleMessage,
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error("Error initiating comment generation:", error);
      alert("An error occurred while initiating the comment generation. Please try again.");
      setIsLoading(false);
    }
  };

  const handleMessage = (message) => {
    console.log("Received message fragment:", message.text);
  
    if (message.text === 'END_TOKEN') {
      console.log("END_TOKEN received. Final buffer content:", responseBuffer);
      const cleanedResponse = responseBuffer
        .replace(/```json/g, '') 
        .replace(/```/g, '')    
        .trim();
  
      try {
        console.log("Complete response after cleaning:", cleanedResponse);
        // Check if cleanedResponse has valid JSON structure
        if (!cleanedResponse || cleanedResponse[0] !== '{' || cleanedResponse[cleanedResponse.length - 1] !== '}') {
          throw new Error("Invalid JSON structure");
        }
        const jsonResponse = JSON.parse(cleanedResponse);
        setOutput(jsonResponse);
      } catch (error) {
        console.error("Error parsing response:", error);
        console.error("Response Buffer Content:", responseBuffer); // Log full buffer for debugging
        alert("An error occurred while parsing the comment data. Please try again.");
      } finally {
        setIsLoading(false); 
        setResponseBuffer(''); // Clear buffer after processing
      }
    } else {
      setResponseBuffer((prev) => prev + message.text); // Accumulate message fragments
      console.log("Accumulated responseBuffer so far:", responseBuffer);
    }
  };
  
  

  const handleError = (error) => {
    console.error("Error during agent run:", error);
    alert("An error occurred while generating the report. Please try again.");
    setIsLoading(false);
  };

  const handleRevisionRequest = async () => {
    if (!threadId) {
      alert("No initial report found. Please generate a comment before requesting a revision.");
      return;
    }

    setIsLoading(true);
    setResponseBuffer(''); // Clear previous response buffer for revision

    const revisionPrompt = {
      studentName,
      gradeLevel,
      reportType,
      subject,
      gradePercentage,
      revisionComment,
      ...(reportType.includes('Kindergarten') ? {
        keyLearning,
        growthInLearning,
        nextSteps
      } : {
        strengths,
        improvements
      })
    };

    console.log("Generated revision prompt:", revisionPrompt);

    try {
      const assistantTitle = 'Report Card Comment Generator';
      await createMessage(threadId, JSON.stringify(revisionPrompt), assistantTitle); // Reuse existing thread ID

      createRun(
        threadId,
        titleToAssistantIDMap[assistantTitle],
        handleMessage,
        handleError,
        assistantTitle
      );
    } catch (error) {
      console.error("Error initiating revision:", error);
      alert("An error occurred while requesting a revision. Please try again.");
      setIsLoading(false);
    }
  };

  const getPlaceholderText = (field) => {
    if (reportType.includes('Kindergarten')) {
      switch (field) {
        case 'keyLearning':
          return "Describe the most significant skills and knowledge the child demonstrated during this period.";
        case 'growthInLearning':
          return "Describe the child's positive learning developments and personal progress.";
        case 'nextSteps':
          return "Provide suggested ways to further support the child's development at school and home.";
        default:
          return "";
      }
    } else {
      switch (field) {
        case 'strengths':
          return "Describe the student’s strengths in this area (e.g., active participation, understanding of key concepts).";
        case 'improvements':
          return "Describe areas for improvement and next steps (e.g., focus on completing assignments on time).";
        default:
          return "";
      }
    }
  };

  return (
    <div className="report-card-gen-container">
      <header className="report-card-header">
        <h1>Report Card Comment Generator</h1>
      </header>

      <div className="input-section">
        {/* Input fields for student's details */}
        <div className="input-group">
          <label><FaUser /> Student's Name:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter the student's full name"
            className="large-input"
          />
        </div>

        <div className="input-group">
          <label><FaGraduationCap /> Grade Level:</label>
          <input
            type="text"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="Enter the student's grade level (e.g., Grade 2)"
            className="large-input"
          />
        </div>

        <div className="input-group">
          <label><FaClipboardList /> Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter the subject (e.g., Mathematics, Science)"
            className="large-input"
          />
        </div>

        {shouldShowGradeField() && (
          <div className="input-group">
            <label><FaChartLine /> {parseInt(gradeLevel, 10) >= 7 ? "Grade Percentage:" : "Letter Grade:"}</label>
            <input
              type="text"
              value={gradePercentage}
              onChange={(e) => setGradePercentage(e.target.value)}
              placeholder={parseInt(gradeLevel, 10) >= 7 ? "Enter grade percentage (e.g., 85%)" : "Enter letter grade (e.g., A)"}
              className="large-input"
            />
          </div>
        )}

        {/* Input fields for report type and content */}
        <div className="input-group">
          <label><FaClipboardList /> Type of Report:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="large-input">
            <option value="">Select report type</option>
            <option value="Progress Report">Progress Report</option>
            <option value="Term 1 Report Card">Term 1 Report Card</option>
            <option value="Final (Term 2) Report Card">Final (Term 2) Report Card</option>
            <option value="Kindergarten Initial Observation">Kindergarten Initial Observation</option>
            <option value="Kindergarten Communication of Learning Term 1">Kindergarten Communication of Learning Term 1</option>
            <option value="Kindergarten Communication of Learning Final (Term 2)">Kindergarten Communication of Learning Final (Term 2)</option>
          </select>
        </div>

        {/* Fields for Kindergarten report types */}
        {reportType.includes('Kindergarten') ? (
          <>
            <div className="input-group">
              <label><FaLightbulb /> Key Learning:</label>
              <textarea
                value={keyLearning}
                onChange={(e) => setKeyLearning(e.target.value)}
                placeholder={getPlaceholderText('keyLearning')}
                className="large-textarea"
              />
            </div>
            <div className="input-group">
              <label><FaChartLine /> Growth in Learning:</label>
              <textarea
                value={growthInLearning}
                onChange={(e) => setGrowthInLearning(e.target.value)}
                placeholder={getPlaceholderText('growthInLearning')}
                className="large-textarea"
              />
            </div>
            <div className="input-group">
              <label><FaTasks /> Next Steps in Learning:</label>
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
              <label><FaLightbulb /> Strengths:</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder={getPlaceholderText('strengths')}
                className="large-textarea"
              />
            </div>
            <div className="input-group">
              <label><FaTasks /> Areas for Improvement:</label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder={getPlaceholderText('improvements')}
                className="large-textarea"
              />
            </div>
          </>
        )}

        <button onClick={handleGenerateComment} className="generate-button" disabled={isLoading}>
          {isLoading ? 'Generating Comment...' : 'Generate Comment'}
        </button>
      </div>

      {/* Output and Revision Section */}
      {output && (
        <div className="output-section">
          <h2>Generated Report Card Comment:</h2>
          <div className="report-card-content">
            <p><strong>Student Name:</strong> {output.studentName}</p>
            <p><strong>Grade Level:</strong> {output.gradeLevel}</p>
            {shouldShowGradeField() && (
              <p><strong>{parseInt(gradeLevel, 10) >= 7 ? "Grade Percentage:" : "Letter Grade:"}</strong> {output.gradePercentage}</p>
            )}
            <p><strong>Subject:</strong> {output.subject}</p>
            <div>
              <strong>Subject Comments:</strong>
              {output.comments.subjectComments.map((comment, index) => (
                <p key={index}>{comment.comment}</p>
              ))}
            </div>
            <div>
              <strong>Achievement Level:</strong>
              <p>Knowledge & Understanding: {output.comments.achievementLevel.KnowledgeAndUnderstanding}</p>
              <p>Thinking: {output.comments.achievementLevel.Thinking}</p>
              <p>Communication: {output.comments.achievementLevel.Communication}</p>
              <p>Application: {output.comments.achievementLevel.Application}</p>
            </div>
            <div>
              <strong>Progress Indicators:</strong>
              <p>Letter Grade: {output.comments.progressIndicators.letterGrade}</p>
              <p>Next Steps: {output.comments.progressIndicators.nextSteps}</p>
            </div>
          </div>

          <div className="revision-section">
            <label>Request Revision:</label>
            <textarea
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Add comments for revision (e.g., specific changes needed)"
              className="large-textarea"
            />
            <button onClick={handleRevisionRequest} className="revision-button" disabled={isLoading}>
              {isLoading ? 'Submitting Revision...' : 'Request Revision'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardGen;
