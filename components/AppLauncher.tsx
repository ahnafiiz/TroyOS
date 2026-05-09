// components/AppLauncher.tsx
'use client';

import { useOSStore } from '@/store/useOSStore';
import { APPS } from '@/config/apps';

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function AppLauncher() {
  const { accentColor, openApp, toggleLauncher } = useOSStore();

  const handleOpenApp = (app: typeof APPS[0]) => {
    openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight);
    // Launcher auto-closes based on your store logic
  };

  return (
    <>
      {/* ── BACKGROUND CLICK-AWAY OVERLAY ───────────── */}
      <div
        onClick={toggleLauncher}
        style={{ position: 'absolute', inset: 0, zIndex: 148 }}
      />

      {/* ── LAUNCHER PANEL ──────────────────────────── */}
      <div
        className="launcher-enter"
        style={{
          position: 'absolute',
          // ── POSITIONING: Pin to bottom-left above the start button ──
          bottom: 76, 
          left: 12,
          // ─────────────────────────────────────────────────────────────
          zIndex: 149,
          background: 'rgba(15, 18, 25, 0.75)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '24px',
          width: 440,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}20`,
          fontFamily: GEIST_FONT,
        }}
      >
        <style>{`
          @keyframes launcherEnter {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .launcher-enter {
            animation: launcherEnter 0.3s cubic-bezier(0.2, 1, 0.2, 1) forwards;
          }
          .app-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
          .app-card:hover { transform: translateY(-4px); }
          .app-card:active { transform: scale(0.95); }
        `}</style>

        <p style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 800,
          letterSpacing: '0.2em',
          textAlign: 'center',
          marginBottom: 24,
          textTransform: 'uppercase',
        }}>
          Application Terminal
        </p>

        {/* ── APP GRID ────────────────────────────────── */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 12 
        }}>
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => handleOpenApp(app)}
              className="app-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '16px 12px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.08)';
                el.style.borderColor = app.color + '66';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{ 
                fontSize: 32, 
                filter: `drop-shadow(0 4px 12px ${app.color}44)` 
              }}>
                {app.emoji}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ 
                  fontSize: 12, 
                  color: '#fff', 
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}>
                  {app.name}
                </span>
                <span style={{ 
                  fontSize: 9, 
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 500,
                  lineHeight: 1.2
                }}>
                  {app.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ── FOOTER STATS ────────────────────────────── */}
        <div style={{ 
          marginTop: 24, 
          paddingTop: 16, 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {APPS.length} SYSTEMS ONLINE
          </span>
        </div>
      </div>
    </>
  );
}
