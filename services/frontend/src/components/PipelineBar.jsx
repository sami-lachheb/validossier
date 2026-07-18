import React from 'react';
import './PipelineBar.css';

const stages = ['UPLOAD', 'INGEST', 'VERIFY', 'HEAL', 'APPROVED'];
const icons = ['fa-cloud-arrow-up', 'fa-shield-halved', 'fa-magnifying-glass-chart', 'fa-wand-magic-sparkles', 'fa-circle-check'];

function getActiveIndex(status) {
  if (!status) return -1;
  switch (status) {
    case 'PENDING': return 0;
    case 'ACCEPTED': return 1;
    case 'REJECTED': return 1; // Fails on ingest firewall
    case 'HITL_FROZEN': return 3;
    case 'HEALED': return 3;
    case 'VERIFIED': return 4;
    default: return -1;
  }
}

function getNodeState(index, activeIndex, status) {
  if (status === 'REJECTED' && index === 1) return 'failed';
  if (index === activeIndex) return 'active';
  if (index < activeIndex) return 'completed';
  return '';
}

export function PipelineBar({ status }) {
  const activeIndex = getActiveIndex(status);

  return (
    <div className="pipeline-bar-wrapper">
      <div className="pipeline-bar">
        {stages.map((stage, i) => (
          <React.Fragment key={stage}>
            {i > 0 && (
              <div 
                className={`pipeline-connector ${i <= activeIndex ? 'filled' : ''} ${status === 'HITL_FROZEN' && i === 4 ? 'locked' : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            )}
            <div className={`pipeline-node ${getNodeState(i, activeIndex, status)}`}>
              <div className="pipeline-node-icon">
                <i className={`fa-solid ${icons[i]}`} />
              </div>
              <span className="pipeline-label">{stage}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
