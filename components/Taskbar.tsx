'use client';

import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';

export default function Taskbar() {
  const store = useOSStore();
  const openWindows = store.windows || [];
  const activeWindowId = store.activeWindowId;
  const toggleMinimize = store.toggleMinimize;
  const focusWindow = store.focusWindow;

  // Real-time systemic clock hook
  const [time, setTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const systemApps = [
    { id: 'browser', name: 'Browser', emoji: '🌐', color: '#3b82f6' },
    { id: 'notes', name: 'Notes', emoji: '📝', color: '#f59e0b' },
    { id: 'assistant', name: 'AI Assistant', emoji: '🤖', color: '#ec4899' },
    { id: 'gaming', name: 'Gaming Hub', emoji: '🎮', color: '#8b5cf6' },
    { id: 'files', name: 'Files', emoji: '📁', color: '#10b981' },
    { id: 'terminal', name: 'Terminal', emoji: '⌨️', color: '#6b7280' },
    { id: 'settings', name: 'Settings', emoji: '⚙️', color: '#6366f1' },
  ];

  const handleAppClick = (appId: string) => {
    const existingWindow = openWindows.find((w) => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        toggleMinimize(existingWindow.id);
      } else if (activeWindowId === existingWindow.id) {
        toggleMinimize(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
    } else {
      if (typeof store.openApp === 'function') {
        store.openApp(appId);
      }
    }
  };

  const sysBlur = store.uiBlur ?? 24;
  const sysOpacity = store.uiOpacity ?? 0.75;
  const accentColor = store.accentColor || '#3b82f6';
  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 54,
        background: `linear-gradient(to top, rgba(10, 13, 22, ${sysOpacity}), rgba(13, 17, 28, ${sysOpacity - 0.05}))`,
        backdropFilter: `blur(${sysBlur}px) saturate(160%)`,
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 9999, // Floating on top of normal layers
        justifyContent: 'space-between',
        userSelect: 'none',
        fontFamily: systemFontFamily,
      }}
    >
      <style>{`
        .tb-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tb-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .tb-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .app-node {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .app-node:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-3px) scale(1.04);
        }
        .app-node:hover .app-icon {
          transform: scale(1.1);
        }
        .app-node:active {
          transform: translateY(0) scale(0.94);
        }
      `}</style>

      {/* LEFT: Core Start Menu Trigger */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="tb-btn"
          onClick={store.toggleLauncher} // FIXED: Attached state toggle function
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 15,
            color: '#fff',
            textShadow: `0 0 10px ${accentColor}aa`,
          }}
        >
          ❖
        </button>
      </div>

      {/* CENTER: Dock Grid Infrastructure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '4px',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {systemApps.map((app) => {
          const runningWindow = openWindows.find((w) => w.appId === app.id);
          const isRunning = !!runningWindow;
          const isCurrentActive = runningWindow && activeWindowId === runningWindow.id;

          return (
            <div
              key={app.id}
              className="app-node"
              onClick={() => handleAppClick(app.id)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                fontSize: 21,
                background: isCurrentActive ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
                border: isCurrentActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                boxShadow: isCurrentActive ? `0 4px 15px rgba(0,0,0,0.2)` : 'none',
              }}
              title={app.name}
            >
              <span 
                className="app-icon"
                style={{ 
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: isCurrentActive ? 'drop-shadow(0 2px 8px rgba(255,255,255,0.15))' : 'none'
                }}
              >
                {app.emoji}
              </span>

              {isRunning && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    height: 3,
                    borderRadius: 99,
                    background: isCurrentActive ? app.color : 'rgba(255, 255, 255, 0.4)',
                    width: isCurrentActive ? 18 : 5,
                    boxShadow: isCurrentActive ? `0 0 10px ${app.color}` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: High-End Polished System Tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.08em',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.04)'
          }}
        >
          TROY OS
        </div>

        <div
          className="tb-btn"
          style={{
            height: 34,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: '#e2e8f0',
            letterSpacing: '0.02em',
            cursor: 'pointer',
          }}
        >
          {time || '--:--'}
        </div>
      </div>
    </div>
  );
}