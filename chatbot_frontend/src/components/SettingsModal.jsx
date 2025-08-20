import React, { useEffect, useState } from 'react';

/**
 * Settings modal to configure OpenAI API key and system prompt.
 * Data is managed externally; this component only manages local form state and emits onSave.
 */

const MASK = '•';

// PUBLIC_INTERFACE
export default function SettingsModal({
  open,
  initialApiKey = '',
  initialSystemPrompt = '',
  onClose,
  onSave
}) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(initialApiKey);
  }, [initialApiKey]);

  useEffect(() => {
    setSystemPrompt(initialSystemPrompt);
  }, [initialSystemPrompt]);

  if (!open) return null;

  const handleSave = () => {
    onSave?.({
      apiKey: apiKey.trim(),
      systemPrompt: systemPrompt.trim(),
    });
  };

  const maskedKey = apiKey ? apiKey[0] + MASK.repeat(Math.max(apiKey.length - 4, 0)) + apiKey.slice(-3) : '';

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="settings-title">Settings</h3>
          <button className="icon-btn" aria-label="Close settings" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI API Key</label>
            <div className="input-with-action">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              <button
                className="icon-btn"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                title={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            {initialApiKey && !showKey && (
              <div className="hint">Currently saved: {maskedKey}</div>
            )}
            <div className="warning">
              Your API key is stored only in your browser (localStorage). Never share it.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="systemPrompt">System Prompt</label>
            <textarea
              id="systemPrompt"
              rows={5}
              placeholder="You are a helpful, concise AI assistant."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <div className="hint">
              This will be sent as the system message to guide the assistant.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn outline" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
