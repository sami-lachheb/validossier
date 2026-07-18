import React, { useState } from 'react';
import './ChatPanel.css';

export function ThinkingSteps({ steps }) {
  const [expanded, setExpanded] = useState(false);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="thinking-steps">
      <button 
        type="button" 
        className="thinking-toggle" 
        onClick={() => setExpanded(!expanded)}
      >
        <i className={`fa-solid fa-chevron-${expanded ? 'down' : 'right'}`} />
        <span>{steps.length} reasoning steps</span>
      </button>
      {expanded && (
        <div className="thinking-steps-list">
          {steps.map((step, i) => (
            <div key={i} className="thinking-step">
              <i className="fa-solid fa-gear fa-spin" style={{ fontSize: '10px', color: 'var(--accent)' }} />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return '';
  // Escapes HTML tags
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Inline code: `code`
  escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Link: [text](url)
  // We keep the file:///data link as is in the markdown source because the click handler intercepts the href target.
  escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--accent); text-decoration: underline;">$1</a>');
  
  // Headers
  escaped = escaped.replace(/^###\s+(.*?)$/gm, '<h3 style="margin-top: 10px; margin-bottom: 4px; font-size: 14px;">$1</h3>');
  escaped = escaped.replace(/^##\s+(.*?)$/gm, '<h2 style="margin-top: 12px; margin-bottom: 6px; font-size: 16px;">$1</h2>');
  escaped = escaped.replace(/^#\s+(.*?)$/gm, '<h1 style="margin-top: 14px; margin-bottom: 8px; font-size: 18px;">$1</h1>');

  // Bullet items
  escaped = escaped.replace(/^\*\s+(.*?)$/gm, '<li style="margin-left: 15px; margin-bottom: 4px;">$1</li>');
  escaped = escaped.replace(/^-\s+(.*?)$/gm, '<li style="margin-left: 15px; margin-bottom: 4px;">$1</li>');

  return <div dangerouslySetInnerHTML={{ __html: escaped }} />;
}

export function ChatPanel({ 
  chatHistory, 
  chatLoading, 
  onSendChatMessage, 
  onSelectSource 
}) {
  const [chatMessage, setChatMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    onSendChatMessage(chatMessage);
    setChatMessage('');
  };

  // Intercept click on file:///data references
  const handleChatClick = (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')) {
      const href = link.getAttribute('href');
      
      // Parse file:///data/filename.json#L508
      const fileMatch = /file:\/\/\/data\/([a-z0-9_\-\.]+)(?:#L(\d+))?/i.exec(href) ||
                        /sources\/([a-z0-9_\-\.]+)(?:#L(\d+))?/i.exec(href) ||
                        /\/data\/([a-z0-9_\-\.]+)(?:#L(\d+))?/i.exec(href);
      if (fileMatch) {
        e.preventDefault();
        const filename = fileMatch[1];
        const line = fileMatch[2] || null;
        if (onSelectSource) {
          onSelectSource(filename, line);
        }
      }
    }
  };

  // Extract thinking steps dynamically from reasoning tags if present in the response
  const parseMessage = (msgText) => {
    if (!msgText) return { steps: [], cleanText: '' };
    
    const stepRegex = /▸\s*(.*?)(?=\n|$)/g;
    const steps = [];
    let match;
    while ((match = stepRegex.exec(msgText)) !== null) {
      steps.push(match[1]);
    }
    
    const cleanText = msgText.replace(/▸\s*.*?\n/g, '').trim();
    return { steps, cleanText: cleanText || msgText };
  };

  return (
    <div className="chat-panel" style={{ width: '100%' }}>
      <div className="panel-header">
        <span><i className="fa-solid fa-robot" /> Compliance Co-Pilot</span>
      </div>

      <div className="chat-history" onClick={handleChatClick}>
        {chatHistory.length === 0 ? (
          <div className="chat-empty-state">
            <i className="fa-solid fa-shield-halved chat-empty-icon" />
            <p>Ask the Compliance Agent about the Tunisian JORT laws, AMM requirements, or cross-document discrepancies.</p>
          </div>
        ) : (
          chatHistory.map((chat, idx) => {
            const isAssistant = chat.sender === 'assistant';
            const { steps, cleanText } = isAssistant ? parseMessage(chat.message) : { steps: [], cleanText: chat.message };

            return (
              <div key={idx} className={`chat-bubble ${chat.sender}`}>
                <div className="chat-bubble-header">
                  {chat.sender === 'user' ? 'AATEF' : 'VALIDOSSIER AI'}
                </div>
                {isAssistant && steps.length > 0 && <ThinkingSteps steps={steps} />}
                <div className="chat-bubble-body">
                  {isAssistant ? renderMarkdown(cleanText) : cleanText}
                </div>
              </div>
            );
          })
        )}
        
        {chatLoading && (
          <div className="chat-bubble assistant">
            <div className="chat-bubble-header">VALIDOSSIER AI</div>
            <div className="thinking-indicator">
              <div className="thinking-dots">
                <span />
                <span />
                <span />
              </div>
              <span>Searching regulatory guidelines...</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <form className="chat-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask agent for regulatory audit advice..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={chatLoading}
          />
          <button type="submit" className="chat-submit-btn" disabled={chatLoading}>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>
      </div>
    </div>
  );
}
