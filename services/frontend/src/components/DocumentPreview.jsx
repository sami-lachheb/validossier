import React, { useEffect, useState, useRef } from 'react';
import './DocumentPreview.css';
import { DiffField } from './DocumentViewer';

export function DocumentPreview({ selectedFile, previewSource, onClearSource, activeSubmission, prevDossier, diffKeys }) {
  const [sourceContent, setSourceContent] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);
  const sourceRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Read active dossier fields
  const dossier = activeSubmission?.data?.dossier || {};
  const prev = prevDossier || {};

  // Fetch source file contents when citation clicked
  useEffect(() => {
    if (previewSource && previewSource.filename) {
      fetchSourceContent(previewSource.filename);
    }
  }, [previewSource]);

  const fetchSourceContent = async (filename) => {
    setSourceLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sources/${filename}`);
      if (res.ok) {
        const text = await res.text();
        setSourceContent(text);
      } else {
        setSourceContent(`Failed to retrieve source document: ${res.statusText}`);
      }
    } catch (e) {
      setSourceContent(`Error loading source file: ${e.message}`);
    } finally {
      setSourceLoading(false);
    }
  };

  // Scroll cited line into view when content loads
  useEffect(() => {
    if (previewSource && previewSource.line && sourceRef.current) {
      const lineEl = document.getElementById(`source-line-${previewSource.line}`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [sourceContent, previewSource]);

  // Case 1: Render source citation viewer
  if (previewSource && previewSource.filename) {
    const lines = sourceContent.split('\n');
    return (
      <div className="document-preview">
        <div className="preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><i className="fa-solid fa-code" /> Source Citation: {previewSource.filename} {previewSource.line ? `(Line ${previewSource.line})` : ''}</span>
          <button 
            type="button" 
            className="clear-source-btn" 
            onClick={onClearSource}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="preview-body code-body" ref={sourceRef}>
          {sourceLoading ? (
            <div className="preview-loading">
              <i className="fa-solid fa-spinner fa-spin" /> Loading source file...
            </div>
          ) : (
            <pre className="source-pre">
              {lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isTarget = Number(previewSource.line) === lineNum;
                return (
                  <div 
                    key={idx} 
                    id={`source-line-${lineNum}`}
                    className={`source-line-row ${isTarget ? 'highlighted-line' : ''}`}
                  >
                    <span className="source-gutter">{lineNum}</span>
                    <code className="source-code">{lineText || ' '}</code>
                  </div>
                );
              })}
            </pre>
          )}
        </div>
      </div>
    );
  }

  // Case 2: Render PDF view in an object
  if (selectedFile && selectedFile.endsWith('.pdf')) {
    const pdfUrl = `${API_URL}/api/files/${selectedFile}`;
    return (
      <div className="document-preview">
        <div className="preview-header">
          <i className="fa-solid fa-file-pdf" /> Document Preview: {selectedFile}
        </div>
        <div className="preview-body" style={{ padding: 0 }}>
          <object 
            data={pdfUrl} 
            type="application/pdf" 
            className="pdf-embed"
          >
            <div className="preview-empty">
              <p>Your browser does not support viewing PDFs inline. <a href={pdfUrl} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>Download PDF</a></p>
            </div>
          </object>
        </div>
      </div>
    );
  }

  // Case 3: Render Application Envelope fields
  if (selectedFile === 'oxalip-application-form.json') {
    return (
      <div className="document-preview">
        <div className="preview-header">
          <i className="fa-solid fa-file-invoice" /> Form Preview: oxalip-application-form.json
        </div>
        <div className="preview-body">
          <div className="preview-section-title">Module 1 Administrative Fields</div>
          <div className="preview-card">
            <DiffField 
              label="Trade Name" 
              currentVal={dossier.m1_admin?.trade_name} 
              prevVal={prev.m1_admin?.trade_name} 
              fieldPath="m1_admin.trade_name" 
              diffKeys={diffKeys} 
            />
            <DiffField 
              label="Active Ingredient" 
              currentVal={dossier.m1_admin?.active_ingredient} 
              prevVal={prev.m1_admin?.active_ingredient} 
              fieldPath="m1_admin.active_ingredient" 
              diffKeys={diffKeys} 
            />
            <DiffField 
              label="Batch Identifier" 
              currentVal={dossier.m1_admin?.batch_id} 
              prevVal={prev.m1_admin?.batch_id} 
              fieldPath="m1_admin.batch_id" 
              diffKeys={diffKeys} 
            />
            <DiffField 
              label="Destination Authority" 
              currentVal={dossier.m1_admin?.destination_authority} 
              prevVal={prev.m1_admin?.destination_authority} 
              fieldPath="m1_admin.destination_authority" 
              diffKeys={diffKeys} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Render Clinical Summary
  if (selectedFile === 'oxalip-clinical-summary.json') {
    return (
      <div className="document-preview">
        <div className="preview-header">
          <i className="fa-solid fa-file-code" /> Summary Preview: oxalip-clinical-summary.json
        </div>
        <div className="preview-body">
          <div className="preview-section-title">Module 2 Summary Claims</div>
          <div className="preview-card">
            <DiffField 
              label="Adverse Event Dizziness Claim" 
              currentVal={dossier.m2_summary?.dizziness_claim} 
              prevVal={prev.m2_summary?.dizziness_claim} 
              fieldPath="m2_summary.dizziness_claim" 
              diffKeys={diffKeys} 
            />
            <DiffField 
              label="Reference Safety Study" 
              currentVal={dossier.m5_clinical?.study_batch_id} 
              prevVal={prev.m5_clinical?.study_batch_id} 
              fieldPath="m5_clinical.study_batch_id" 
              diffKeys={diffKeys} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty state fallback
  return (
    <div className="document-preview">
      <div className="preview-empty">
        <i className="fa-solid fa-folder-open" style={{ fontSize: '36px', marginBottom: '10px' }} />
        <p>Select a document from the File Tree to review its contents.</p>
      </div>
    </div>
  );
}
