import React from 'react';

const SimpleModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-body">
          {message}
        </div>
        <div className="modal-buttons-container">
          <button onClick={onClose} className="modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
