import React, { useState } from 'react';
import './RightSidebar.css';

// Action shortcuts metadata
const actionShortcuts = [
  {
    id: 'verify',
    icon: 'fa-magnifying-glass-chart',
    label: 'Run Compliance Audit',
    description: 'Scan all modules for regulatory contradictions.',
    instruction: null, // Calls verify endpoint directly
    color: 'var(--accent)',
    requiresSubmission: true,
  },
  {
    id: 'heal',
    icon: 'fa-wand-magic-sparkles',
    label: 'Draft Remediation Plan',
    description: 'Generate recommendations for resolving deterministic discrepancies.',
    instruction: 'Analyze the deterministic contradictions in the cover letter and batch IDs. Cross-reference them with JORT regulations and eCTD structures, and draft a detailed remediation plan suggesting the exact value corrections the human reviewer should apply.',
    color: 'var(--warning)',
    requiresSubmission: true,
  },
  {
    id: 'ask-authority',
    icon: 'fa-landmark',
    label: 'Audit Authority Decree',
    description: 'Query JORT regulatory documents for current authority guidelines.',
    instruction: 'Query the Tunisian JORT regulatory reference documents. Cite the decree and article outlining the current valid destination authority for AMM submissions. Explain why the legacy authority DPM is defunct and must be updated.',
    color: 'var(--success)',
    requiresSubmission: false,
  },
  {
    id: 'ask-batch',
    icon: 'fa-barcode',
    label: 'Audit Batch Matching',
    description: 'Analyze batch ID mismatches between Module 1 and Module 5.',
    instruction: 'Perform a compliance audit on the batch identifiers across Module 1 and Module 5. Cite the eCTD specification constraints from our reference files, detail where the mismatch occurs, and suggest the correction to align them.',
    color: '#a78bfa',
    requiresSubmission: true,
  },
  {
    id: 'summarize',
    icon: 'fa-file-lines',
    label: 'Audit Clinical Claims',
    description: 'Cross-reference clinical summary claims with raw trial statistics.',
    instruction: 'Cross-reference the dizziness incidence rate claim in Module 2 with the raw safety listings table in Module 5. Show the mathematical calculation from the trial data, highlight any contradiction, and suggest the clinical correction needed.',
    color: '#f472b6',
    requiresSubmission: true,
  },
];

// Document metadata dictionary
const metaData = {
  'oxalip-cover-letter.pdf': {
    author: 'Sarah M. (Regulatory Lead)',
    type: 'PDF/A-2b Submission Envelope',
    size: '2.1 KB',
    modified: '2026-07-18 10:14',
    hash: 'b2a14e9f7831ac8de1201ccdf'
  },
  'oxalip-application-form.json': {
    author: 'Systems Integration Engine',
    type: 'Structured envelope JSON',
    size: '8.4 KB',
    modified: '2026-07-18 11:22',
    hash: 'd8c47f9e8020ba7eef11029da'
  },
  'oxalip-clinical-summary.json': {
    author: 'Aatef K. (Medical Director)',
    type: 'Clinical Overviews (Module 2.3)',
    size: '42.1 KB',
    modified: '2026-07-18 14:05',
    hash: 'e833f2a1ab9cdd192994ebcf1'
  },
  'oxalip-safety-log.pdf': {
    author: 'Clinical Trials Operations',
    type: 'Patient Listing Logs (Module 5.3)',
    size: '2.0 KB',
    modified: '2026-07-18 15:47',
    hash: 'f9d9e8c8ab9cdd92995fcdeaa'
  }
};

export function FileTree({ selectedFile, setSelectedFile }) {
  const [collapsedFolders, setCollapsedFolders] = useState({
    m1: false,
    m2: false,
    m5: false,
  });

  const toggleFolder = (key) => {
    setCollapsedFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="file-tree-wrapper">
      <div className="tree-node">
        <div className="tree-folder-row" onClick={() => toggleFolder('m1')}>
          <i className={`fa-solid fa-chevron-down chevron ${collapsedFolders.m1 ? 'collapsed' : ''}`} />
          <i className="fa-solid fa-folder-open folder-icon" />
          <span>Module 1 — Administrative Data</span>
        </div>
        {!collapsedFolders.m1 && (
          <div className="tree-children">
            <div 
              className={`tree-file-row ${selectedFile === 'oxalip-cover-letter.pdf' ? 'selected' : ''}`}
              onClick={() => setSelectedFile('oxalip-cover-letter.pdf')}
            >
              <i className="fa-regular fa-file-pdf file-icon" />
              <span>oxalip-cover-letter.pdf</span>
            </div>
            <div 
              className={`tree-file-row ${selectedFile === 'oxalip-application-form.json' ? 'selected' : ''}`}
              onClick={() => setSelectedFile('oxalip-application-form.json')}
            >
              <i className="fa-regular fa-file-code file-icon" />
              <span>oxalip-application-form.json</span>
            </div>
          </div>
        )}
      </div>

      <div className="tree-node">
        <div className="tree-folder-row" onClick={() => toggleFolder('m2')}>
          <i className={`fa-solid fa-chevron-down chevron ${collapsedFolders.m2 ? 'collapsed' : ''}`} />
          <i className="fa-solid fa-folder-open folder-icon" />
          <span>Module 2 — Clinical Summaries</span>
        </div>
        {!collapsedFolders.m2 && (
          <div className="tree-children">
            <div 
              className={`tree-file-row ${selectedFile === 'oxalip-clinical-summary.json' ? 'selected' : ''}`}
              onClick={() => setSelectedFile('oxalip-clinical-summary.json')}
            >
              <i className="fa-regular fa-file-lines file-icon" />
              <span>oxalip-clinical-summary.json</span>
            </div>
          </div>
        )}
      </div>

      <div className="tree-node">
        <div className="tree-folder-row" onClick={() => toggleFolder('m5')}>
          <i className={`fa-solid fa-chevron-down chevron ${collapsedFolders.m5 ? 'collapsed' : ''}`} />
          <i className="fa-solid fa-folder-open folder-icon" />
          <span>Module 5 — Study Logs</span>
        </div>
        {!collapsedFolders.m5 && (
          <div className="tree-children">
            <div 
              className={`tree-file-row ${selectedFile === 'oxalip-safety-log.pdf' ? 'selected' : ''}`}
              onClick={() => setSelectedFile('oxalip-safety-log.pdf')}
            >
              <i className="fa-regular fa-file-pdf file-icon" />
              <span>oxalip-safety-log.pdf</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FileMetadata({ selectedFile }) {
  const meta = metaData[selectedFile] || {
    author: 'Unknown',
    type: 'Binary Document',
    size: '0 KB',
    modified: 'N/A',
    hash: 'N/A'
  };

  return (
    <div className="metadata-wrapper">
      <div className="metadata-file-header">
        <i className="fa-solid fa-file-lines doc-header-icon" />
        <span className="metadata-file-title">{selectedFile}</span>
      </div>
      
      <div className="meta-row">
        <span className="meta-label">Author</span>
        <span className="meta-val">{meta.author}</span>
      </div>
      <div className="meta-row">
        <span className="meta-label">Doc Type</span>
        <span className="meta-val">{meta.type}</span>
      </div>
      <div className="meta-row">
        <span className="meta-label">File Size</span>
        <span className="meta-val">{meta.size}</span>
      </div>
      <div className="meta-row">
        <span className="meta-label">Modified</span>
        <span className="meta-val">{meta.modified}</span>
      </div>
      <div className="meta-row hash-row">
        <span className="meta-label">MD5 Hash</span>
        <span className="meta-val">{meta.hash}</span>
      </div>
    </div>
  );
}

export function ActionShortcuts({ onTriggerAction, hasSubmission }) {
  return (
    <div className="action-shortcuts-list">
      {actionShortcuts.map((action) => {
        const disabled = action.requiresSubmission && !hasSubmission;
        return (
          <button 
            key={action.id}
            type="button"
            className={`action-card ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onTriggerAction(action)}
            disabled={disabled}
          >
            <div className="action-card-icon" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
              <i className={`fa-solid ${action.icon}`} />
            </div>
            <div className="action-card-content">
              <div className="action-card-label">{action.label}</div>
              <div className="action-card-desc">{action.description}</div>
            </div>
            <i className="fa-solid fa-chevron-right action-card-arrow" />
          </button>
        );
      })}
    </div>
  );
}

export function ChecklistItem({ label, module, status }) {
  const isCompleted = status === 'completed';
  const isRejected = status === 'rejected';

  return (
    <div className={`checklist-item-card ${status}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      backgroundColor: 'var(--bg-primary)',
      transition: 'all 0.3s ease'
    }}>
      <div className="checklist-check-icon" style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        backgroundColor: isCompleted 
          ? 'rgba(0, 200, 83, 0.1)' 
          : isRejected 
            ? 'rgba(213, 0, 0, 0.1)' 
            : 'rgba(255, 179, 0, 0.1)',
        color: isCompleted 
          ? '#00c853' 
          : isRejected 
            ? '#d50000' 
            : 'var(--warning)',
        flexShrink: 0
      }}>
        <i className={`fa-solid ${isCompleted ? 'fa-check' : isRejected ? 'fa-xmark' : 'fa-clock'}`} />
      </div>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>{label}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{module}</div>
      </div>
    </div>
  );
}

export function RightSidebar({ persona, selectedFile, setSelectedFile, onTriggerAction, hasSubmission, uploadedFiles, rejectedFiles, onReset, onComplete, width }) {
  const [activeTab, setActiveTab] = useState('files'); // 'files', 'metadata', 'actions'

  if (persona === 'sarah') {
    const getFileIngestionStatus = (targetFilename) => {
      if (hasSubmission) return 'completed';
      if (uploadedFiles && uploadedFiles.has(targetFilename)) return 'completed';
      
      if (rejectedFiles) {
        const cleanTarget = targetFilename.replace(/\.[^/.]+$/, "").replace(/[^a-z]/g, "");
        for (const rejected of rejectedFiles) {
          const cleanRejected = rejected.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[^a-z]/g, "");
          if (cleanRejected.includes(cleanTarget) || cleanTarget.includes(cleanRejected)) {
            return 'rejected';
          }
        }
      }
      return 'pending';
    };

    const letterStatus = getFileIngestionStatus('oxalip-cover-letter.pdf');
    const formStatus = getFileIngestionStatus('oxalip-application-form.json');
    const summaryStatus = getFileIngestionStatus('oxalip-clinical-summary.json');
    const logStatus = getFileIngestionStatus('oxalip-safety-log.pdf');

    return (
      <div className="right-sidebar" style={{ width }}>
        <div className="sidebar-header" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ingestion Dossier Checklist
        </div>
        <div className="tab-content" style={{ padding: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
            Please upload your eCTD submission package. The ingestion firewall will validate the package integrity and extract the underlying modules.
          </p>
          <div className="sarah-checklist" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            <ChecklistItem label="oxalip-cover-letter.pdf" module="Module 1.1 — Cover Letter" status={letterStatus} />
            <ChecklistItem label="oxalip-application-form.json" module="Module 1.2 — Admin Form" status={formStatus} />
            <ChecklistItem label="oxalip-clinical-summary.json" module="Module 2.3 — Clinical Summary" status={summaryStatus} />
            <ChecklistItem label="oxalip-safety-log.pdf" module="Module 5.3 — Patient Trial Logs" status={logStatus} />
          </div>

          <div className="sarah-actions-row" style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="sarah-btn reset-btn-checklist" 
              onClick={onReset}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                background: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fa-solid fa-arrow-rotate-left" /> Reset
            </button>
            <button 
              type="button" 
              className="sarah-btn complete-btn-checklist" 
              onClick={onComplete}
              disabled={!hasSubmission}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                color: '#fff',
                background: 'var(--success)',
                borderRadius: '4px',
                cursor: !hasSubmission ? 'not-allowed' : 'pointer',
                opacity: !hasSubmission ? 0.4 : 1,
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fa-solid fa-circle-check" /> Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-sidebar" style={{ width }}>
      <div className="tabs-header">
        <button 
          type="button"
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <i className="fa-solid fa-folder-tree" /> Files
        </button>
        <button 
          type="button"
          className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          <i className="fa-solid fa-info-circle" /> Metadata
        </button>
        <button 
          type="button"
          className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <i className="fa-solid fa-circle-play" /> Actions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'files' && (
          <FileTree selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        )}
        {activeTab === 'metadata' && (
          <FileMetadata selectedFile={selectedFile} />
        )}
        {activeTab === 'actions' && (
          <ActionShortcuts onTriggerAction={onTriggerAction} hasSubmission={hasSubmission} />
        )}
      </div>
    </div>
  );
}
