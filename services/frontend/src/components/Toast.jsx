import React from 'react';
import './Toast.css';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'toast-exit') {
              removeToast(toast.id);
            }
          }}
        >
          <i className={`fa-solid ${getToastIcon(toast.type)}`} />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function getToastIcon(type) {
  switch (type) {
    case 'success': return 'fa-circle-check';
    case 'error': return 'fa-circle-xmark';
    case 'warning': return 'fa-triangle-exclamation';
    default: return 'fa-circle-info';
  }
}
