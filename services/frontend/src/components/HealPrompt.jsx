import React, { useState } from 'react';

export function HealPrompt({ onSubmitHeal, healLoading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmitHeal(prompt);
    setPrompt('');
  };

  return (
    <form className="chat-form" style={{ marginTop: '15px' }} onSubmit={handleSubmit}>
      <input 
        type="text" 
        className="chat-input"
        placeholder="Ask compliance agent to heal discrepancies... (e.g. 'Align batch numbers')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={healLoading}
      />
      <button type="submit" className="chat-submit-btn" disabled={healLoading}>
        {healLoading ? (
          <span><i className="fa-solid fa-spinner fa-spin" /> Healing...</span>
        ) : (
          <span><i className="fa-solid fa-wand-magic-sparkles" /> Heal Dossier</span>
        )}
      </button>
    </form>
  );
}
