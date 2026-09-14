import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  const { id, type = 'info', title, message, duration = 4000 } = toast;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} />;
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Sparkles size={18} />;
    }
  };

  return (
    <div className={`toast-item ${type}`}>
      <div className="toast-icon-wrapper">
        {getIcon()}
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close-btn" onClick={() => onClose(id)} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
