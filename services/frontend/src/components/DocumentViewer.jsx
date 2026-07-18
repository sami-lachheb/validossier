import React from 'react';
import './DocumentViewer.css';

export function DiffField({ label, currentVal, prevVal, fieldPath, diffKeys }) {
  const isChanged = diffKeys.has(fieldPath);

  return (
    <div className={`doc-field ${isChanged ? 'field-changed' : ''}`}>
      <div className="doc-field-label">{label}</div>
      <div className="doc-field-val">
        {isChanged && prevVal !== undefined ? (
          <span className="diff-container">
            <span className="diff-old">{String(prevVal)}</span>
            <span className="diff-arrow">→</span>
            <span className="diff-new">{String(currentVal)}</span>
          </span>
        ) : (
          <span>{String(currentVal ?? '—')}</span>
        )}
      </div>
    </div>
  );
}

export function DocumentViewer({ 
  activeSubmission, 
  prevDossier, 
  diffKeys, 
  selectedFile, 
  runVerification, 
  verifyLoading 
}) {
  const dossier = activeSubmission?.data?.dossier || {};
  const prev = prevDossier || {};

  const isModule1Selected = selectedFile === 'oxalip-cover-letter.pdf' || selectedFile === 'oxalip-application-form.json';
  const isModule5Selected = selectedFile === 'oxalip-safety-log.pdf';

  return (
    <div className="dossier-viewer-container">
      <div className="viewer-header">
        <span><i className="fa-solid fa-file-invoice" /> Active Submission: {activeSubmission?.filename || "No active dossier"}</span>
        {activeSubmission && (
          <button 
            className="verify-trigger-btn"
            onClick={runVerification}
            disabled={verifyLoading}
          >
            {verifyLoading ? (
              <span><i className="fa-solid fa-spinner fa-spin" /> Verifying...</span>
            ) : (
              <span><i className="fa-solid fa-circle-check" /> Run Compliance Checker</span>
            )}
          </button>
        )}
      </div>

      <div className="doc-viewer-grid">
        {/* Module 1 Administrative Card */}
        <div className={`doc-card ${isModule1Selected ? 'highlighted' : ''}`}>
          <div className="doc-card-header">
            <i className="fa-regular fa-file-code" /> Module 1: Administrative Envelope
          </div>
          <div className="doc-card-content">
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

        {/* Module 5 Clinical Trial Card */}
        <div className={`doc-card ${isModule5Selected ? 'highlighted' : ''}`}>
          <div className="doc-card-header">
            <i className="fa-regular fa-file-lines" /> Module 5: Clinical Safety Logs
          </div>
          <div className="doc-card-content">
            <DiffField 
              label="Study Batch ID" 
              currentVal={dossier.m5_clinical?.study_batch_id} 
              prevVal={prev.m5_clinical?.study_batch_id} 
              fieldPath="m5_clinical.study_batch_id" 
              diffKeys={diffKeys} 
            />
            <DiffField 
              label="Module 2 Text Summary Claim" 
              currentVal={dossier.m2_summary?.dizziness_claim} 
              prevVal={prev.m2_summary?.dizziness_claim} 
              fieldPath="m2_summary.dizziness_claim" 
              diffKeys={diffKeys} 
            />

            <div className="doc-field">
              <div className="doc-field-label">Safety Study Adverse Events</div>
              <div className="table-wrapper">
                <table className="trial-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th className="align-right">Count</th>
                      <th className="align-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.m5_clinical?.adverse_events_table?.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.event}</td>
                        <td className="align-right">{row.count}</td>
                        <td className="align-right">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
