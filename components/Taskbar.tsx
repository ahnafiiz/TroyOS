'use client';

import { useOSStore } from '@/store/useOSStore';

const MODERN_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function Taskbar() {
  const { windows, activeWindowId, accentColor, launcherOpen,
          toggleLauncher, focusWindow } = useOSStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: 16, left: 16, right: 16, // Adjusted float spacing
      height: 48, // Slightly more compact profile
      background: 'rgba(10, 12, 18, 0.45)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: 4,
      zIndex: 1000,
      fontFamily: MODERN_FONT,
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      <style>{`
        .task-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .task-btn:hover { 
          background: rgba(255, 255, 255, 0.05) !important; 
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .task-btn:active { 
          transform: scale(0.96); 
        }
        .launcher-active {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>

      {/* App Launcher Button with custom geometric icon (no generic emojis/text) */}
      <button
        className={`task-btn ${launcherOpen ? 'launcher-active' : ''}`}
        onClick={toggleLauncher}
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 3,
          width: 13,
          height: 13,
        }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ 
              background: launcherOpen ? accentColor : 'rgba(255,255,255,0.7)',
              borderRadius: '2.5px',
              transition: 'background 0.2s',
              boxShadow: launcherOpen ? `0 0 8px ${accentColor}` : 'none'
            }} />
          ))}
        </div>
      </button>

      {/* Elegant, thin vertical divider */}
      <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

      {/* Active Application Window Tabs */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
        {windows.map(win => {
          const isActive = activeWindowId === win.id;
          return (
            <button
              key={win.id}
              className="task-btn"
              onClick={() => focusWindow(win.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                height: 36,
                borderRadius: 10,
                background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent'}`,
                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                minWidth: 110,
                maxWidth: 150,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{win.emoji}</span>
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
                transition: 'color 0.2s'
              }}>
                {win.title}
              </span>

              {/* Minimalist edge-lit active indicator */}
              <div style={{
                position: 'absolute',
                bottom: -1, 
                left: '20%', 
                right: '20%',
                height: 2,
                background: isActive ? accentColor : 'transparent',
                borderRadius: '99px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? `0 0 10px ${accentColor}, 0 -1px 3px ${accentColor}` : 'none'
              }} />
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Structural Minimalist Branding */}
      <div style={{ paddingRight: 12, display: 'flex', alignItems: 'center', height: '100%' }}>
        <span style={{ 
          fontSize: 9, 
          fontWeight: 700, 
          color: 'rgba(255,255,255,0.25)', 
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          NEXUS OS
        </span>
      </div>
    </div>
  );
}