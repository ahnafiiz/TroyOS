'use client';

import React, { useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { APPS } from '@/config/apps';

export default function AppLauncher() {
  const { openApp, toggleLauncher, launcherOpen, currentTime, launcherPosition, taskbarHeight, launcherOpacity } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenApp = (app: typeof APPS[0]) => {
    openApp(app.id);
    toggleLauncher();
    setSearchQuery('');
  };

  const filteredApps = useMemo(() =>
    APPS.filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [searchQuery]);

  if (!launcherOpen) return null;

  const currentTimeValue = currentTime ? new Date(currentTime) : new Date();
  const timeString = currentTimeValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dockH = (taskbarHeight ?? 54) + 12;

  // Compute panel position
  const pos: React.CSSProperties = (() => {
    switch (launcherPosition) {
      case 'bottom-right': return { bottom: dockH, right: 24 };
      case 'center':       return { bottom: dockH, left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':     return { top: 24, left: 24 };
      default:             return { bottom: dockH, left: 24 };
    }
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleLauncher}
        style={{
          position: 'absolute', inset: 0,
          zIndex: 'calc(var(--z-launcher) - 1)',
          background: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="launcher-panel launcher-reveal"
        style={{
          position: 'absolute',
          ...pos,
          zIndex: 'var(--z-launcher)',
          borderRadius: 'var(--radius-xl)',
          width: 580,
          height: 440,
          display: 'flex',
          overflow: 'hidden',
          background: `rgba(10,12,18,${launcherOpacity})`,
        }}
      >
        <style>{`
          .launcher-search-input::placeholder { color: var(--text-tertiary); }
          .launcher-app-card .icon-wrapper {
            transition: transform var(--dur-fast) var(--ease-spring);
          }
          .launcher-app-card:hover .icon-wrapper {
            transform: scale(1.08) translateY(-2px);
          }
          .launcher-scroll::-webkit-scrollbar { width: 4px; }
          .launcher-scroll::-webkit-scrollbar-track { background: transparent; }
          .launcher-scroll::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        `}</style>

        {/* Left sidebar */}
        <div style={{
          width: 165,
          background: 'rgba(255,255,255,0.015)',
          borderRight: '1px solid var(--glass-border)',
          padding: '24px 20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            {/* User badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, var(--accent), var(--accent-light))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 12px var(--accent-glow-soft)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-contrast)',
                flexShrink: 0,
              }}>C</div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Commander</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>Active</div>
              </div>
            </div>

            {/* Clock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{
                fontSize: 26, fontWeight: 300,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}>{timeString}</span>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>System Time</span>
            </div>
          </div>

          {/* Version */}
          <div style={{
            alignSelf: 'flex-start',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.04em',
          }}>
            TROY OS v2.5
          </div>
        </div>

        {/* Right content */}
        <div style={{
          flex: 1, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13, color: 'var(--text-tertiary)', pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search apps…"
              className="input-base launcher-search-input"
              autoFocus
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
              }}
            />
          </div>

          {/* App grid */}
          <div className="launcher-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
            {filteredApps.length === 0 ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                color: 'var(--text-tertiary)',
              }}>
                <span style={{ fontSize: 26 }}>📦</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>No results</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
                {filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    className="app-card launcher-app-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '11px 12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      outline: 'none',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      className="icon-wrapper"
                      style={{
                        fontSize: 20, width: 40, height: 40,
                        borderRadius: 'var(--radius-sm)',
                        background: `${app.color}12`,
                        border: `1px solid ${app.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 6px 14px -4px ${app.color}18`,
                      }}
                    >{app.emoji}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.005em' }}>
                        {app.name}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {filteredApps.length === APPS.length ? 'All systems nominal' : `${filteredApps.length} result${filteredApps.length !== 1 ? 's' : ''}`}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', fontWeight: 600 }}>
              {APPS.length} modules
            </span>
          </div>
        </div>
      </div>
    </>
  );
}