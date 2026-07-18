import React from 'react';
import './PersonaToggle.css';

export function PersonaToggle({ persona, setPersona }) {
  return (
    <div className="persona-toggle-container">
      <div 
        className="persona-pill"
        style={{ transform: persona === 'sarah' ? 'translateX(0)' : 'translateX(100%)' }}
      />
      <button
        className={`persona-btn ${persona === 'sarah' ? 'active' : ''}`}
        onClick={() => setPersona('sarah')}
      >
        <i className="fa-solid fa-user-pen" />
        <span>Sarah</span>
        <span className="persona-role">Contributor</span>
      </button>
      <button
        className={`persona-btn ${persona === 'aatef' ? 'active' : ''}`}
        onClick={() => setPersona('aatef')}
      >
        <i className="fa-solid fa-user-shield" />
        <span>Aatef</span>
        <span className="persona-role">Orchestrator</span>
      </button>
    </div>
  );
}
