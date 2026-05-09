// components/Taskbar.tsx
'use client';

import { useOSStore } from '@/store/useOSStore';

const MODERN_FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';

export default function Taskbar() {
  const { windows, activeWindowId, accentColor, launcherOpen,
          toggleLauncher, focusWindow } = useOSStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: 12, left: 12, right: 12, // Floating margin
      height: 52,
      background: 'rgba(15, 18, 25, 0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', // Rounded corners for premium feel
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: 6,
      zIndex: 1000,
      fontFamily: MODERN_FONT,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <style>{`
        .task-btn:hover { background: rgba(255, 255, 255, 0.1) !important; transform: scale(1.02); }
        .task-btn:active { transform: scale(0.95); }
      `}</style>

      {/* App Launcher button */}
      <button
        className="task-btn"
        onClick={toggleLauncher}
        style={{
          width: 40, height: 40,
          borderRadius: 12,
          background: launcherOpen ? `${accentColor}44` : 'rgba(255,255,255,0.05)',
          border: 'none',
          color: launcherOpen ? '#fff' : 'rgba(255,255,255,0.6)',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span style={{ marginTop: -2 }}>⊞</span>
      </button>

      {/* Subtle Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />

      {/* Open window buttons */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {windows.map(win => (
          <button
            key={win.id}
            className="task-btn"
            onClick={() => focusWindow(win.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 14px',
              height: 40,
              borderRadius: 12,
              background: activeWindowId === win.id
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: 'none',
              color: activeWindowId === win.id ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              minWidth: 100,
              maxWidth: 160,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontSize: 16 }}>{win.emoji}</span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em'
            }}>
              {win.title}
            </span>

            {/* Active Indicator Bar (bottom) */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: '20%', right: '20%',
              height: 3,
              background: activeWindowId === win.id ? accentColor : 'transparent',
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s ease',
              boxShadow: activeWindowId === win.id ? `0 0 10px ${accentColor}` : 'none'
            }} />
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* OS Branding */}
      <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 800, 
          color: 'rgba(255,255,255,0.2)', 
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}>
          TROY OS
        </span>
      </div>
    </div>
  );
}
