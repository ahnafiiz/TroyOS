'use client';

import { useOSStore } from '@/store/useOSStore';
import { APPS } from '@/config/apps';

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function AppLauncher() {
  const { accentColor, openApp, toggleLauncher } = useOSStore();

  const handleOpenApp = (app: typeof APPS[0]) => {
    openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight);
  };

  return (
    <>
      {/* Background click-away overlay with a subtle vignette dim */}
      <div
        onClick={toggleLauncher}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 148,
          background: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Launcher Panel */}
      <div
        className="launcher-enter"
        style={{
          position: 'absolute',
          bottom: 76, 
          left: 16, // Aligned perfectly with our updated Taskbar
          zIndex: 149,
          background: 'rgba(10, 12, 18, 0.55)',
          backdropFilter: 'blur(36px) saturate(180%)',
          WebkitBackdropFilter: 'blur(36px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: 24,
          width: 420,
          boxShadow: `0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.15)`,
          fontFamily: GEIST_FONT,
        }}
      >
        <style>{`
          @keyframes launcherEnter {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .launcher-enter {
            animation: launcherEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .app-card { 
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); 
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
          }
          .app-card:hover { 
            transform: translateY(-2px); 
            background: rgba(255, 255, 255, 0.06);
            border-color: var(--hover-color) !important;
            box-shadow: 0 8px 20px -4px var(--hover-glow);
          }
          .app-card:active { 
            transform: scale(0.96) translateY(0); 
          }
        `}</style>

        <p style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 800,
          letterSpacing: '0.25em',
          textAlign: 'center',
          marginBottom: 20,
          textTransform: 'uppercase',
        }}>
          SYSTEM TERMINAL
        </p>

        {/* Dynamic App Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 10 
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
                padding: '16px 10px',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'center',
                outline: 'none',
                // Leveraging CSS variables to drive styling seamlessly in hover classes
                ['--hover-color' as any]: `${app.color}44`,
                ['--hover-glow' as any]: `${app.color}22`
              }}
            >
              <div style={{ 
                fontSize: 30, 
                filter: `drop-shadow(0 6px 12px ${app.color}35)` 
              }}>
                {app.emoji}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                <span style={{ 
                  fontSize: 11, 
                  color: '#fff', 
                  fontWeight: 600,
                  letterSpacing: '-0.01em'
                }}>
                  {app.name}
                </span>
                <span style={{ 
                  fontSize: 8, 
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {app.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info line */}
        <div style={{ 
          marginTop: 20, 
          paddingTop: 14, 
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.1em' }}>
            {APPS.length} INTERFACES READY
          </span>
        </div>
      </div>
    </>
  );
}