// components/apps/AIAssistant.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';

export default function AIAssistant() {
  const { aiMessages, accentColor, addAIMessage } = useOSStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    addAIMessage('user', text);
    setInput('');
    setLoading(true);

    try {
      // NOTE: Calling Anthropic directly from the browser will trigger CORS errors.
      // Usually, you'd route this through an /api/chat Next.js route.
      const res = await fetch('/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      addAIMessage('ai', data.reply ?? 'Neural link interrupted.');
    } catch {
      addAIMessage('ai', 'Connection error. Check your API bridge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'rgba(10, 12, 18, 0.4)', // Glass background
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif'
    }}>
      {/* ── HEADER ──────────────────────────────────────── */}
      <div style={{ 
        padding: '14px 18px', 
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        flexShrink: 0 
      }}>
        <div style={{ 
          width: 38, height: 38, borderRadius: 12, 
          background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}11)`, 
          border: `1px solid ${accentColor}44`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: 20,
          boxShadow: `0 0 15px ${accentColor}33`
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>TROY AI</div>
          <div style={{ fontSize: 10, color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ animation: 'pulse 2s infinite' }}>●</span> Neural Link Active
          </div>
        </div>
      </div>

      {/* ── MESSAGES ────────────────────────────────────── */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 16 
      }}>
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        
        {aiMessages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: 12, 
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', 
            alignItems: 'flex-end' 
          }}>
            <div style={{ 
              background: msg.role === 'ai' ? 'rgba(255,255,255,0.05)' : `${accentColor}22`, 
              border: `1px solid ${msg.role === 'ai' ? 'rgba(255,255,255,0.1)' : `${accentColor}44`}`, 
              borderRadius: msg.role === 'ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px', 
              padding: '12px 16px', 
              fontSize: 13, 
              color: 'rgba(255,255,255,0.9)', 
              lineHeight: 1.5, 
              maxWidth: '85%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
             <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.05em' }}>
              TROY IS THINKING...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ───────────────────────────────────────── */}
      <div style={{ 
        padding: '18px', 
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        flexShrink: 0 
      }}>
        <div style={{ 
          display: 'flex', 
          gap: 10, 
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '4px'
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a command..."
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              padding: '10px 14px', 
              color: '#fff', 
              fontSize: 13, 
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button 
            onClick={sendMessage} 
            disabled={loading}
            style={{ 
              background: accentColor, 
              border: 'none', 
              color: '#fff', 
              borderRadius: 10, 
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer', 
              opacity: loading ? 0.5 : 1,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
