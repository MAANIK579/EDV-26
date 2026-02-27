import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useApp();
    const icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info', warning: 'fa-exclamation' };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`} style={{ animation: `toastIn 0.4s var(--ease)` }}>
                    <div className="toast-icon"><i className={`fas ${icons[toast.type]}`}></i></div>
                    <span className="toast-text">{toast.message}</span>
                    <span className="toast-close" onClick={() => removeToast(toast.id)}><i className="fas fa-times"></i></span>
                    <div className="toast-progress" style={{ animation: `toastBar ${toast.duration}ms linear forwards` }}></div>
                </div>
            ))}
        </div>
    );
}
