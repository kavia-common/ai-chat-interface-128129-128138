import React from 'react';

/**
 * Chat message bubble for user and assistant roles.
 * Renders left-aligned assistant messages and right-aligned user messages.
 */

// PUBLIC_INTERFACE
export default function ChatMessage({ message, onCopy }) {
  /** Determine alignment and styles */
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`msg-row ${isUser ? 'right' : 'left'}`}>
      <div className={`msg-bubble ${isUser ? 'user' : 'assistant'}`}>
        <div className="msg-content">
          <pre>{message.content}</pre>
        </div>
        {isAssistant && (
          <button
            className="icon-btn copy-btn"
            title="Copy to clipboard"
            aria-label="Copy assistant message to clipboard"
            onClick={() => onCopy?.(message.content)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
