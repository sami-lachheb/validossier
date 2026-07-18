import React, { useState } from 'react';
import './HitlOverlay.css';

export function HitlOverlay({ discrepancies, onOverride, onReject }) {
  const [statusState, setStatusState] = useState(null); // 'approved' or 'rejected'

  const clinicalDisc = discrepancies.find(d => d.type === 'SEMANTIC_CONTRADICTION') || discrepancies[0];
  const splitValues = clinicalDisc?.current_value ? clinicalDisc.current_value.split(/ vs /i) : ['Text: 0.5%', 'Table: 0.67%'];
  const valueA = splitValues[0];
  const valueB = splitValues[1] || '';

  const handleApprove = async () => {
    setStatusState('approved');
    setTimeout(async () => {
      await onOverride();
    }, 1500);
  };

  const handleReject = async () => {
    setStatusState('rejected');
    setTimeout(async () => {
      await onReject();
    }, 1500);
  };

  return (
    <div className="hitl-backdrop">
      <div className={`hitl-modal ${statusState ? 'completed-state' : ''}`}>
        {statusState === null ? (
          <>
            <div className="hitl-icon-ring">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h2 className="hitl-title">Human Verification Required</h2>
            <p className="hitl-subtitle">
              {clinicalDisc?.message || "Auto-remediation cannot resolve this discrepancy. Manual clinical review is required."}
            </p>

            <div className="hitl-comparison">
              <div className="hitl-col">
                <div className="hitl-col-header">
                  {clinicalDisc?.field?.split(/ vs /i)[0]?.replace(/_/g, ' ') || 'Summary Claim (Module 2)'}
                </div>
                <div className="hitl-col-value error">
                  {valueA}
                </div>
              </div>
              <div className="hitl-vs">VS</div>
              <div className="hitl-col">
                <div className="hitl-col-header">
                  {clinicalDisc?.field?.split(/ vs /i)[1]?.replace(/_/g, ' ') || 'Source Trial Data (Module 5)'}
                </div>
                <div className="hitl-col-value success">
                  {valueB}
                </div>
              </div>
            </div>

            <div className="hitl-actions-row">
              <button className="hitl-approve-btn" onClick={handleApprove}>
                <i className="fa-solid fa-signature" /> Approve Override
              </button>
              <button className="hitl-reject-btn" onClick={handleReject}>
                <i className="fa-solid fa-ban" /> Reject Submission
              </button>
            </div>
            <p className="hitl-disclaimer">
              This action is logged in the immutable audit trail.
            </p>
          </>
        ) : statusState === 'approved' ? (
          <div className="hitl-checkmark-container">
            <svg className="hitl-checkmark" viewBox="0 0 52 52">
              <circle className="hitl-checkmark-circle approve" cx="26" cy="26" r="24" fill="none" />
              <path className="hitl-checkmark-check approve" fill="none" d="M14 27l7 7 16-16" />
            </svg>
            <p className="hitl-approved-text">Override Approved</p>
          </div>
        ) : (
          <div className="hitl-checkmark-container">
            <svg className="hitl-checkmark" viewBox="0 0 52 52">
              <circle className="hitl-checkmark-circle reject" cx="26" cy="26" r="24" fill="none" />
              <path className="hitl-checkmark-check reject" fill="none" d="M16 16l20 20M36 16L16 36" />
            </svg>
            <p className="hitl-rejected-text">Submission Rejected</p>
          </div>
        )}
      </div>
    </div>
  );
}
