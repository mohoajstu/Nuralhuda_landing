import React from 'react';

const MessageModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons-container">
          <button onClick={onClose} className="modal-button login">Close</button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
