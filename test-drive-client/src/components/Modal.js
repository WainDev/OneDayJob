import React from 'react';

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="btn btn-outline-secondary position-absolute top-0 end-0 m-2"
          aria-label="Закрыть"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;