'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore, OS_VERSION, OS_BUILD } from '@/store/useOSStore';
import AppIcon from '@/components/AppIcon';

import type {
  OSState, ClockSettings, DockPosition, DockStyle,
  LauncherPosition, CursorStyle, WindowAnimationCurve,
  FontTransformStyle, ThemeMode, NotificationPosition,
} from '@/store/useOSStore';

import { WALLPAPERS } from '@/config/themes';

const PREMIUM_FONTS = [
  { name: 'Geist Sans',       value: 'var(--font-geist-sans), sans-serif',  preview: 'Aa' },
  { name: 'Inter',            value: 'var(--font-inter), sans-serif',        preview: 'Aa' },
  { name: 'Montserrat',       value: 'var(--font-montserrat), sans-serif',   preview: 'Aa' },
  { name: 'Fira Code',        value: 'var(--font-fira-code), monospace',     preview: 'Aa' },
  { name: 'Syncopate',        value: 'var(--font-syncopate), sans-serif',    preview: 'Aa' },
  { name: 'Playfair Display', value: 'var(--font-playfair), Georgia, serif', preview: 'Aa' },
];

const ACCENT_PRESETS = [
  { name: 'Blue',    color: '#3b82f6' }, { name: 'Purple',  color: '#8b5cf6' },
  { name: 'Red',     color: '#ff002b' }, { name: 'Green',   color: '#01d340' },
  { name: 'Orange',  color: '#ffae00' }, { name: 'Cyan',    color: '#06b6d4' },
  { name: 'Mclaren', color: '#ff8000' }, { name: 'Navy',    color: '#00028b' },
  { name: 'Light Green',    color: '#84cc16' }, { name: 'Pink',    color: '#ec4899' },
];

const ICON_COLOR_PRESETS = [
  { name: 'White',     color: '#ffffff' }, { name: 'Blue',    color: '#3b82f6' },
  { name: 'Purple',    color: '#8b5cf6' }, { name: 'Red',     color: '#ff002b' },
  { name: 'Green',     color: '#10b981' }, { name: 'Orange',  color: '#ffae00' },
  { name: 'Cyan',      color: '#06b6d4' }, { name: 'Mclaren', color: '#ff8000' },
  { name: 'Grey',      color: '#94a3b8' }, { name: 'Gold',    color: '#eab308' },
];

const CLOCK_PRESETS = [
  { id: 'hud',     name: 'HUD',        icon: '⬡' },
  { id: 'glass',   name: 'Aero Glass', icon: '◈' },
  { id: 'retro',   name: 'Synthwave',  icon: '⬢' },
  { id: 'minimal', name: 'Minimal',    icon: '◻' },
];

const WALLPAPER_STYLES = [
  { id: 'cover',   name: 'Cover'   },
  { id: 'contain', name: 'Contain' },
  { id: 'fill',    name: 'Fill'    },
  { id: 'tile',    name: 'Tile'    },
];

const BACKGROUND_PRESETS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #fb7185, #f97316)' },
  { name: 'Nebula', value: 'linear-gradient(135deg, #6366f1, #ec4899)' },
  { name: 'Ocean',  value: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
];

const FONT_TRANSFORMS = [
  { id: 'none', name: 'Normal' }, { id: 'uppercase', name: 'Upper' },
  { id: 'lowercase', name: 'Lower' }, { id: 'capitalize', name: 'Cap' },
];

const THEME_MODE_OPTIONS = [
  { id: 'dark',   name: 'Dark'   }, { id: 'light',  name: 'Light'  },
  { id: 'system', name: 'System' }, { id: 'glass',  name: 'Glass'  },
  { id: 'neon',   name: 'Neon'   }, { id: 'aero',   name: 'Aero'   },
];

const TASKBAR_POSITIONS = [
  { id: 'bottom', name: 'Bottom', icon: '▃' },
  { id: 'top',    name: 'Top',    icon: '▀' },
];

const CURSOR_STYLES = [
  { id: 'default',   name: 'System Default' },
  { id: 'none',      name: 'Invisible'      },
  { id: 'crosshair', name: 'Crosshair'      },
  { id: 'dot',       name: 'Minimal Dot'    },
];

const WINDOW_ANIMATIONS = [
  { id: 'smooth', name: 'Smooth Scale' }, { id: 'slide', name: 'Slide In' },
  { id: 'fade',   name: 'Fade'         }, { id: 'none',  name: 'Instant' },
];

const NOTIFICATION_POSITIONS = [
  { id: 'top-right',    name: 'Top Right'    }, { id: 'top-left',     name: 'Top Left'     },
  { id: 'bottom-right', name: 'Bottom Right' }, { id: 'bottom-left',  name: 'Bottom Left'  },
];

const DOCK_STYLES = [
  { id: 'glass',       name: 'Glass'       }, { id: 'solid',       name: 'Solid'       },
  { id: 'transparent', name: 'Transparent' }, { id: 'pill',        name: 'Pill'        },
];

const WIPE_STEPS = [
  { label: 'Deleting localStorage…',    weight: 15, duration: 2800 },
  { label: 'Deleting sessionStorage…',  weight: 10, duration: 7937 },
  { label: 'Deleting cookies…',         weight: 10, duration: 2100 },
  { label: 'Deleting IndexedDB…',       weight: 20, duration: 3500 },
  { label: 'Deleting caches…',          weight: 20, duration: 3200 },
  { label: 'Deleting service workers…', weight: 15, duration: 2937 },
  { label: 'Resetting store state…',    weight: 10, duration: 5304 },
];

const SECRET_CODE = ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown'];

type WallpaperEntry = { name?: string; gradient?: string; color?: string; background?: string };
const THEMES = WALLPAPERS as WallpaperEntry[];

/* ── Tab IDs — added 'taskbar' to split Desktop tab ── */
type TabId = 'canvas' | 'clock' | 'engine' | 'desktop' | 'taskbar' | 'advanced';
type ResetPhase = 'idle' | 'confirm' | 'wiping' | 'skipping';

interface AppearanceTabProps {
  accentColor: string; isDarkMode: boolean; store: OSState;
  tempWallpaperUrl: string; setTempWallpaperUrl: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLocalImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconColor: string;
}
interface ClockTabProps {
  clockSettings: ClockSettings;
  updateClockSetting: (key: keyof ClockSettings, value: ClockSettings[keyof ClockSettings]) => void;
  clockFontSize: number; accentColor: string;
}
interface DesktopTabProps {
  iconSize: number; showDesktopGrid: boolean;
  iconColor: string; store: OSState; accentColor: string;
}
interface TaskbarTabProps {
  taskbarPosition: DockPosition; taskbarHeight: number; dockStyle: DockStyle;
  notificationPosition: NotificationPosition; launcherPosition: LauncherPosition;
  store: OSState; accentColor: string;
}
interface SystemTabProps {
  systemFontFamily: string; systemFontSize: number; uiBlur: number;
  uiOpacity: number; borderRadius: number; titlebarHeight: number;
  windowBorderGlow: boolean; windowAnimation: WindowAnimationCurve;
  store: OSState; accentColor: string;
}
interface ToggleProps { active: boolean; onToggle: () => void; accentColor: string; }
interface AdvancedTabProps {
  reducedMotion: boolean; particleEffects: boolean; cursorStyle: CursorStyle;
  store: OSState; accentColor: string;
}

export default function Settings() {
  const store = useOSStore();

  const [activeTab, setActiveTab]               = useState<TabId>('canvas');
  const [tempWallpaperUrl, setTempWallpaperUrl] = useState('');
  const [resetPhase, setResetPhase]             = useState<ResetPhase>('idle');
  const [wipeProgress, setWipeProgress]         = useState(0);
  const [wipeStep, setWipeStep]                 = useState('');
  const fileInputRef                            = useRef<HTMLInputElement>(null);
  const secretBufferRef                         = useRef<string[]>([]);
  const wipeAbortRef                            = useRef(false);

  const accentColor      = store.accentColor      || '#3b82f6';
  const iconColor        = store.iconColor        ?? '#ffffff';
  const isDarkMode       = store.isDarkMode       ?? true;
  const uiBlur           = store.uiBlur           ?? 24;
  const uiOpacity        = store.uiOpacity        ?? 0.75;
  const borderRadius     = store.uiBorderRadius   ?? 16;
  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const systemFontSize   = store.systemFontSize   || 13;

  const defaultClockSettings: ClockSettings = {
    type: 'hud', color: '#ffffff', glowColor: 'rgba(59,130,246,0.5)',
    use24Hour: true, showSeconds: false, showDate: true,
    militaryTime: false, dateFormat: 'DD/MM/YYYY',
  };
  const clockSettings: ClockSettings = { ...defaultClockSettings, ...store.clockSettings };
  const taskbarPosition      = store.dockPosition         || 'bottom';
  const dockStyle            = store.dockStyle            || 'glass';
  const windowAnimation      = store.windowAnimationCurve || 'smooth';
  const notificationPosition = store.notificationPosition || 'top-right';
  const showDesktopGrid      = store.showDesktopGrid      ?? true;
  const iconSize             = store.iconSize             ?? 56;
  const cursorStyle          = store.cursorStyle          || 'default';
  const particleEffects      = store.particleEffects      ?? false;
  const reducedMotion        = store.reducedMotion        ?? false;
  const windowBorderGlow     = store.windowBorderGlow     ?? true;
  const taskbarHeight        = store.taskbarHeight        ?? 54;
  const clockFontSize        = clockSettings.fontSize     || 48;
  const titlebarHeight       = store.titlebarHeight       ?? 40;
  const launcherPosition     = store.launcherPosition     || 'center';

  const doActualReset = useCallback(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    if (window.indexedDB) {
      try { const dbs = await window.indexedDB.databases(); for (const db of dbs) { if (db.name) window.indexedDB.deleteDatabase(db.name); } } catch { /* ignore */ }
    }
    if ('caches' in window) {
      try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch { /* ignore */ }
    }
    if ('serviceWorker' in navigator) {
      try { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); } catch { /* ignore */ }
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (resetPhase !== 'confirm' && resetPhase !== 'wiping') return;
    const onKey = (e: KeyboardEvent) => {
      const next = [...secretBufferRef.current, e.key].slice(-SECRET_CODE.length);
      secretBufferRef.current = next;
      if (next.join(',') === SECRET_CODE.join(',')) {
        wipeAbortRef.current = true;
        setResetPhase('skipping');
        setTimeout(() => { doActualReset(); }, 1800);
        window.dispatchEvent(new CustomEvent('troy:skip-to-boot'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resetPhase, doActualReset]);

  const confirmMasterReset = async () => {
    wipeAbortRef.current = false;
    setResetPhase('wiping');
    setWipeProgress(0);
    let currentProgress = 0;
    const totalWeight = WIPE_STEPS.reduce((sum, step) => sum + step.weight, 0);
    for (let i = 0; i < WIPE_STEPS.length; i++) {
      if (wipeAbortRef.current) return;
      const step = WIPE_STEPS[i];
      setWipeStep(step.label);
      const startPercent = currentProgress;
      const endPercent   = currentProgress + (step.weight / totalWeight) * 100;
      const frames       = Math.ceil(step.duration / 16);
      for (let frame = 0; frame <= frames; frame++) {
        if (wipeAbortRef.current) return;
        setWipeProgress(startPercent + ((endPercent - startPercent) * frame) / frames);
        await new Promise(resolve => setTimeout(resolve, step.duration / frames));
      }
      currentProgress = endPercent;
    }
    if (wipeAbortRef.current) return;
    setWipeProgress(100);
    setWipeStep('System wiped successfully');
    await new Promise(resolve => setTimeout(resolve, 600));
    if (wipeAbortRef.current) return;
    await doActualReset();
  };

  const updateClockSetting = (key: keyof ClockSettings, value: ClockSettings[keyof ClockSettings]) => {
    store.setClockSettings({ ...clockSettings, [key]: value });
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      if (b64) {
        store.setCustomWallpaper(b64);
        store.addSavedWallpaper(b64);
        store.addNotification('System', 'Wallpaper uploaded and saved', '🖼️');
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Tabs — Desktop split into Desktop + Taskbar ── */
  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'canvas',   icon: '/icons/sui/palette.svg',       label: 'Appearance' },
    { id: 'clock',    icon: '/icons/sui/clock.svg',         label: 'Clock'      },
    { id: 'desktop',  icon: '/icons/sui/laptop-tabs.svg',   label: 'Desktop'    },
    { id: 'taskbar',  icon: '/icons/sui/apps-button.svg',   label: 'Taskbar'    },
    { id: 'engine',   icon: '/icons/apps/settings.svg',      label: 'System'     },
    { id: 'advanced', icon: '/icons/apps/terminal.svg',     label: 'Advanced'   },
  ];

  const stepStartPercent = (i: number) => WIPE_STEPS.slice(0, i).reduce((a, b) => a + b.weight, 0);
  const stepEndPercent   = (i: number) => WIPE_STEPS.slice(0, i + 1).reduce((a, b) => a + b.weight, 0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'canvas':
        return <AppearanceTab accentColor={accentColor} isDarkMode={isDarkMode} store={store}
          tempWallpaperUrl={tempWallpaperUrl} setTempWallpaperUrl={setTempWallpaperUrl}
          fileInputRef={fileInputRef} handleLocalImageUpload={handleLocalImageUpload}
          iconColor={iconColor} />;
      case 'clock':
        return <ClockTab clockSettings={clockSettings} updateClockSetting={updateClockSetting}
          clockFontSize={clockFontSize} accentColor={accentColor} />;
      case 'desktop':
        return <DesktopTab iconSize={iconSize} showDesktopGrid={showDesktopGrid}
          iconColor={iconColor} store={store} accentColor={accentColor} />;
      case 'taskbar':
        return <TaskbarTab taskbarPosition={taskbarPosition} taskbarHeight={taskbarHeight}
          dockStyle={dockStyle} notificationPosition={notificationPosition}
          launcherPosition={launcherPosition} store={store} accentColor={accentColor} />;
      case 'engine':
        return <SystemTab systemFontFamily={systemFontFamily} systemFontSize={systemFontSize}
          uiBlur={uiBlur} uiOpacity={uiOpacity} borderRadius={borderRadius}
          titlebarHeight={titlebarHeight} windowBorderGlow={windowBorderGlow}
          windowAnimation={windowAnimation} store={store} accentColor={accentColor} />;
      case 'advanced':
        return <AdvancedTab reducedMotion={reducedMotion} particleEffects={particleEffects}
          cursorStyle={cursorStyle} store={store} accentColor={accentColor} />;
      default: return null;
    }
  };

  return (
    <div className="settings-root" style={{
      height: '100%', display: 'flex', color: 'var(--text-primary)',
      background: 'rgba(8,10,16,0.6)', backdropFilter: 'blur(40px)',
      fontFamily: systemFontFamily, overflow: 'hidden', position: 'relative',
    }}>
      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse-red { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        @keyframes fade-in-up { from{opacity:0;transform:translateY(16px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes skip-pulse { 0%,100%{box-shadow:0 0 40px rgba(59,130,246,0.3);} 50%{box-shadow:0 0 80px rgba(59,130,246,0.7);} }
        @keyframes bar-sweep { 0%{transform:translateX(-100%);} 100%{transform:translateX(200%);} }
        @keyframes logo-in { from{opacity:0;transform:scale(0.8) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }
        .settings-root, .settings-root * { font-family: ${systemFontFamily} !important; }
        .s-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none;}
        .s-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:${accentColor};cursor:pointer;border:2px solid #080a10;box-shadow:0 0 8px ${accentColor}66;transition:transform 0.15s;}
        .s-slider::-webkit-slider-thumb:hover{transform:scale(1.3);}
        .s-toggle{width:40px;height:22px;border-radius:11px;position:relative;cursor:pointer;transition:background 0.25s;flex-shrink:0;}
        .s-toggle-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.4,0,0.2,1);box-shadow:0 1px 4px rgba(0,0,0,0.4);}
        .s-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:14px;}
        .s-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);}
        .s-row:last-child{border-bottom:none;}
        .s-label{font-size:12px;font-weight:600;color:var(--text-primary,rgba(255,255,255,0.85));}
        .s-sublabel{font-size:10px;color:rgba(255,255,255,0.35);margin-top:2px;font-weight:500;}
        .s-value{font-size:11px;color:${accentColor};font-weight:700;}
        .s-section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.3);margin-bottom:10px;margin-top:20px;}
        .s-section-title:first-child{margin-top:0;}
        .s-chip{padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;border:1px solid transparent;}
        .s-chip-active{background:${accentColor}22 !important;border-color:${accentColor}55 !important;color:${accentColor} !important;}
        .s-chip-inactive{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);}
        .s-chip-inactive:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
        .s-nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;transition:all 0.2s;border:1px solid transparent;}
        .s-nav-active{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.1);}
        .s-nav-inactive{color:rgba(255,255,255,0.4);}
        .s-nav-inactive:hover{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);}
        .font-card{padding:12px 14px;border-radius:10px;cursor:pointer;transition:all 0.2s;border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:space-between;}
        .font-card-active{background:${accentColor}18 !important;border-color:${accentColor}44 !important;}
        .font-card:hover{background:rgba(255,255,255,0.05);}
        .wallpaper-thumb{border-radius:10px;cursor:pointer;overflow:hidden;aspect-ratio:16/9;transition:all 0.2s;border:2px solid transparent;}
        .wallpaper-thumb:hover{transform:scale(1.03);}
        .wallpaper-thumb-active{border-color:${accentColor} !important;box-shadow:0 0 12px ${accentColor}44;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 188, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 12px',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(0,0,0,0.2)',
        justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Header */}
          <div style={{ padding: '4px 6px 16px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AppIcon src="/icons/sui/palette.svg" size={18} color={accentColor} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.14em' }}>TROY OS</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3, letterSpacing: '-0.02em' }}>Personalize</div>
            </div>
          </div>

          {/* Nav items */}
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`s-nav-item ${activeTab === tab.id ? 's-nav-active' : 's-nav-inactive'}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === tab.id ? 'var(--text-primary)' : undefined }}
            >
              <AppIcon
                src={tab.icon}
                size={16}
                color={activeTab === tab.id ? accentColor : 'rgba(255,255,255,0.4)'}
              />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Reset button */}
        <button
          onClick={() => setResetPhase('confirm')}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', color: 'rgba(248,113,113,0.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; }}
        >
          <AppIcon src="/icons/sui/update-refresh.svg" size={14} color="#f87171" />
          Reset System
        </button>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {renderTabContent()}
      </div>

      {/* Fullscreen reset overlay */}
      {resetPhase !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: resetPhase === 'skipping' ? 'rgba(0,0,0,0.99)' : 'rgba(4,5,10,0.97)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}>
          {resetPhase !== 'confirm' && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)' }} />
          )}

          {resetPhase === 'confirm' && (
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, animation: 'fade-in-up 0.35s cubic-bezier(0.16,1,0.3,1)', maxWidth: 520, width: '100%', padding: '0 24px' }}>
              <div style={{ width: '100%', height: 5, marginBottom: 48, borderRadius: 99, background: 'repeating-linear-gradient(90deg,#ef4444 0px,#ef4444 14px,rgba(26,6,6,0.8) 14px,rgba(26,6,6,0.8) 28px)' }} />
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, animation: 'pulse-red 2s ease-in-out infinite', boxShadow: '0 0 40px rgb(255, 0, 0)' }}>
                <AppIcon src="/icons/sui/update-refresh.svg" size={40} color="#ff0000" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>Reset Troy OS?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 36, lineHeight: 1.6, maxWidth: 380 }}>This will permanently wipe all stored data and reload to factory defaults. This cannot be undone.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36, width: '100%' }}>
                {WIPE_STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.10)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>{s.label.replace('…', '')}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button onClick={() => setResetPhase('idle')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
                <button onClick={confirmMasterReset} style={{ flex: 1.6, padding: '14px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.5)', background: 'linear-gradient(135deg,#dc2626 0%,#991b1b 100%)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <AppIcon src="/icons/sui/update-refresh.svg" size={16} color="#ffffff" />
                  Reset Everything
                </button>
              </div>
            </div>
          )}

          {resetPhase === 'wiping' && (
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, padding: '0 32px', textAlign: 'center', animation: 'fade-in-up 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ display: 'inline-flex', marginBottom: 28, animation: 'spin 1.2s linear infinite' }}>
                <AppIcon src="/icons/sui/update-refresh.svg" size={52} color="#ef4444" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>Resetting System</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 36 }}>{wipeStep}</div>
              <div style={{ marginBottom: 10, width: '100%' }}>
                <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#ef4444,#f97316,#ef4444)', width: `${wipeProgress}%`, transition: 'width 0.05s linear' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>WIPING DATA</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>{Math.round(wipeProgress)}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 24 }}>
                {WIPE_STEPS.map((s, i) => {
                  const done   = wipeProgress >= stepEndPercent(i);
                  const active = !done && wipeProgress >= stepStartPercent(i);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: done ? 'rgba(34,197,94,0.06)' : active ? 'rgba(239,68,68,0.06)' : 'transparent', opacity: done || active ? 1 : 0.22, transition: 'all 0.3s' }}>
                      <span style={{ fontSize: 13, width: 18, textAlign: 'center', color: done ? '#22c55e' : active ? '#fbbf24' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{done ? '✓' : active ? '⟳' : '○'}</span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: done ? '#86efac' : active ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 32, fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>↑ ↓ ↑ ↓ TO SKIP</div>
            </div>
          )}

          {resetPhase === 'skipping' && (
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', animation: 'logo-in 0.5s cubic-bezier(0.16,1,0.3,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: '-0.05em', background: 'linear-gradient(180deg,#ffffff 30%,#3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16, animation: 'skip-pulse 1.5s ease-in-out infinite' }}>TROY</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.9em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 48 }}>OS</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 32, fontFamily: 'monospace', letterSpacing: '0.05em' }}>INITIALIZING BOOT SEQUENCE</div>
              <div style={{ width: 280, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,#3b82f6,#60a5fa,transparent)', borderRadius: 99, animation: 'bar-sweep 1.2s ease-in-out infinite' }} />
              </div>
              <div style={{ marginTop: 48, fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Troy OS v{OS_VERSION} · {OS_BUILD}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tab components ── */

function AppearanceTab({ accentColor, isDarkMode, store, tempWallpaperUrl, setTempWallpaperUrl, fileInputRef, handleLocalImageUpload, iconColor }: AppearanceTabProps) {
  const savedWallpapers = store.savedWallpapers || [];

  const saveWallpaperUrl = () => {
    const url = tempWallpaperUrl.trim();
    if (!url) return;
    store.setCustomWallpaper(url);
    store.addSavedWallpaper(url);
    store.addNotification('System', 'Wallpaper saved', '🖼️');
  };

  return (
    <>
      <p className="s-section-title">Accent Color</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 12 }}>
        {ACCENT_PRESETS.map(a => (
          <button key={a.color} onClick={() => store.setAccentColor(a.color)}
            style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${accentColor === a.color ? a.color : 'transparent'}`, background: accentColor === a.color ? `${a.color}22` : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}
          >
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: a.color, boxShadow: `0 0 8px ${a.color}66` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: accentColor === a.color ? a.color : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.name}</span>
          </button>
        ))}
      </div>
      <div className="s-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 10, background: accentColor, flexShrink: 0, overflow: 'hidden', boxShadow: `0 4px 12px ${accentColor}55` }}>
          <input type="color" value={accentColor} onChange={e => store.setAccentColor(e.target.value)} style={{ position: 'absolute', inset: '-8px', width: 56, height: 56, cursor: 'pointer', border: 'none', background: 'none' }} />
        </div>
        <div>
          <div className="s-label">Custom Color</div>
          <div style={{ fontSize: 11, color: accentColor, fontFamily: 'monospace', fontWeight: 700, marginTop: 2 }}>{accentColor}</div>
        </div>
      </div>

      <p className="s-section-title">Color Scheme</p>
      <div className="s-card" style={{ marginBottom: 4 }}>
        <div className="s-row">
          <div><div className="s-label">Dark Mode</div><div className="s-sublabel">Deep dark UI theme</div></div>
          <Toggle active={isDarkMode} onToggle={() => { const next = !isDarkMode; store.setIsDarkMode(next); store.setThemeMode(next ? 'dark' : 'light'); }} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Wallpaper</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        {THEMES.map((wp, i) => (
          <div key={i}
            className={`wallpaper-thumb ${store.wallpaperIndex === i && !store.customWallpaper ? 'wallpaper-thumb-active' : ''}`}
            onClick={() => { store.setWallpaperIndex(i); store.setCustomWallpaper(''); }}
            style={{ position: 'relative', minHeight: 52, background: wp.background && !wp.background.startsWith('http') && !wp.background.startsWith('/') && !wp.background.startsWith('blob:') && !wp.background.startsWith('data:image') ? wp.background : undefined, backgroundImage: wp.background && (wp.background.startsWith('http') || wp.background.startsWith('/') || wp.background.startsWith('blob:') || wp.background.startsWith('data:image')) ? `url("${wp.background}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{wp.name || `Theme ${i + 1}`}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="s-section-title">Wallpaper Style</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
        {WALLPAPER_STYLES.map(style => (
          <button key={style.id} onClick={() => store.setWallpaperStyle(style.id)} className={`s-chip ${store.wallpaperStyle === style.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none' }}>{style.name}</button>
        ))}
      </div>

      <p className="s-section-title">Desktop Fill</p>
      <div className="s-card" style={{ marginBottom: 10 }}>
        <div className="s-row">
          <div><div className="s-label">Background Color</div><div className="s-sublabel">Solid desktop fill color</div></div>
          <input type="color" value={store.customBackgroundColor} onChange={e => store.setCustomBackgroundColor(e.target.value)} style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Gradient Fill</span></div>
          <input type="text" value={store.customBackgroundGradient} onChange={e => store.setCustomBackgroundGradient(e.target.value)} placeholder="linear-gradient(...)" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 11, outline: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {BACKGROUND_PRESETS.map(preset => (
              <button key={preset.name} onClick={() => store.setCustomBackgroundGradient(preset.value)} className={`s-chip ${store.customBackgroundGradient === preset.value ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none' }}>{preset.name}</button>
            ))}
          </div>
        </div>
      </div>

      {savedWallpapers.length > 0 && (
        <>
          <p className="s-section-title">Saved Wallpapers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
            {savedWallpapers.map((url, index) => (
              <div key={index} className={`wallpaper-thumb ${store.customWallpaper === url ? 'wallpaper-thumb-active' : ''}`} onClick={() => store.setCustomWallpaper(url)} style={{ position: 'relative', minHeight: 52, backgroundImage: `url("${url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <button onClick={e => { e.stopPropagation(); store.removeSavedWallpaper(url); }} style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.45)', color: '#fff', cursor: 'pointer', fontSize: 12 }}>×</button>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Saved {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 8 }}>
        <input value={tempWallpaperUrl} onChange={e => setTempWallpaperUrl(e.target.value)} placeholder="Wallpaper image URL…" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 11, outline: 'none' }} />
        <button onClick={() => { if (tempWallpaperUrl) store.setCustomWallpaper(tempWallpaperUrl); }} style={{ padding: '8px 14px', borderRadius: 8, background: accentColor, border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
        <button onClick={saveWallpaperUrl} disabled={!tempWallpaperUrl.trim()} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
      </div>
      <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <AppIcon src="/icons/apps/files.svg" size={14} color={iconColor} />
        Upload Local Image
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLocalImageUpload} style={{ display: 'none' }} />
    </>
  );
}

function ClockTab({ clockSettings, updateClockSetting, clockFontSize, accentColor }: ClockTabProps) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setPreview(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...(clockSettings.showSeconds ? { second: '2-digit' } : {}), hour12: !clockSettings.use24Hour }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [clockSettings.use24Hour, clockSettings.showSeconds]);

  return (
    <>
      <p className="s-section-title">Clock Style</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 4 }}>
        {CLOCK_PRESETS.map(p => (
          <button key={p.id} onClick={() => updateClockSetting('type', p.id)} className={`s-chip ${clockSettings.type === p.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: 'none' }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px', marginBottom: 4, textAlign: 'center' }}>
        <div style={{ fontSize: clockFontSize * 0.6, fontWeight: 300, letterSpacing: '-0.03em', color: clockSettings.color || '#fff', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 16px ${clockSettings.glowColor || accentColor}` }}>{preview || '--:--'}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Preview</div>
      </div>
      <p className="s-section-title">Clock Options</p>
      <div className="s-card">
        <div className="s-row"><div><div className="s-label">24-Hour Format</div><div className="s-sublabel">e.g. 14:30 vs 2:30 PM</div></div><Toggle active={!!clockSettings.use24Hour} onToggle={() => updateClockSetting('use24Hour', !clockSettings.use24Hour)} accentColor={accentColor} /></div>
        <div className="s-row"><div><div className="s-label">Show Seconds</div><div className="s-sublabel">Real-time second counter</div></div><Toggle active={!!clockSettings.showSeconds} onToggle={() => updateClockSetting('showSeconds', !clockSettings.showSeconds)} accentColor={accentColor} /></div>
        <div className="s-row"><div><div className="s-label">Show Date</div><div className="s-sublabel">Display day and date below time</div></div><Toggle active={clockSettings.showDate !== false} onToggle={() => updateClockSetting('showDate', !clockSettings.showDate)} accentColor={accentColor} /></div>
      </div>
      <p className="s-section-title">Font Size</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Size</span><span className="s-value">{clockFontSize}px</span></div>
          <input type="range" min={34} max={96} value={clockFontSize} onChange={e => updateClockSetting('fontSize', parseInt(e.target.value))} className="s-slider" />
        </div>
      </div>
      <p className="s-section-title">Colors</p>
      <div className="s-card">
        <div className="s-row"><div><div className="s-label">Text Color</div></div><input type="color" value={clockSettings.color || '#ffffff'} onChange={e => updateClockSetting('color', e.target.value)} style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} /></div>
        <div className="s-row"><div><div className="s-label">Glow Color</div></div><input type="color" value={clockSettings.glowColor?.startsWith('#') ? clockSettings.glowColor : '#3b82f6'} onChange={e => updateClockSetting('glowColor', e.target.value)} style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} /></div>
      </div>
    </>
  );
}

function DesktopTab({ iconSize, showDesktopGrid, iconColor, store, accentColor }: DesktopTabProps) {
  const desktopGridOpacity = store.desktopGridOpacity ?? 0.12;
  const desktopGridColor   = store.desktopGridColor   ?? '#ffffff';
  const snapToGridEnabled  = store.snapToGridEnabled  ?? true;

  return (
    <>
      <p className="s-section-title">Icon Layout</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Icon Size</span><span className="s-value">{iconSize}px</span></div>
          <input type="range" min={70} max={100} value={iconSize} onChange={e => store.setIconSize(parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row"><div><div className="s-label">Show Labels</div><div className="s-sublabel">App name below icons</div></div><Toggle active={store.desktopIconLabelsVisible ?? true} onToggle={() => store.setDesktopIconLabelsVisible(!(store.desktopIconLabelsVisible ?? true))} accentColor={accentColor} /></div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Label Size</span><span className="s-value">{store.desktopIconLabelSize ?? 11}px</span></div>
          <input type="range" min={8} max={18} value={store.desktopIconLabelSize ?? 11} onChange={e => store.setDesktopIconLabelSize(parseInt(e.target.value))} className="s-slider" />
        </div>
      </div>

      <p className="s-section-title">Icon Color</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 10 }}>
        {ICON_COLOR_PRESETS.map(preset => (
          <button key={preset.color} onClick={() => store.setIconColor(preset.color)}
            style={{
              padding: '10px 6px',
              borderRadius: 10,
              border: `2px solid ${iconColor === preset.color ? preset.color : 'transparent'}`,
              background: iconColor === preset.color ? `${preset.color}33` : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: preset.color,
              boxShadow: `0 0 8px ${preset.color}66`,
              border: preset.color === '#ffffff' || preset.color === '#000000' ? '1px solid rgba(0,0,0,0.1)' : 'none'
            }} />
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: iconColor === preset.color ? preset.color : 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{preset.name}</span>
          </button>
        ))}
      </div>
      <div className="s-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <div style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 10,
          background: iconColor,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: `0 4px 12px ${iconColor}55`,
          border: `1px solid ${iconColor === '#ffffff' || iconColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
        }}>
          <input type="color" value={iconColor} onChange={e => store.setIconColor(e.target.value)} style={{
            position: 'absolute',
            inset: '-8px',
            width: 56,
            height: 56,
            cursor: 'pointer',
            border: 'none',
            background: 'none'
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="s-label">Custom Color</div>
          <div style={{
            fontSize: 11,
            color: iconColor === '#ffffff' || iconColor === '#000000' ? 'rgba(0,0,0,0.7)' : iconColor,
            fontFamily: 'monospace',
            fontWeight: 700,
            marginTop: 2
          }}>{iconColor}</div>
        </div>
        <button onClick={() => store.setIconColor('#ffffff')} style={{
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.9)',
          fontSize: 10,
          fontWeight: 700,
          cursor: 'pointer'
        }}>Reset</button>
      </div>
      <div className="s-card" style={{ marginBottom: 10 }}>
        <div className="s-row"><div><div className="s-label">Match Accent Color</div><div className="s-sublabel">Tint icons to accent color</div></div><Toggle active={iconColor === accentColor} onToggle={() => store.setIconColor(iconColor === accentColor ? '#ffffff' : accentColor)} accentColor={accentColor} /></div>
      </div>

      <p className="s-section-title">Desktop Grid</p>
      <div className="s-card">
        <div className="s-row"><div><div className="s-label">Show Grid Lines</div><div className="s-sublabel">Subtle alignment overlay</div></div><Toggle active={showDesktopGrid} onToggle={() => store.setShowDesktopGrid(!showDesktopGrid)} accentColor={accentColor} /></div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Grid Opacity</span><span className="s-value">{Math.round(desktopGridOpacity * 100)}%</span></div>
          <input type="range" min={0} max={100} value={Math.round(desktopGridOpacity * 100)} onChange={e => store.setDesktopGridOpacity(parseInt(e.target.value) / 100)} className="s-slider" />
        </div>
        <div className="s-row"><div><div className="s-label">Grid Color</div></div><input type="color" value={desktopGridColor} onChange={e => store.setDesktopGridColor(e.target.value)} style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} /></div>
        <div className="s-row"><div><div className="s-label">Snap to Grid</div><div className="s-sublabel">Icons snap to alignment grid</div></div><Toggle active={snapToGridEnabled} onToggle={() => store.setSnapToGridEnabled(!snapToGridEnabled)} accentColor={accentColor} /></div>
      </div>
    </>
  );
}

function TaskbarTab({ taskbarPosition, taskbarHeight, dockStyle, notificationPosition, launcherPosition, store, accentColor }: TaskbarTabProps) {
  return (
    <>
      <p className="s-section-title">Taskbar</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Position</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {TASKBAR_POSITIONS.map(p => (
              <button key={p.id} onClick={() => store.setDockPosition(p.id as DockPosition)} className={`s-chip ${taskbarPosition === p.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ flex: 1, border: 'none' }}>{p.icon} {p.name}</button>
            ))}
          </div>
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Height</span><span className="s-value">{taskbarHeight}px</span></div>
          <input type="range" min={40} max={72} value={taskbarHeight} onChange={e => store.setTaskbarHeight(parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Opacity</span><span className="s-value">{Math.round((store.taskbarOpacity ?? 0.82) * 100)}%</span></div>
          <input type="range" min={30} max={100} value={Math.round((store.taskbarOpacity ?? 0.82) * 100)} onChange={e => store.setTaskbarOpacity(parseInt(e.target.value) / 100)} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Style</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {DOCK_STYLES.map(d => (
              <button key={d.id} onClick={() => store.setDockStyle(d.id as DockStyle)} className={`s-chip ${dockStyle === d.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none' }}>{d.name}</button>
            ))}
          </div>
        </div>
        <div className="s-row"><div><div className="s-label">Auto Hide</div><div className="s-sublabel">Slide away when not in use</div></div><Toggle active={store.dockAutoHide ?? false} onToggle={() => store.setDockAutoHide(!(store.dockAutoHide ?? false))} accentColor={accentColor} /></div>
      </div>

      <p className="s-section-title">App Launcher</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Position</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {(['bottom-left', 'bottom-right', 'center', 'top-left'] as LauncherPosition[]).map(pos => (
              <button key={pos} onClick={() => store.setLauncherPosition(pos)} className={`s-chip ${launcherPosition === pos ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none', fontSize: 10 }}>{pos.replace('-', ' ')}</button>
            ))}
          </div>
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Launcher Opacity</span><span className="s-value">{Math.round((store.launcherOpacity ?? 0.96) * 100)}%</span></div>
          <input type="range" min={40} max={100} value={Math.round((store.launcherOpacity ?? 0.96) * 100)} onChange={e => store.setLauncherOpacity(parseInt(e.target.value) / 100)} className="s-slider" />
        </div>
      </div>

      <p className="s-section-title">Notifications</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Position</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {NOTIFICATION_POSITIONS.map(p => (
              <button key={p.id} onClick={() => store.setNotificationPosition(p.id as NotificationPosition)} className={`s-chip ${notificationPosition === p.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none', fontSize: 10 }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SystemTab({ systemFontFamily, systemFontSize, uiBlur, uiOpacity, borderRadius, titlebarHeight, windowBorderGlow, windowAnimation, store, accentColor }: SystemTabProps) {
  return (
    <>
      <p className="s-section-title">Typography</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {PREMIUM_FONTS.map(f => (
          <button key={f.value} onClick={() => store.setSystemFontFamily(f.value)} className={`font-card ${systemFontFamily === f.value ? 'font-card-active' : ''}`} style={{ border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: f.value, color: systemFontFamily === f.value ? accentColor : 'var(--text-primary)' }}>{f.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>System Font</div>
            </div>
            <span style={{ fontSize: 20, fontFamily: f.value, color: systemFontFamily === f.value ? accentColor : 'rgba(255,255,255,0.25)' }}>{f.preview}</span>
          </button>
        ))}
      </div>
      <p className="s-section-title">Font Size & Transform</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Base Size</span><span className="s-value">{systemFontSize}px</span></div>
          <input type="range" min={10} max={18} value={systemFontSize} onChange={e => store.setSystemFontSize(parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Transform</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {FONT_TRANSFORMS.map(t => (
              <button key={t.id} onClick={() => store.setFontTransformStyle(t.id as FontTransformStyle)} className={`s-chip ${store.fontTransformStyle === t.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none' }}>{t.name}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="s-section-title">Theme Mode</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
        {THEME_MODE_OPTIONS.map(mode => (
          <button key={mode.id} onClick={() => store.setThemeMode(mode.id as ThemeMode)} className={`s-chip ${store.themeMode === mode.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none', fontSize: 10 }}>{mode.name}</button>
        ))}
      </div>

      <p className="s-section-title">Glass & Blur</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Backdrop Blur</span><span className="s-value">{uiBlur}px</span></div>
          <input type="range" min={0} max={60} value={uiBlur} onChange={e => store.setUiBlur(parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">UI Opacity</span><span className="s-value">{Math.round(uiOpacity * 100)}%</span></div>
          <input type="range" min={20} max={100} value={Math.round(uiOpacity * 100)} onChange={e => store.setUiOpacity(parseInt(e.target.value) / 100)} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Corner Radius</span><span className="s-value">{borderRadius}px</span></div>
          <input type="range" min={0} max={32} value={borderRadius} onChange={e => store.setUiBorderRadius(parseInt(e.target.value))} className="s-slider" />
        </div>
      </div>

      <p className="s-section-title">Window Chrome</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Titlebar Height</span><span className="s-value">{titlebarHeight}px</span></div>
          <input type="range" min={28} max={56} value={titlebarHeight} onChange={e => store.setTitlebarHeight(parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row"><div><div className="s-label">Window Glow</div><div className="s-sublabel">Accent-colored border glow</div></div><Toggle active={windowBorderGlow} onToggle={() => store.setWindowBorderGlow(!windowBorderGlow)} accentColor={accentColor} /></div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Animation Style</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {WINDOW_ANIMATIONS.map(a => (
              <button key={a.id} onClick={() => store.setWindowAnimationCurve(a.id as WindowAnimationCurve)} className={`s-chip ${windowAnimation === a.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none' }}>{a.name}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AdvancedTab({ reducedMotion, particleEffects, cursorStyle, store, accentColor }: AdvancedTabProps) {
  return (
    <>
      <p className="s-section-title">Accessibility</p>
      <div className="s-card">
        <div className="s-row"><div><div className="s-label">Reduce Motion</div><div className="s-sublabel">Disables non-essential animations</div></div><Toggle active={reducedMotion} onToggle={() => store.setReducedMotion(!reducedMotion)} accentColor={accentColor} /></div>
      </div>
      <p className="s-section-title">Visual FX</p>
      <div className="s-card">
        <div className="s-row"><div><div className="s-label">Particle Effects</div><div className="s-sublabel">Ambient desktop particles</div></div><Toggle active={particleEffects} onToggle={() => store.setParticleEffects(!particleEffects)} accentColor={accentColor} /></div>
      </div>
      <p className="s-section-title">Cursor</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Cursor Style</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {CURSOR_STYLES.map(c => (
              <button key={c.id} onClick={() => store.setCursorStyle(c.id as CursorStyle)} className={`s-chip ${cursorStyle === c.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none', fontSize: 10 }}>{c.name}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="s-section-title">System Info</p>
      <div className="s-card">
        {[['OS Version', OS_VERSION], ['Build', OS_BUILD], ['Kernel', 'Troy 6.1.0-lts'], ['Shell', 'NextShell 14'], ['Renderer', 'WebGL 2.0']].map(([label, value]) => (
          <div key={label} className="s-row">
            <span className="s-label">{label}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Toggle({ active, onToggle, accentColor }: ToggleProps) {
  return (
    <div className="s-toggle" onClick={onToggle} style={{ background: active ? accentColor : 'rgba(255,255,255,0.12)' }}>
      <div className="s-toggle-thumb" style={{ left: active ? 21 : 3 }} />
    </div>
  );
}