import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons-container">
          <button onClick={onConfirm} className="modal-button login">Setup Account</button>
          <button onClick={onClose} className="modal-button cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;