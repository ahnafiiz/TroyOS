'use client';

import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import AppIcon from '@/components/AppIcon';

export default function Taskbar() {
  const {
    windows,
    activeWindowId,
    toggleMinimize,
    focusWindow,
    openApp,
    toggleLauncher,
    taskbarHeight,
    dockStyle,
    dockPosition,
    dockAutoHide,
    iconImages,
    //accentColor,
  } = useOSStore();

  const openWindows = windows ?? [];
  const height = taskbarHeight ?? 54;

  const [time, setTime] = useState('');
  const [hidden, setHidden] = useState(false);
  const [hoverTimeout, setHoverTimeout] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────────────────────
  // LIVE CLOCK
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // AUTO HIDE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const showTimeout = setTimeout(() => setHidden(false), 0);
    if (!dockAutoHide) {
      return () => clearTimeout(showTimeout);
    }
    const hideTimeout = setTimeout(() => setHidden(true), 1800);
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [dockAutoHide]);

  const handleMouseEnter = () => {
    if (!dockAutoHide) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHidden(false);
  };

  const handleMouseLeave = () => {
    if (!dockAutoHide) return;
    const t = setTimeout(() => setHidden(true), 800);
    setHoverTimeout(t);
  };

  // ─────────────────────────────────────────────────────────────
  // SYSTEM APPS
  // Each app carries its own accent color — this drives the icon
  // tint, the active indicator dot, and the glow effect.
  // ─────────────────────────────────────────────────────────────
  const systemApps = [
    { id: 'browser',  name: 'Browser',      color: '#3b82f6' },
    { id: 'notes',    name: 'Notes',        color: '#ec4899' },
    { id: 'ai',       name: 'AI Assistant', color: '#f59e0b' },
    { id: 'games',    name: 'Gaming Hub',   color: '#8b5cf6' },
    { id: 'files',    name: 'Files',        color: '#06b6d4' },
    { id: 'terminal', name: 'Terminal',     color: '#10b981' },
    { id: 'settings', name: 'Settings',     color: '#6366f1' },
  ];

  // ─────────────────────────────────────────────────────────────
  // WINDOW / APP CONTROL
  // ─────────────────────────────────────────────────────────────
  const handleAppClick = (appId: string) => {
    const win = openWindows.find((w) => w.appId === appId);
    if (win) {
      if (win.minimized) {
        toggleMinimize(win.id);
      } else if (activeWindowId === win.id) {
        toggleMinimize(win.id);
      } else {
        focusWindow(win.id);
      }
    } else {
      openApp(appId);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // POSITION
  // ─────────────────────────────────────────────────────────────
  const isBottom = !dockPosition || dockPosition === 'bottom';
  const isTop    = dockPosition === 'top';

  // ─────────────────────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────────────────────
  const getDockBg = () => {
    switch (dockStyle) {
      case 'transparent': return 'rgba(0,0,0,0)';
      case 'solid':       return 'var(--surface-0)';
      case 'pill':        return 'transparent';
      default:            return 'var(--glass-bg-deep)';
    }
  };

  const getDockBorder = () => {
    if (dockStyle === 'transparent') return 'none';
    return `${isBottom ? '1px 0 0 0' : '0 0 1px 0'} solid var(--glass-border)`;
  };

  return (
    <div data-context-ignore
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="dock-root"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        ...(isBottom ? { bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : {}),
        ...(isTop    ? { top: 0 } : {}),
        width: '100vw',
        height,
        margin: 0,
        background: getDockBg(),
        backdropFilter:
          dockStyle !== 'transparent'
            ? 'blur(var(--glass-blur)) saturate(var(--glass-saturate))'
            : 'none',
        WebkitBackdropFilter:
          dockStyle !== 'transparent'
            ? 'blur(var(--glass-blur)) saturate(var(--glass-saturate))'
            : 'none',
        border: getDockBorder(),
        boxShadow:
          dockStyle === 'transparent'
            ? 'none'
            : isBottom
            ? '0 -6px 30px rgba(0,0,0,0.35)'
            : '0 6px 30px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 'var(--space-5)',
        paddingRight: 'var(--space-5)',
        zIndex: 999999,
        userSelect: 'none',
        transform: hidden
          ? `translateY(${isBottom ? '110%' : '-110%'})`
          : 'translateY(0)',
        transition: 'transform var(--dur-slow) var(--ease-spring)',
        fontFamily: 'var(--font-family)',
        boxSizing: 'border-box',
      }}
    >
      {/* LEFT — launcher button */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
        <button
          onClick={toggleLauncher}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--text-primary)',
            textShadow: '0 0 10px var(--accent-glow-soft)',
            transition:
              'background var(--dur-fast), transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-normal)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = 'rgba(255,255,255,0.09)';
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'rgba(255,255,255,0.04)';
            el.style.transform = '';
            el.style.boxShadow = '';
          }}
        >
          ❖
        </button>
      </div>

      {/* CENTER — app icons */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--dock-gap)',
          background:
            dockStyle === 'pill'
              ? 'var(--glass-bg)'
              : 'rgba(255,255,255,0.02)',
          padding:
            dockStyle === 'pill'
              ? 'var(--dock-padding) var(--dock-padding)'
              : '0px 0px',
          borderRadius:
            dockStyle === 'pill' ? 'var(--radius-full)' : '6px',
          border: '1px solid var(--glass-border)',
          boxShadow:
            dockStyle === 'pill'
              ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
              : 'none',
        }}
      >
        {systemApps.map((app) => {
          const runningWin  = openWindows.find((w) => w.appId === app.id);
          const isRunning   = !!runningWin;
          const isCurrent   = runningWin?.id === activeWindowId;
          const isMinimised = !!runningWin?.minimized;

          return (
            <div
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              title={app.name}
              className="dock-item"
              style={{
                width:  'var(--dock-item-size)',
                height: 'var(--dock-item-size)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                background: isCurrent
                  ? `${app.color}18`
                  : 'transparent',
                border: isCurrent
                  ? `1px solid ${app.color}33`
                  : '1px solid transparent',
                boxShadow: isCurrent
                  ? `0 0 14px ${app.color}22`
                  : 'none',
                transition:
                  'transform var(--dur-fast) var(--ease-spring), background var(--dur-fast), box-shadow var(--dur-normal)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.92)';
              }}
            >
              {/*
               * Per-app color is passed here directly from app.color.
               * AppIcon's CSS filter pipeline converts the white SVG to this hue.
               * Active state adds a drop-shadow glow matching the app color.
               * Minimised state reduces opacity to 45%.
               */}
              <AppIcon
                src={iconImages[app.id] || '/icons/apps/default.svg'}
                alt={app.name}
                size={28}
                color={app.color}
                style={{
                  width: '62%',
                  height: '62%',
                  opacity: isMinimised ? 0.45 : 1,
                  transition: 'filter var(--dur-normal), opacity var(--dur-normal)',
                  filter: isCurrent
                    ? `drop-shadow(0 2px 8px ${app.color}88)`
                    : undefined,
                }}
              />

              {/* Running indicator dot */}
              {isRunning && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isCurrent ? 14 : 4,
                    height: 3,
                    borderRadius: 99,
                    background: isCurrent
                      ? app.color
                      : 'rgba(255,255,255,0.4)',
                    boxShadow: isCurrent
                      ? `0 0 8px ${app.color}`
                      : 'none',
                    transition: 'all var(--dur-normal) var(--ease-spring)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT — branding + clock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 120,
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          TROY OS
        </div>

        <div
          style={{
            height: 32,
            padding: '0 var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
            cursor: 'default',
            transition: 'background var(--dur-fast), border-color var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {time || '--:--'}
        </div>
      </div>
    </div>
  );
}