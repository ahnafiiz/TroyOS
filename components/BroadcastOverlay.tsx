'use client';

import { useEffect } from 'react';
import { useOSStore, BroadcastMessage } from '@/store/useOSStore';

const ROLE_COLORS: Record<string, string> = {
  owner:     '#f59e0b',
  admin:     '#ef4444',
  moderator: '#a855f7',
  user:      '#10b981',
};

function BroadcastToast({ msg }: { msg: BroadcastMessage }) {
  const dismissBroadcast = useOSStore((s) => s.dismissBroadcast);

  useEffect(() => {
    if (!msg.autoClose) return;
    const id = setTimeout(() => dismissBroadcast(msg.id), msg.autoClose * 1000);
    return () => clearTimeout(id);
  }, [msg.id, msg.autoClose, dismissBroadcast]);

  const roleColor = ROLE_COLORS[msg.fromRole] ?? '#10b981';

  return (
    <div style={{
      background: 'rgba(11,18,36,0.96)',
      border: `1px solid ${roleColor}44`,
      borderLeft: `3px solid ${roleColor}`,
      borderRadius: 12,
      padding: '14px 16px',
      minWidth: 300,
      maxWidth: 400,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
      animation: 'bcSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: roleColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {msg.fromRole}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            {msg.from}
          </span>
        </div>
        {msg.dismissible && (
          <button
            onClick={() => dismissBroadcast(msg.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
        {msg.message}
      </p>
      {msg.autoClose && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 2, borderRadius: '0 0 0 12px',
          background: roleColor,
          animation: `bcProgress ${msg.autoClose}s linear forwards`,
        }} />
      )}
    </div>
  );
}

export default function BroadcastOverlay() {
  const messages = useOSStore((s) => s.broadcastMessages);

  if (messages.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes bcSlideIn {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes bcProgress {
          from { width:100%; }
          to   { width:0%; }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 10,
        fontFamily: '"Inter", sans-serif',
        pointerEvents: 'none',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ pointerEvents: 'all' }}>
            <BroadcastToast msg={msg} />
          </div>
        ))}
      </div>
    </>
  );
} 