'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';

export default function AIAssistant() {
  const store = useOSStore();
  
  const aiMessages = useMemo(() => store.aiMessages ?? [], [store.aiMessages]);
  const accentColor = store.accentColor ?? '#3b82f6';
  const addAIMessage = store.addAIMessage;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (typeof addAIMessage !== 'function') {
      console.error("AIAssistant: 'addAIMessage' was not found in useOSStore.", store);
      return;
    }

    addAIMessage('user', text);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...aiMessages.map((m) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: text },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? 'AI interrupted';
      addAIMessage('assistant', reply);
    } catch {
      addAIMessage('assistant', 'TS api keys cost too much man :wilted_rose:');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 12, 18, 0.4)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}11)`,
            border: `1px solid ${accentColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: `0 0 15px ${accentColor}33`,
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            TROY AI
          </div>
          <div style={{ fontSize: 10, color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ animation: 'pulse 2s infinite' }}>●</span> Neural Link Active
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {aiMessages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, opacity: 0.4, paddingTop: 40,
          }}>
            <div style={{ fontSize: 32 }}>🤖</div>
            <div style={{ fontSize: 12, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              TROY is ready
            </div>
          </div>
        )}

        {aiMessages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
          }}>
            <div style={{
              background: msg.role === 'assistant' ? 'rgba(255,255,255,0.05)' : `${accentColor}22`,
              border: `1px solid ${msg.role === 'assistant' ? 'rgba(255,255,255,0.1)' : `${accentColor}44`}`,
              borderRadius: msg.role === 'assistant' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
              padding: '12px 16px',
              fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6,
              maxWidth: '85%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: accentColor, opacity: 0.7,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{
        padding: '18px',
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14, padding: '4px',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Type a command..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              padding: '10px 14px', color: '#fff', fontSize: 13,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              background: accentColor, border: 'none', color: '#fff',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'transform 0.15s, opacity 0.15s',
              fontSize: 16, flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}