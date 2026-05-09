// components/Dock.tsx
'use client';

import { useOSStore } from '@/store/useOSStore';
import { APPS, DOCK_APPS } from '@/config/apps';

export default function Dock() {
  const { windows, accentColor, openApp } = useOSStore();

  const dockApps = DOCK_APPS
    .map(id => APPS.find(a => a.id === id))
    .filter(Boolean) as typeof APPS;

  const isOpen = (appId: string) => windows.some(w => w.appId === appId);

  return (
    <div style={{
      position: 'absolute',
      bottom: 76, // Raised higher to float above the taskbar
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 10,
      padding: '10px',
      background: 'rgba(15, 18, 25, 0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 24,
      zIndex: 100,
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    }}>
      <style>{`
        .dock-item { transition: all 0.3s cubic-bezier(0.2, 1, 0.2, 1); }
        .dock-item:hover { transform: translateY(-10px) scale(1.2); background: rgba(255,255,255,0.1) !important; }
        .dock-item:active { transform: translateY(-2px) scale(1.0); }
      `}</style>

      {dockApps.map(app => (
        <button
          key={app.id}
          className="dock-item"
          onClick={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
          style={{
            width: 48, height: 48,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: 'none',
            fontSize: 26,
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {app.emoji}
          {isOpen(app.id) && (
            <div style={{
              position: 'absolute',
              bottom: 4, width: 4, height: 4,
              borderRadius: '50%',
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}`
            }} />
          )}
        </button>
      ))}
    </div>
  );
}
