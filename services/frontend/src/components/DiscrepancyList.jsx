import React from 'react';
import './DiscrepancyList.css';

export function DiscrepancyCard({ disc, index, isResolved }) {
  return (
    <div 
      className={`discrepancy-card ${isResolved ? 'resolved' : ''}`}
      style={{ animationDelay: `${index * 200}ms` }}
      data-severity={disc.severity}
    >
      <div className="disc-severity-stripe" />
      <div className="disc-body">
        <div className="disc-header">
          <span className={`disc-dot ${isResolved ? 'green' : 'red'}`} />
          <strong>{disc.type.replace(/_/g, ' ')}</strong>
        </div>
        <p className="disc-message">{disc.message}</p>
        <div className="disc-details">
          <span className="disc-field">{disc.field}</span>
          <span className="disc-value">{disc.current_value}</span>
        </div>
      </div>
    </div>
  );
}

export function DiscrepancyList({ discrepancies, resolvedDiscrepancies = [] }) {
  const allDiscrepancies = [
    ...discrepancies.map(d => ({ ...d, isResolved: false })),
    ...resolvedDiscrepancies.map(d => ({ ...d, isResolved: true }))
  ];

  return (
    <div className="discrepancy-panel">
      <div className="discrepancy-panel-header">
        <span><i className="fa-solid fa-triangle-exclamation" /> AI Checklist Findings ({discrepancies.length})</span>
      </div>

      {allDiscrepancies.length === 0 ? (
        <div className="all-clear-message">
          <i className="fa-solid fa-circle-check" /> Verification passed. No contradictions found in current data structure.
        </div>
      ) : (
        <div className="discrepancy-list">
          {allDiscrepancies.map((disc, idx) => (
            <DiscrepancyCard 
              key={idx}
              disc={disc}
              index={idx}
              isResolved={disc.isResolved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
