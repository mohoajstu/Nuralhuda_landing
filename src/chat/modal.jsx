import React from 'react';

const Modal = ({ isOpen, onClose, message, onConfirm, confirmLabel, closeLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
    <div className="modal-content">
      {message}
      <div className="modal-buttons-container">
        <button onClick={onConfirm} className="modal-button login">{confirmLabel}</button>
        <button onClick={onClose} className="modal-button cancel">{closeLabel}</button>
      </div>
    </div>
  </div>
  
  );
};

export default Modal;
