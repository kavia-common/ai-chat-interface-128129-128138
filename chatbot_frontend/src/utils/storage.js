//
// PUBLIC_INTERFACE
/**
 * Storage utility for managing local persistence of API key, system prompt, and chat messages.
 * All values are stored in localStorage under scoped keys to avoid collisions.
 */
export const StorageKeys = {
  API_KEY: 'openai_api_key',
  SYSTEM_PROMPT: 'system_prompt',
  CHAT_MESSAGES: 'chat_messages',
};

/**
 * Safely parse JSON from localStorage.
 * @param {string} key - The localStorage key to read.
 * @param {any} fallback - The fallback value if parsing fails or key missing.
 * @returns {any} Parsed value or fallback.
 */
function safeGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/**
 * Safely set JSON into localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {any} value - The value to serialize and store.
 */
function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Silently ignore storage quota errors.
  }
}

// PUBLIC_INTERFACE
/**
 * Get the stored OpenAI API key (if present).
 * @returns {string|null} The API key string, or null if not stored.
 */
export function getApiKey() {
  return localStorage.getItem(StorageKeys.API_KEY) || null;
}

// PUBLIC_INTERFACE
/**
 * Save the OpenAI API key locally.
 * @param {string} key - The API key to store.
 * @returns {void}
 */
export function saveApiKey(key) {
  if (typeof key === 'string') {
    localStorage.setItem(StorageKeys.API_KEY, key.trim());
  }
}

// PUBLIC_INTERFACE
/**
 * Get the stored system prompt (if present).
 * @returns {string} System prompt string.
 */
export function getSystemPrompt() {
  return localStorage.getItem(StorageKeys.SYSTEM_PROMPT) || 'You are a helpful, concise AI assistant.';
}

// PUBLIC_INTERFACE
/**
 * Save the system prompt locally.
 * @param {string} prompt - The prompt to store.
 * @returns {void}
 */
export function saveSystemPrompt(prompt) {
  localStorage.setItem(StorageKeys.SYSTEM_PROMPT, prompt || '');
}

// PUBLIC_INTERFACE
/**
 * Get stored chat messages array.
 * @returns {Array<{id:string, role:'user'|'assistant'|'system', content:string}>} Messages
 */
export function getMessages() {
  return safeGetJSON(StorageKeys.CHAT_MESSAGES, []);
}

// PUBLIC_INTERFACE
/**
 * Save chat messages array.
 * @param {Array<{id:string, role:'user'|'assistant'|'system', content:string}>} messages
 * @returns {void}
 */
export function saveMessages(messages) {
  safeSetJSON(StorageKeys.CHAT_MESSAGES, messages || []);
}
