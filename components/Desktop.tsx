// components/Desktop.tsx
'use client';

import { useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import { GAMES } from '@/config/games'; // Imported the games database!
import Window from './Window';
import Taskbar from './Taskbar';
import Dock from './Dock';
import AppLauncher from './AppLauncher';

// Native local app imports
import GamingHub from './apps/GamingHub';
import Terminal from './apps/Terminal';
import AIAssistant from './apps/AIAssistant';

/**
 * ── DYNAMIC CONTENT LOADER ──────────────────────────────────────────
 * Determines what goes inside a window when opened.
 * Supports both standard App configs and Gaming Hub console games.
 * ────────────────────────────────────────────────────────────────────
 */
function getAppContent(appId: string) {
  // 1. Try to find a standard desktop app config first
  const app = APPS.find(a => a.id === appId);
  
  // 2. If not found, check if it's a game from the Gaming Hub database
  const game = GAMES.find(g => g.id.toString() === appId);

  // 3. Resolve the target URL if either configuration has one
  const targetUrl = app?.url || game?.url;

  // 4. IFRAME HANDLER (For Games & Browser Workspace)
  if (targetUrl) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#fff' }}>
        <iframe 
          src={targetUrl} 
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            background: '#fff'
          }} 
          title={app?.name || game?.name || 'Workspace Window'}
          allow="fullscreen; pointer-lock; autoplay" 
        />
      </div>
    );
  }

  // 5. NATIVE ROUTER (For local components that don't use URLs)
  switch (appId) {
    case 'gaming':   return <GamingHub />;
    case 'terminal': return <Terminal />;
    case 'ai':       return <AIAssistant />;
    default: return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        gap: 10, 
        background: 'rgba(10, 12, 18, 0.4)' 
      }}>
        <span style={{ fontSize: 40 }}>{app?.emoji || game?.emoji || '📦'}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Component link missing
        </span>
      </div>
    );
  }
}

export default function Desktop() {
  const { 
    windows, wallpaperIndex, launcherOpen, notifications, currentTime, 
    setTime, addNotification, openApp, removeNotification 
  } = useOSStore();

  const wallpaper = WALLPAPERS[wallpaperIndex];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  useEffect(() => {
    const timer = setTimeout(() => addNotification('Troy OS V2.0.1'), 1200);
    return () => clearTimeout(timer);
  }, [addNotification]);

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ 
      position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
      fontFamily: 'var(--font-geist-sans), sans-serif', color: '#fff'
    }}>
      <style>{`
        @keyframes gridPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.2, 1, 0.2, 1); }
        @keyframes notifSlide { 
          from { transform: translateX(120%) scale(0.9); opacity: 0; } 
          to { transform: translateX(0) scale(1); opacity: 1; } 
        }
        .desktop-icon:hover { background: rgba(255, 255, 255, 0.1) !important; transform: translateY(-2px); }
      `}</style>

      {/* Wallpaper */}
      <div style={{
        position: 'absolute', inset: 0, background: wallpaper.background,
        backgroundImage: `linear-gradient(${wallpaper.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${wallpaper.gridColor} 1px, transparent 1px)`,
        backgroundSize: '60px 60px', animation: 'gridPulse 8s ease infinite',
      }} />

      {/* Clock Widget */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', zIndex: 50, pointerEvents: 'none' }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9 }}>{timeStr}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{dateStr}</div>
      </div>

      {/* Desktop Icons */}
      <div style={{ position: 'absolute', top: 30, left: 30, display: 'flex', flexDirection: 'column', gap: 15, zIndex: 40 }}>
        {APPS.filter(a => a.category !== 'Game').map(app => (
          <div key={app.id} 
               className="desktop-icon"
               onDoubleClick={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: '16px', transition: 'all 0.3s ease', width: '80px' }}>
            <div style={{ fontSize: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{app.emoji}</div>
            <span style={{ fontSize: 11, fontWeight: 600, marginTop: 8 }}>{app.name}</span>
          </div>
        ))}
      </div>

      {/* Windows Layer */}
      {windows.map(win => (
        <Window key={win.id} {...win}>
          {getAppContent(win.appId)}
        </Window>
      ))}

      {/* Launcher & Notifications */}
      {launcherOpen && <AppLauncher />}
      
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
               style={{ background: 'rgba(15, 18, 25, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer', minWidth: '260px' }}>
            <div style={{ fontSize: '20px' }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>System</div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      <Dock />
      <Taskbar />
    </div>
  );
}