'use client';

import { useOSStore } from '@/store/useOSStore';
import { APPS, DOCK_APPS } from '@/config/apps';

interface DockProps {
  position?: 'center' | 'left' | 'right';
}

export default function Dock({ position = 'center' }: DockProps) {
  const { windows, accentColor, openApp } = useOSStore();

  const dockApps = DOCK_APPS
    .map(id => APPS.find(a => a.id === id))
    .filter(Boolean) as typeof APPS;

  const isOpen = (appId: string) => windows.some(w => w.appId === appId);

  // Dynamic positioning styles mapped to prevent alignment clipping
  const getDockPositionStyles = () => {
    switch (position) {
      case 'left':
        return {
          left: 24,
          transform: 'none',
        };
      case 'right':
        return {
          right: 24,
          transform: 'none',
        };
      case 'center':
    default:
        return {
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 72, // Suspends dock cleanly over the unified taskbar
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px',
      background: 'rgba(10, 12, 18, 0.45)',
      backdropFilter: 'blur(32px) saturate(190%)',
      WebkitBackdropFilter: 'blur(32px) saturate(190%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 22,
      zIndex: 100,
      boxShadow: '0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
      transition: 'all 0.40s cubic-bezier(0.16, 1, 0.3, 1)',
      ...getDockPositionStyles()
    }}>
      <style>{`
        .dock-item { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .dock-item:hover { 
          transform: translateY(-8px) scale(1.12); 
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
        .dock-item:active { transform: translateY(-2px) scale(1.0); }
      `}</style>

      {dockApps.map((app, idx) => (
        <div key={app.id} style={{ display: 'flex', alignItems: 'center' }}>
          {idx === 2 && (
            <div style={{ 
              width: 1, 
              height: 28, 
              background: 'rgba(255,255,255,0.08)', 
              margin: '0 4px',
              borderRadius: 1 
            }} />
          )}
          
          <button
            className="dock-item"
            onClick={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
            style={{
              width: 44, 
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.03)',
              fontSize: 22,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {app.emoji}
            {isOpen(app.id) && (
              <div style={{
                position: 'absolute',
                bottom: 3, 
                width: 3, 
                height: 3,
                borderRadius: '50%',
                background: accentColor,
                boxShadow: `0 0 6px ${accentColor}`
              }} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}