'use client';

import { useOSStore } from '@/store/useOSStore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from 'next/image';
import LockIcon from '@/public/icons/sui/lock.svg';


export default function FrozenScreen() {
  const logout = useOSStore((s) => s.logout);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(4, 10, 24, 0.85)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Inter", sans-serif',
    }}>
      <style>{`
        @keyframes frozenPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.04); }
        }
        @keyframes frozenFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        fontSize: 64, marginBottom: 24,
        animation: 'frozenPulse 3s ease-in-out infinite',
        filter: 'drop-shadow(0 0 24px rgba(96,165,250,0.6))',
      }}>
      <LockIcon width={64} height={64} />
      </div>

      <div style={{
        background: 'rgba(11, 18, 36, 0.92)',
        border: '1px solid rgba(96,165,250,0.25)',
        borderRadius: 20,
        padding: '36px 48px',
        textAlign: 'center',
        maxWidth: 420,
        boxShadow: '0 0 60px rgba(96,165,250,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'frozenFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <h1 style={{
          margin: '0 0 8px',
          fontSize: 22, fontWeight: 700,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '-0.025em',
        }}>
          Account Frozen
        </h1>
        <p style={{
          margin: '0 0 28px',
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6,
        }}>
          Your account has been temporarily frozen by an administrator.
          You cannot access Troy OS until your account is unfrozen.
          Contact an admin to restore access.
        </p>
        <button
          onClick={() => logout()}
          style={{
            width: '100%', padding: '11px 0',
            borderRadius: 10,
            background: 'rgba(96,165,250,0.12)',
            border: '1px solid rgba(96,165,250,0.28)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.12)')}
        >
          Sign Out
        </button>
      </div>

      <p style={{
        marginTop: 20, fontSize: 10, fontWeight: 600,
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Troy OS · Account Frozen
      </p>
    </div>
  );
}