import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import SettingsModal from './components/SettingsModal';
import {
  getApiKey,
  saveApiKey,
  getSystemPrompt,
  saveSystemPrompt,
  getMessages,
  saveMessages
} from './utils/storage';

/**
 * Core single-page chat application with:
 * - centered chat UI
 * - header with settings
 * - messages area
 * - input fixed at bottom
 * - API key & system prompt settings (localStorage)
 * - message history persistence
 * - copy-to-clipboard for assistant messages
 */

// Simple unique id for messages
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// PUBLIC_INTERFACE
/**
 * Root App component rendering the chat interface.
 * Handles state, persistence, and API interactions with OpenAI.
 */
export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(getSystemPrompt());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load initial persisted values
  useEffect(() => {
    setApiKey(getApiKey() || '');
    setSystemPrompt(getSystemPrompt());
    const persisted = getMessages();
    if (Array.isArray(persisted) && persisted.length > 0) {
      setMessages(persisted);
    }
  }, []);

  // Auto-open settings when API key missing
  useEffect(() => {
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, [apiKey]);

  // Persist messages whenever they change
  useEffect(() => {
    saveMessages(messages);
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  // PUBLIC_INTERFACE
  /**
   * Copy provided text to clipboard and flash a quick visual hint.
   * @param {string} text - The text to copy.
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Send a user message to OpenAI and append assistant response.
   * Uses Chat Completions API.
   */
  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    // Append user message
    const nextMessages = [
      ...messages,
      { id: uid(), role: 'user', content }
    ];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Prepare payload with system prompt + history
    const chatMessages = [
      { role: 'system', content: systemPrompt || 'You are a helpful, concise AI assistant.' },
      ...nextMessages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: chatMessages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage =
        data?.choices?.[0]?.message?.content?.trim() || '⚠️ No response received.';

      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'assistant', content: assistantMessage }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: `⚠️ Error fetching response. Please verify your API key and try again.\n\nDetails: ${e.message || e.toString()}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Handle Enter to send, Shift+Enter for new line.
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e
   */
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Save settings (API key and system prompt) to localStorage and close modal.
   * @param {{apiKey:string, systemPrompt:string}} param0
   */
  const handleSaveSettings = ({ apiKey: nextKey, systemPrompt: nextSystemPrompt }) => {
    saveApiKey(nextKey);
    saveSystemPrompt(nextSystemPrompt);
    setApiKey(nextKey);
    setSystemPrompt(nextSystemPrompt);
    setIsSettingsOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-inner">
          <div className="brand" aria-label="Application brand">
            <div className="logo" aria-hidden="true">AI</div>
            <div className="title">Chatbot</div>
          </div>
          <div className="header-actions">
            {copied && (
              <span className="hint" aria-live="polite">Copied!</span>
            )}
            <button
              className="icon-btn"
              title="Settings"
              aria-label="Open settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="chat-container">
          <div className="messages" role="log" aria-live="polite" aria-label="Chat message history">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div>
                  <div style={{fontWeight: 700, textAlign: 'center', marginBottom: 6}}>Welcome</div>
                  <div className="hint" style={{textAlign: 'center'}}>
                    Enter your message below to start chatting.
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <ChatMessage key={m.id} message={m} onCopy={copyToClipboard} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-inner">
              <textarea
                ref={textAreaRef}
                value={input}
                placeholder="Type your message... (Shift+Enter for new line)"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Message input"
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true">⏳</span>
                    Sending
                  </>
                ) : (
                  <>
                    Send
                    <span aria-hidden="true">➤</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      <SettingsModal
        open={isSettingsOpen}
        initialApiKey={apiKey}
        initialSystemPrompt={systemPrompt}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
