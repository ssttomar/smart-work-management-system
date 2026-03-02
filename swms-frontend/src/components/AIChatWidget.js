/**
 * AIChatWidget.js — Role-Aware AI Workforce Assistant
 *
 * A floating chat widget that is mounted globally inside AuthProvider.
 * It only renders when the user is authenticated (user != null).
 *
 * FEATURES:
 *  • Floating action button (bottom-right)
 *  • Slide-up chat window with message history
 *  • Role-based welcome message and suggested prompts
 *  • Conversation memory (conversationId persisted in state)
 *  • Weekly Summary shortcut button
 *  • Loading indicator while awaiting AI response
 *  • Auto-scroll to the latest message
 *
 * ROLES:
 *  EMPLOYEE → personal task / attendance queries
 *  MANAGER  → team workload / productivity insights
 *  ADMIN    → organisation-wide analytics
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

/* ── Colour palette (matches existing app theme) ─────────────────── */
const C = {
  navy:    '#0f3460',
  deep:    '#0a1f44',
  accent:  '#e94560',
  purple:  '#533483',
  white:   '#ffffff',
  light:   '#f4f6fa',
  grey:    '#e0e3eb',
  muted:   '#888',
  userBg:  '#0f3460',
  aiBg:    '#f0f2ff',
  aiText:  '#1a1a2e',
};

/* ── Role-specific content ───────────────────────────────────────── */
const ROLE_CONFIG = {
  EMPLOYEE: {
    badge: '👤 Employee',
    badgeColor: '#28a745',
    welcome:
      "Hello! I'm your personal SWMS assistant. I can help you with your tasks, attendance history, and performance insights. What would you like to know?",
    suggestions: [
      'What are my pending tasks?',
      'Show my attendance this month',
      'Which of my tasks are overdue?',
      'Give me a weekly summary',
    ],
  },
  MANAGER: {
    badge: '🏢 Manager',
    badgeColor: '#fd7e14',
    welcome:
      "Hello! I'm your team management assistant. I can provide insights on team workload, task progress, deadlines, and attendance. How can I help?",
    suggestions: [
      'How is my team performing?',
      'Which tasks are overdue?',
      'Show team attendance today',
      'Who has the most pending tasks?',
    ],
  },
  ADMIN: {
    badge: '🔑 Admin',
    badgeColor: '#e94560',
    welcome:
      "Hello! I'm your organisational intelligence assistant with full access to workforce analytics. What would you like to analyse?",
    suggestions: [
      'Show workforce statistics',
      'What is the task completion rate?',
      'Give me a productivity overview',
      'How many employees are present today?',
    ],
  },
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function timestamp() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function makeMsg(type, text) {
  return { id: Date.now() + Math.random(), type, text, time: timestamp() };
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function AIChatWidget() {
  const { user } = useAuth();

  const [isOpen,          setIsOpen]          = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [conversationId,  setConversationId]  = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const role       = user?.role ?? 'EMPLOYEE';
  const config     = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE;

  /* ── Initialise welcome message when chat opens ──────────────── */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([makeMsg('ai', config.welcome)]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]); // eslint-disable-line

  /* ── Auto-scroll ─────────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ─────────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || isLoading) return;

      setInput('');
      setShowSuggestions(false);

      // Append the user bubble immediately
      setMessages((prev) => [...prev, makeMsg('user', trimmed)]);
      setIsLoading(true);

      try {
        const { data } = await api.post('/api/ai/chat', {
          message:        trimmed,
          conversationId: conversationId,
        });

        setConversationId(data.conversationId);
        setMessages((prev) => [...prev, makeMsg('ai', data.reply)]);
      } catch (err) {
        const errText =
          err.response?.data?.message ??
          'Sorry, the AI assistant is temporarily unavailable. Please try again.';
        setMessages((prev) => [...prev, makeMsg('error', errText)]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId]
  );

  /* ── Weekly summary ──────────────────────────────────────────── */
  const requestWeeklySummary = async () => {
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      makeMsg('user', '📊 Generate my weekly summary'),
    ]);
    setIsLoading(true);
    try {
      const { data } = await api.post('/api/ai/weekly-summary');
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, makeMsg('ai', data.reply)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        makeMsg('error', 'Could not generate summary. Please try again.'),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── New conversation ────────────────────────────────────────── */
  const newConversation = () => {
    setMessages([makeMsg('ai', config.welcome)]);
    setConversationId(null);
    setShowSuggestions(true);
  };

  /* ── Don't render if not logged in ──────────────────────────── */
  if (!user) return null;

  /* ── Rendering ───────────────────────────────────────────────── */
  return (
    <>
      {/* ── Chat window ─────────────────────────────────────────── */}
      {isOpen && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={styles.headerIcon}>🤖</span>
              <div>
                <div style={styles.headerTitle}>SWMS AI Assistant</div>
                <span style={{ ...styles.badge, background: config.badgeColor }}>
                  {config.badge}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={newConversation}
                title="New conversation"
                style={styles.iconBtn}
              >
                ✏️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={styles.iconBtn}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Suggested prompts (only at start) */}
            {showSuggestions && messages.length <= 1 && !isLoading && (
              <div style={styles.suggestions}>
                <div style={styles.suggestLabel}>Suggested questions:</div>
                {config.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={styles.suggestBtn}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Weekly summary bar */}
          <div style={styles.summaryBar}>
            <button
              onClick={requestWeeklySummary}
              disabled={isLoading}
              style={{
                ...styles.summaryBtn,
                opacity: isLoading ? 0.5 : 1,
                cursor:  isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              📊 Weekly Summary
            </button>
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything…"
              disabled={isLoading}
              style={styles.input}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              style={{
                ...styles.sendBtn,
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                cursor:  isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Floating action button ───────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          ...styles.fab,
          background: isOpen
            ? C.accent
            : `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
        }}
        title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function MessageBubble({ msg }) {
  const isUser  = msg.type === 'user';
  const isError = msg.type === 'error';

  return (
    <div
      style={{
        display:       'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom:  10,
      }}
    >
      <div
        style={{
          maxWidth:     '80%',
          padding:      '10px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background:   isError ? '#fff3f3' : isUser ? C.userBg : C.aiBg,
          color:        isError ? '#c00' : isUser ? C.white : C.aiText,
          fontSize:     14,
          lineHeight:   1.5,
          boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
          border:       isError ? '1px solid #f5c6cb' : 'none',
          whiteSpace:   'pre-wrap',
          wordBreak:    'break-word',
        }}
      >
        {msg.text}
        <div
          style={{
            fontSize:   10,
            marginTop:   4,
            opacity:    0.6,
            textAlign:  isUser ? 'right' : 'left',
          }}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px' }}>
      <div style={styles.typingDot(0)} />
      <div style={styles.typingDot(0.2)} />
      <div style={styles.typingDot(0.4)} />
      <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>
        AI is thinking…
      </span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = {
  fab: {
    position:     'fixed',
    bottom:       30,
    right:        30,
    width:        58,
    height:       58,
    borderRadius: '50%',
    border:       'none',
    fontSize:     24,
    cursor:       'pointer',
    zIndex:       9999,
    boxShadow:    '0 4px 20px rgba(15,52,96,0.4)',
    transition:   'all 0.25s ease',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    color:        '#fff',
  },

  window: {
    position:     'fixed',
    bottom:       100,
    right:        30,
    width:        390,
    height:       560,
    borderRadius: 20,
    boxShadow:    '0 12px 48px rgba(15,52,96,0.25)',
    background:   C.white,
    zIndex:       9998,
    display:      'flex',
    flexDirection: 'column',
    overflow:     'hidden',
    animation:    'slideUp 0.25s ease',
  },

  header: {
    background:     `linear-gradient(135deg, ${C.deep}, ${C.navy})`,
    padding:        '14px 18px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  headerIcon: { fontSize: 26 },

  headerTitle: {
    color:      C.white,
    fontWeight: 700,
    fontSize:   15,
  },

  badge: {
    display:      'inline-block',
    fontSize:     10,
    fontWeight:   600,
    color:        '#fff',
    padding:      '2px 8px',
    borderRadius: 20,
    marginTop:    2,
  },

  iconBtn: {
    background:   'rgba(255,255,255,0.15)',
    border:       'none',
    borderRadius: '50%',
    width:        30,
    height:       30,
    cursor:       'pointer',
    color:        C.white,
    fontSize:     13,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
  },

  messages: {
    flex:       1,
    padding:    '16px 14px 8px',
    overflowY:  'auto',
    background: C.light,
  },

  suggestions: {
    marginTop: 12,
  },

  suggestLabel: {
    fontSize:     11,
    color:        C.muted,
    marginBottom: 6,
    fontWeight:   600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  suggestBtn: {
    display:      'block',
    width:        '100%',
    textAlign:    'left',
    background:   C.white,
    border:       `1px solid ${C.grey}`,
    borderRadius: 10,
    padding:      '8px 12px',
    marginBottom: 6,
    cursor:       'pointer',
    fontSize:     13,
    color:        C.navy,
    transition:   'background 0.15s',
  },

  summaryBar: {
    padding:    '6px 14px',
    background: C.white,
    borderTop:  `1px solid ${C.grey}`,
  },

  summaryBtn: {
    background:   'none',
    border:       `1px dashed ${C.navy}`,
    borderRadius: 8,
    padding:      '5px 14px',
    fontSize:     12,
    color:        C.navy,
    fontWeight:   600,
    width:        '100%',
  },

  inputRow: {
    display:    'flex',
    padding:    '10px 14px',
    gap:        8,
    background: C.white,
    borderTop:  `1px solid ${C.grey}`,
  },

  input: {
    flex:         1,
    border:       `1.5px solid ${C.grey}`,
    borderRadius: 24,
    padding:      '8px 16px',
    fontSize:     14,
    outline:      'none',
    color:        C.aiText,
    background:   C.light,
  },

  sendBtn: {
    background:   C.navy,
    color:        C.white,
    border:       'none',
    borderRadius: '50%',
    width:        40,
    height:       40,
    fontSize:     16,
    cursor:       'pointer',
    flexShrink:   0,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
  },

  typingDot: (delay) => ({
    width:           8,
    height:          8,
    borderRadius:   '50%',
    background:      C.navy,
    opacity:         0.5,
    animation:       `bounce 1s ${delay}s infinite ease-in-out`,
  }),
};
