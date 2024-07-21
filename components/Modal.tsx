import React from 'react';

interface ModalProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  type?: 'default' | 'warning' | 'success' | 'error';
}

const modalTypeClasses = {
  default: 'bg-white text-black',
  warning: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

const Modal: React.FC<ModalProps> = ({ title, content, isOpen, onClose, type = 'default' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className={`p-8 rounded shadow-lg w-96 ${modalTypeClasses[type]}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost">
            ✕
          </button>
        </div>
        <div>{content}</div>
      </div>
    </div>
  );
};

export default Modal;
