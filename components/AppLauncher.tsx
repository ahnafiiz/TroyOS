'use client';

import React, { useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { APPS } from '@/config/apps';

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function AppLauncher() {
  const { openApp, toggleLauncher, launcherOpen, currentTime } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenApp = (app: typeof APPS[0]) => {
    openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight);
    toggleLauncher();
    setSearchQuery(''); // Reset search on close
  };

  // Filter apps based on search query
  const filteredApps = useMemo(() => {
    return APPS.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  if (!launcherOpen) return null;

  // Format system panel clock
  const timeString = (currentTime || new Date()).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <>
      {/* Background click-away overlay with a buttery soft transition backdrop */}
      <div
        onClick={toggleLauncher}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 9998, 
          background: 'rgba(4, 5, 10, 0.2)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Launcher Panel Frame */}
      <div
        className="launcher-panel"
        onClick={(e) => e.stopPropagation()} 
        style={{
          position: 'absolute',
          bottom: 84, 
          left: 24, 
          zIndex: 9999, 
          background: 'rgba(13, 16, 24, 0.72)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 24,
          width: 580,
          height: 440,
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          fontFamily: GEIST_FONT,
        }}
      >
        <style>{`
          @keyframes launcherReveal {
            from { opacity: 0; transform: translateY(20px) scale(0.96); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          .launcher-panel {
            animation: launcherReveal 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.25);
          }
          .app-grid-card { 
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.03);
          }
          .app-grid-card:hover { 
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--hover-border) !important;
            box-shadow: 0 10px 24px -8px var(--hover-shadow), inset 0 1px 0 rgba(255,255,255,0.05);
          }
          .app-grid-card:hover .app-icon-wrapper {
            transform: scale(1.06) translateY(-2px);
          }
          .app-grid-card:active { 
            transform: scale(0.97); 
          }
          /* Custom track scrollbar styling */
          .launcher-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .launcher-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .launcher-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .launcher-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>

        {/* LEFT COMPARTMENT: Sidebar HUD metrics */}
        <div style={{
          width: 170,
          background: 'rgba(255, 255, 255, 0.015)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* User Account / Identity Signature */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                C
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Commander</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Session Active</span>
              </div>
            </div>

            {/* Live Clock HUD element */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 26, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {timeString}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                System Node Time
              </span>
            </div>
          </div>

          {/* Core Version footer identifier badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ 
              alignSelf: 'flex-start',
              padding: '4px 8px', 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: 6,
              fontSize: 8,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.04em'
            }}>
              TROY OS v2.0.6
            </div>
          </div>
        </div>

        {/* RIGHT COMPARTMENT: Search & Application Grid Workspace */}
        <div style={{
          flex: 1,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Integrated Dynamic Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interfaces..."
              className="search-input"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '10px 14px 10px 38px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          {/* Applications Grid Scroller wrapper container */}
          <div 
            className="launcher-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {filteredApps.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize: 24 }}>📦</span>
                <span style={{ fontSize: 11, fontWeight: 500 }}>No matching interfaces active</span>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 8 
              }}>
                {filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    className="app-grid-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px',
                      borderRadius: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      outline: 'none',
                      '--hover-border': `${app.color}3A`,
                      '--hover-shadow': `${app.color}15`
                    } as React.CSSProperties}
                  >
                    {/* Glowing contextual layout wrapper around the App Emoji graphic */}
                    <div 
                      className="app-icon-wrapper"
                      style={{ 
                        fontSize: 22, 
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 8px 16px -4px ${app.color}18`,
                        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                    >
                      {app.emoji}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
                      <span style={{ 
                        fontSize: 11.5, 
                        color: '#fff', 
                        fontWeight: 600,
                        letterSpacing: '-0.005em'
                      }}>
                        {app.name}
                      </span>
                      <span style={{ 
                        fontSize: 8.5, 
                        color: 'rgba(255,255,255,0.38)',
                        fontWeight: 400,
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {app.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer telemetry operational line indicator context */}
          <div style={{ 
            paddingTop: 10, 
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {filteredApps.length === APPS.length ? 'All systems nominal' : `Found ${filteredApps.length} results`}
            </span>
            <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.04em' }}>
              {APPS?.length || 0} MODULES LOADED
            </span>
          </div>
        </div>
      </div>
    </>
  );
}