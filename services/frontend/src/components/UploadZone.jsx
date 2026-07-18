import React, { useState } from 'react';
import './UploadZone.css';

export function UploadZone({ onProcessUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [errors, setErrors] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await upload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await upload(e.target.files[0]);
    }
  };

  const upload = async (file) => {
    setUploadFile(file);
    setUploadStatus('uploading');
    setErrors([]);

    try {
      const data = await onProcessUpload(file);
      if (data.status === 'ACCEPTED') {
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
        setErrors(data.errors || ['Ingestion Firewall validation rejected.']);
      }
    } catch (err) {
      setUploadStatus('error');
      setErrors([err.message || 'Network communication failure.']);
    }
  };

  // Naming & layout checks preview
  const checks = uploadFile ? [
    { label: 'Lowercase filename check', pass: uploadFile.name === uploadFile.name.toLowerCase() },
    { label: 'No spaces check', pass: !uploadFile.name.includes(' ') },
    { label: 'Valid characters check', pass: /^[a-z0-9\-._]+$/.test(uploadFile.name) },
    { label: 'Length < 64 characters check', pass: uploadFile.name.length <= 64 },
    { label: 'File not empty check', pass: uploadFile.size > 0 },
  ] : [];

  return (
    <div className="upload-wrapper">
      <div className={`upload-card ${uploadStatus === 'error' ? 'rejected' : ''}`}>
        <div className="upload-header">
          <i className="fa-solid fa-cloud-arrow-up upload-card-icon" />
          <h3>Ingestion Firewall Portal</h3>
          <p className="upload-desc">
            Upload clinical safety logs for automated compliance validation checks.
          </p>
        </div>

        <div 
          className={`file-dropzone ${dragActive ? 'drag-active' : ''} ${uploadStatus === 'uploading' ? 'upload-scanning' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <div className="dropzone-inner">
            <i className="fa-regular fa-file-pdf file-preview-icon" />
            <p className="file-name-text">
              {uploadFile ? uploadFile.name : "Drag & drop safety log PDF, or click to browse"}
            </p>
          </div>
          <input 
            type="file" 
            id="file-upload-input" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>

        {uploadFile && (
          <div className="firewall-checklist">
            <div className="checklist-title">Firewall Check Results</div>
            {checks.map((check, i) => (
              <div 
                key={i}
                className="firewall-check"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <i className={`fa-solid ${check.pass ? 'fa-circle-check' : 'fa-circle-xmark'}`}
                   style={{ color: check.pass ? 'var(--success)' : 'var(--error)' }} />
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="upload-status-box success">
            <strong><i className="fa-solid fa-circle-check" /> File Accepted:</strong> The document meets naming convention rules and has been routed to the staging vault.
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="firewall-rejection-backdrop">
            <div className="firewall-rejection-modal">
              <div className="firewall-rejection-icon-ring">
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <h2 className="firewall-rejection-title">Ingestion Firewall Blocked</h2>
              <p className="firewall-rejection-subtitle">
                The uploaded document was rejected at the gateway. File details do not satisfy formatting rules.
              </p>
              
              <div className="firewall-errors-list">
                {errors.map((err, i) => (
                  <div key={i} className="firewall-error-item">
                    <i className="fa-solid fa-circle-xmark error-dot" style={{ color: 'var(--error)', marginTop: '2px', fontSize: '14px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>{err}</span>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                className="firewall-rejection-close-btn"
                onClick={() => {
                  setUploadStatus(null);
                  setUploadFile(null);
                }}
              >
                Dismiss & Retry Ingestion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
