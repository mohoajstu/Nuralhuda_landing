import React from 'react';

const CommentDisplay = ({ comment, onEdit, onPreview, onSave, isEditing }) => {
  // Helper function to render comment sections
  const renderCommentSection = (section, title) => {
    if (!section) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {Object.entries(section).map(([key, value]) => (
          <div key={key} className="mb-2">
            <strong className="text-gray-700">{key}: </strong>
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSubjectComments = (comments) => {
    if (!comments?.subjectComments) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Subject Comments</h3>
        {comments.subjectComments.map((subject, index) => (
          <div key={index} className="mb-2">
            <strong className="text-gray-700">{subject.subject}: </strong>
            <span className="text-gray-900">{subject.comment}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Report Details</h2>
        <p><strong>Student: </strong>{comment.studentName}</p>
        <p><strong>Grade Level: </strong>{comment.gradeLevel}</p>
        <p><strong>Report Type: </strong>{comment.reportType}</p>
        {comment.gradePercentage && (
          <p><strong>Grade: </strong>{comment.gradePercentage}</p>
        )}
      </div>

      {/* Render different sections based on comment type */}
      {renderSubjectComments(comment.comments)}
      {renderCommentSection(comment.comments?.achievementLevel, "Achievement Level")}
      {renderCommentSection(comment.comments?.learningSkillsAndHabits, "Learning Skills and Habits")}
      {renderCommentSection(comment.comments?.progressIndicators, "Progress Indicators")}
      {renderCommentSection(comment.comments?.kindergartenSpecific, "Kindergarten Assessment")}

      <div className="mt-4 flex gap-2">
        <button 
          onClick={onEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
        <button 
          onClick={onPreview}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Preview
        </button>
        {isEditing && (
          <button 
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentDisplay;