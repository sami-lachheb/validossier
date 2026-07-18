import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer } from './components/Toast';
import { PersonaToggle } from './components/PersonaToggle';
import { PipelineBar } from './components/PipelineBar';
import { UploadZone } from './components/UploadZone';
import { DocumentPreview } from './components/DocumentPreview';
import { DiscrepancyList } from './components/DiscrepancyList';
import { HitlOverlay } from './components/HitlOverlay';
import { RightSidebar } from './components/RightSidebar';
import { ChatPanel } from './components/ChatPanel';
import { Logo } from './components/Logo';

function App() {
  const [persona, setPersona] = useState('sarah'); // 'sarah' or 'aatef'
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  
  // Diff snapshots
  const [prevDossier, setPrevDossier] = useState(null);
  const [diffKeys, setDiffKeys] = useState(new Set());

  // Theme Light Mode
  const [lightMode, setLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [lightMode]);

  // Workspace panels resizing
  const [leftWidth, setLeftWidth] = useState(420);
  const [rightWidth, setRightWidth] = useState(320);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  // Layout sidebar states
  const [selectedFile, setSelectedFile] = useState('oxalip-cover-letter.pdf');
  const [previewSource, setPreviewSource] = useState(null); // { filename, line }
  const [uploadedFiles, setUploadedFiles] = useState(new Set());
  const [rejectedFiles, setRejectedFiles] = useState(new Set());
  
  // Left Chat panel states
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Loading states
  const [healLoading, setHealLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Notification Toast state
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const addToast = (message, type = 'info') => {
    const id = ++toastIdCounter.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchSubmissions = async (autoSelect = true) => {
    try {
      const res = await fetch(`${API_URL}/api/submissions`);
      const data = await res.json();
      setSubmissions(data);
      if (data.length > 0) {
        if (autoSelect) {
          const first = data[0];
          setActiveSubmission(first);
          if (first.data && first.data.chat_history) {
            setChatHistory(first.data.chat_history);
          } else {
            setChatHistory([]);
          }
        }
      } else {
        setActiveSubmission(null);
        setChatHistory([]);
      }
    } catch (e) {
      addToast("Failed to connect to gatekeeper service.", "error");
    }
  };

  // Sarah uploads file
  const handleProcessUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.status === 'ACCEPTED') {
      addToast(`File ${file.name} accepted by Ingestion Firewall.`, "success");
      setUploadedFiles(prev => {
        const next = new Set(prev);
        next.add(file.name);
        if (file.name.toLowerCase().includes('dossier') || file.name.toLowerCase().includes('form')) {
          next.add('oxalip-cover-letter.pdf');
          next.add('oxalip-application-form.json');
          next.add('oxalip-clinical-summary.json');
          next.add('oxalip-safety-log.pdf');
        }
        return next;
      });
      setRejectedFiles(prev => {
        const next = new Set(prev);
        next.delete(file.name);
        return next;
      });
      fetchSubmissions(true);
    } else {
      addToast(`Ingestion Firewall rejected filename format.`, "error");
      setRejectedFiles(prev => {
        const next = new Set(prev);
        next.add(file.name);
        return next;
      });
      setUploadedFiles(prev => {
        const next = new Set(prev);
        next.delete(file.name);
        return next;
      });
    }
    return data;
  };

  // Run Verification Checklist
  const runVerification = async () => {
    if (!activeSubmission) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verify/${activeSubmission.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      const discrepancies = data.discrepancies || [];
      if (discrepancies.length > 0) {
        addToast(`Compliance Checker flagged ${discrepancies.length} contradictions.`, "warning");
      } else {
        addToast("Compliance check complete. All rules satisfied.", "success");
      }

      const verifyMessage = discrepancies.length > 0
        ? `**Compliance Check Complete — ${discrepancies.length} violations found:**\n\n${
            discrepancies.map((d, i) => 
              `${i+1}. **${d.type.replace(/_/g, ' ')}** — ${d.message}\n   Field: \`${d.field}\` | Value: \`${d.current_value}\``
            ).join('\n\n')
          }`
        : '**Compliance Check Complete** — All regulatory rules satisfied. No contradictions detected.';

      setChatHistory(prev => [...prev, { sender: 'assistant', message: verifyMessage }]);
      fetchSubmissions(true);
    } catch (e) {
      addToast("Failed to verify dossier.", "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  // Run LLM Healing
  const onSubmitHeal = async (prompt) => {
    if (!activeSubmission) return;
    setHealLoading(true);
    
    // Snapshot current dossier before healing
    const oldDossier = JSON.parse(JSON.stringify(activeSubmission.data.dossier || {}));
    setPrevDossier(oldDossier);

    try {
      const res = await fetch(`${API_URL}/api/heal/${activeSubmission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();

      if (data.status === 'HEALING_FAILED') {
        addToast(data.message || "Auto-remediation failed.", "error");
        setChatHistory(prev => [...prev, { sender: 'assistant', message: `**Auto-Remediation Failed:** ${data.message || "Unresolved structural dependencies."}` }]);
      } else {
        const remaining = data.data?.discrepancies?.length || 0;
        addToast(`Remediation applied. ${remaining} violations remaining.`, remaining > 0 ? "warning" : "success");
        
        // Track the changed keys dynamically
        const newDossier = data.data?.dossier || {};
        const changes = new Set();
        
        for (const [section, fields] of Object.entries(newDossier)) {
          if (typeof fields === 'object' && !Array.isArray(fields)) {
            for (const [key, val] of Object.entries(fields)) {
              if (oldDossier[section]?.[key] !== val) {
                changes.add(`${section}.${key}`);
              }
            }
          }
        }
        setDiffKeys(changes);
        
        const healMessage = `**Auto-Remediation Applied:**\n\n${
          Array.from(changes).map(key => {
            const [section, field] = key.split('.');
            return `- \`${field}\`: ~~${oldDossier[section]?.[field]}~~ → **${newDossier[section]?.[field]}**`;
          }).join('\n')
        }\n\n${remaining > 0 
          ? `⚠️ ${remaining} violation(s) require human review.` 
          : '✓ All violations resolved.'}`;

        setChatHistory(prev => [...prev, { sender: 'assistant', message: healMessage }]);

        // Auto clear diff borders after 4 seconds
        setTimeout(() => {
          setDiffKeys(new Set());
        }, 4000);
        
        fetchSubmissions(true);
      }
    } catch (e) {
      addToast("Failed to apply healing prompt.", "error");
    } finally {
      setHealLoading(false);
    }
  };

  // Triggering actions from shortcuts tab
  const handleTriggerAction = (action) => {
    if (action.id === 'verify') {
      setChatHistory(prev => [...prev, { sender: 'user', message: 'Run Compliance Check' }]);
      runVerification();
    } else if (action.id === 'heal') {
      setChatHistory(prev => [...prev, { sender: 'user', message: 'Auto-Heal Dossier' }]);
      onSubmitHeal(action.instruction);
    } else {
      setChatHistory(prev => [...prev, { sender: 'user', message: action.label }]);
      onSendChatMessage(action.instruction, true);
    }
  };

  // Chat panel sending
  const onSendChatMessage = async (msgText, skipUserAppend = false) => {
    if (!skipUserAppend) {
      setChatHistory(prev => [...prev, { sender: 'user', message: msgText }]);
    }
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          submission_id: activeSubmission ? activeSubmission.id : null
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setChatHistory(prev => [...prev, { sender: 'assistant', message: `⚠️ **Agent Error:** ${data.detail || 'Failed to query the regulatory assistant.'}` }]);
        return;
      }
      
      // Inject simulated intermediate reasoning step tokens prefix for video flashiness
      let formattedResponse = data.response;
      if (msgText.toLowerCase().includes('authority') || msgText.toLowerCase().includes('jort')) {
        formattedResponse = `▸ Locating regulatory guidelines...\n▸ Searching jort_2023_072_translated.json...\n▸ Accessing Page 3, Article 1...\n${data.response}`;
      } else if (msgText.toLowerCase().includes('batch') || msgText.toLowerCase().includes('codes')) {
        formattedResponse = `▸ eCTD structure schema resolved...\n▸ Verifying Module 1 batch matching codes...\n▸ Cross-referencing study log coordinates...\n${data.response}`;
      }
      
      setChatHistory(prev => [...prev, { sender: 'assistant', message: formattedResponse }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { sender: 'assistant', message: `Error contacting agent: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Human override signoff
  const onOverride = async () => {
    if (!activeSubmission) return;
    try {
      const res = await fetch(`${API_URL}/api/override/${activeSubmission.id}`, {
        method: 'POST'
      });
      addToast("Manually signed off and approved. Dossier locked.", "success");
      fetchSubmissions(true);
    } catch (e) {
      addToast("Override transaction failed.", "error");
    }
  };

  // Human rejection action
  const onReject = async () => {
    if (!activeSubmission) return;
    try {
      const res = await fetch(`${API_URL}/api/reject/${activeSubmission.id}`, {
        method: 'POST'
      });
      addToast("Dossier manually rejected. Contributor notified.", "error");
      fetchSubmissions(true);
    } catch (e) {
      addToast("Rejection transaction failed.", "error");
    }
  };

  // Wipes all data
  const resetDemo = async () => {
    try {
      await fetch(`${API_URL}/api/reset`, { method: 'POST' });
      setPrevDossier(null);
      setDiffKeys(new Set());
      setPreviewSource(null);
      setUploadedFiles(new Set());
      setRejectedFiles(new Set());
      addToast("Database entries wiped. Demo seed restored.", "info");
      fetchSubmissions(true);
    } catch (e) {
      addToast("Reset failed.", "error");
    }
  };

  // Sidebar Resizing
  const startResizeLeft = () => {
    isResizingLeft.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const startResizeRight = () => {
    isResizingRight.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const handleMouseMove = (e) => {
    if (isResizingLeft.current) {
      const newWidth = e.clientX;
      if (newWidth > 280 && newWidth < 600) {
        setLeftWidth(newWidth);
      }
    }
    if (isResizingRight.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 450) {
        setRightWidth(newWidth);
      }
    }
  };

  const stopResize = () => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  const activeStatus = activeSubmission?.status || null;
  const activeDiscrepancies = activeSubmission?.data?.discrepancies || [];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Logo />
        </div>
        
        <div className="header-actions">
          <PersonaToggle persona={persona} setPersona={setPersona} />
          
          <button 
            className="theme-toggle-btn"
            onClick={() => setLightMode(!lightMode)}
            title="Toggle Light/Dark Theme"
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fa-solid ${lightMode ? 'fa-moon' : 'fa-sun'}`} />
          </button>

          <button className="reset-btn" onClick={resetDemo}>
            <i className="fa-solid fa-arrow-rotate-left" /> Reset Demo
          </button>
        </div>
      </header>

      {/* Pipeline Status Indicator */}
      <PipelineBar status={activeStatus} />

      <div className="workspace-container">
        {/* Left Side: Document Preview (Aatef only) */}
        {persona === 'aatef' && (
          <>
            <div className="panel left-panel" style={{ width: leftWidth, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <DocumentPreview 
                selectedFile={selectedFile}
                previewSource={previewSource}
                onClearSource={() => setPreviewSource(null)}
                activeSubmission={activeSubmission}
                prevDossier={prevDossier}
                diffKeys={diffKeys}
              />
            </div>
            <div className="panel-resizer active" onMouseDown={startResizeLeft} />
          </>
        )}

        {/* Center Panel: Upload Zone (Sarah) or Chat panel (Aatef) */}
        <div className="panel center-panel">
          {persona === 'sarah' ? (
            <div className="workspace-slide slide-right">
              <UploadZone onProcessUpload={handleProcessUpload} />
            </div>
          ) : (
            <div className="workspace-slide slide-left" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <ChatPanel 
                chatHistory={chatHistory} 
                chatLoading={chatLoading} 
                onSendChatMessage={onSendChatMessage} 
                onSelectSource={(filename, line) => setPreviewSource({ filename, line })}
              />
            </div>
          )}
        </div>

        <div className="panel-resizer active" onMouseDown={startResizeRight} />

        {/* Right Side: Tabbed File tree and shortcuts */}
        <RightSidebar 
          persona={persona}
          selectedFile={selectedFile} 
          setSelectedFile={(file) => {
            setSelectedFile(file);
            setPreviewSource(null);
          }} 
          onTriggerAction={handleTriggerAction}
          hasSubmission={!!activeSubmission}
          uploadedFiles={uploadedFiles}
          rejectedFiles={rejectedFiles}
          onReset={resetDemo}
          onComplete={runVerification}
          width={rightWidth}
        />
      </div>

      {/* Human in the loop override interception overlay */}
      {persona === 'aatef' && activeStatus === 'HITL_FROZEN' && (
        <HitlOverlay 
          discrepancies={activeDiscrepancies}
          onOverride={onOverride}
          onReject={onReject}
        />
      )}

      {/* Notifications stack */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
