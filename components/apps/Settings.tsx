'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import type {
  OSState,
  ClockSettings,
  DockPosition,
  DockStyle,
  LauncherPosition,
  CursorStyle,
  WindowAnimationCurve,
} from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';

const PREMIUM_FONTS = [
  { name: 'Geist Sans',       value: 'var(--font-geist-sans), sans-serif',    preview: 'Aa' },
  { name: 'Inter',            value: 'var(--font-inter), sans-serif',          preview: 'Aa' },
  { name: 'Montserrat',       value: 'var(--font-montserrat), sans-serif',     preview: 'Aa' },
  { name: 'Fira Code',        value: 'var(--font-fira-code), monospace',       preview: 'Aa' },
  { name: 'Syncopate',        value: 'var(--font-syncopate), sans-serif',      preview: 'Aa' },
  { name: 'Playfair Display', value: 'var(--font-playfair), Georgia, serif',   preview: 'Aa' },
];

const ACCENT_PRESETS = [
  { name: 'Azure',   color: '#3b82f6' },
  { name: 'Violet',  color: '#8b5cf6' },
  { name: 'Rose',    color: '#f43f5e' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Amber',   color: '#f59e0b' },
  { name: 'Cyan',    color: '#06b6d4' },
  { name: 'Coral',   color: '#f97316' },
  { name: 'Indigo',  color: '#6366f1' },
  { name: 'Lime',    color: '#84cc16' },
  { name: 'Pink',    color: '#ec4899' },
];

const CLOCK_PRESETS = [
  { id: 'hud',     name: 'HUD',        icon: '⬡' },
  { id: 'glass',   name: 'Aero Glass', icon: '◈' },
  { id: 'retro',   name: 'Synthwave',  icon: '⬢' },
  { id: 'minimal', name: 'Minimal',    icon: '◻' },
];

const TASKBAR_POSITIONS = [
  { id: 'bottom', name: 'Bottom', icon: '▃' },
  { id: 'top',    name: 'Top',    icon: '▀' },
];

const CURSOR_STYLES = [
  { id: 'default',   name: 'System Default' },
  { id: 'none',      name: 'Invisible' },
  { id: 'crosshair', name: 'Crosshair' },
  { id: 'dot',       name: 'Minimal Dot' },
];

const WINDOW_ANIMATIONS = [
  { id: 'smooth', name: 'Smooth Scale' },
  { id: 'slide',  name: 'Slide In' },
  { id: 'fade',   name: 'Fade' },
  { id: 'none',   name: 'Instant' },
];

const NOTIFICATION_POSITIONS = [
  { id: 'top-right',    name: 'Top Right' },
  { id: 'top-left',     name: 'Top Left' },
  { id: 'bottom-right', name: 'Bottom Right' },
  { id: 'bottom-left',  name: 'Bottom Left' },
];

const DOCK_STYLES = [
  { id: 'floating',    name: 'Floating' },
  { id: 'solid',       name: 'Solid Bar' },
  { id: 'transparent', name: 'Transparent' },
  { id: 'pill',        name: 'Pill' },
];

type WallpaperEntry = { name?: string; gradient?: string; color?: string; background?: string };
const THEMES = WALLPAPERS as WallpaperEntry[];

type TabId = 'canvas' | 'clock' | 'engine' | 'desktop' | 'advanced';

// Loose dynamic setter — avoids all TS2345 errors for store setters
type SetSetting = (key: string, value: unknown) => void;

// ── Sub-component prop types ─────────────────────────────────────────────────

interface AppearanceTabProps {
  accentColor: string;
  isDarkMode: boolean;
  store: OSState;
  tempWallpaperUrl: string;
  setTempWallpaperUrl: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLocalImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ClockTabProps {
  clockSettings: ClockSettings;
  updateClockSetting: (key: keyof ClockSettings, value: ClockSettings[keyof ClockSettings]) => void;
  clockFontSize: number;
  accentColor: string;
}

interface DesktopTabProps {
  iconSize: number;
  showDesktopGrid: boolean;
  taskbarPosition: DockPosition;
  taskbarHeight: number;
  dockStyle: DockStyle;
  notificationPosition: string;
  launcherPosition: LauncherPosition;
  setSetting: SetSetting;
  store: OSState;
  accentColor: string;
}

interface SystemTabProps {
  systemFontFamily: string;
  systemFontSize: number;
  uiBlur: number;
  uiOpacity: number;
  borderRadius: number;
  titlebarHeight: number;
  windowBorderGlow: boolean;
  windowAnimation: WindowAnimationCurve;
  store: OSState;
  setSetting: SetSetting;
  accentColor: string;
}

interface AdvancedTabProps {
  reducedMotion: boolean;
  particleEffects: boolean;
  cursorStyle: CursorStyle;
  setSetting: SetSetting;
  accentColor: string;
}

interface ToggleProps {
  active: boolean;
  onToggle: () => void;
  accentColor: string;
}

// ── Root component ───────────────────────────────────────────────────────────

export default function Settings() {
  const store = useOSStore();
  const [activeTab, setActiveTab]               = useState<TabId>('canvas');
  const [tempWallpaperUrl, setTempWallpaperUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const systemFontSize   = store.systemFontSize   || 13;
  const accentColor      = store.accentColor      || '#3b82f6';
  const uiBlur           = store.uiBlur           ?? 24;
  const uiOpacity        = store.uiOpacity        ?? 0.75;
  const borderRadius     = store.uiBorderRadius   ?? 16;
  const isDarkMode       = store.isDarkMode       ?? true;

  // Merge store clock settings with safe defaults
  const clockSettings: ClockSettings = {
    type:         'hud',
    color:        '#ffffff',
    glowColor:    'rgba(59,130,246,0.5)',
    use24Hour:    true,
    showSeconds:  false,
    showDate:     true,
    militaryTime: false,
    dateFormat:   'DD/MM/YYYY',
    ...store.clockSettings,
  };

  const taskbarPosition      = store.dockPosition         || 'bottom';
  const dockStyle            = store.dockStyle            || 'glass';
  const windowAnimation      = store.windowAnimationCurve || 'smooth';
  const notificationPosition = 'top-right';
  const showDesktopGrid      = store.showDesktopGrid      ?? true;
  const iconSize             = store.iconSize             ?? 72;
  const cursorStyle          = store.cursorStyle          || 'default';
  const particleEffects      = store.particleEffects      ?? false;
  const reducedMotion        = store.reducedMotion        ?? false;
  const windowBorderGlow     = store.windowBorderGlow     ?? true;
  const taskbarHeight        = store.taskbarHeight        ?? 54;
  const clockFontSize        = clockSettings.fontSize     || 48;
  const titlebarHeight       = store.titlebarHeight       ?? 40;
  const launcherPosition     = store.launcherPosition     || 'center';

  // updateClockSetting merges a single key into the full ClockSettings object
  const updateClockSetting = (key: keyof ClockSettings, value: ClockSettings[keyof ClockSettings]) => {
    store.setClockSettings({ ...clockSettings, [key]: value });
  };

  // Generic setter — dynamically looks up `set<Key>` on the store
  const setSetting: SetSetting = (key, value) => {
    const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    const setter = (store as unknown as Record<string, unknown>)[setterName];
    if (typeof setter === 'function') (setter as (v: unknown) => void)(value);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      if (b64) { store.setCustomWallpaper(b64); store.addNotification('System', 'Custom wallpaper loaded', '🖼️'); }
    };
    reader.readAsDataURL(file);
  };

  const handleMasterReset = () => {
    if (!window.confirm('Restore all settings to defaults?')) return;
    store.setSystemFontFamily('var(--font-geist-sans), sans-serif');
    store.setAccentColor('#3b82f6');
    store.setUiBlur(24);
    store.setUiOpacity(0.75);
    store.setWallpaperIndex(0);
    store.setCustomWallpaper('');
    store.setClockSettings({ type: 'hud', color: '#ffffff', glowColor: 'rgba(59,130,246,0.5)', use24Hour: true, showSeconds: false, showDate: true });
    setTempWallpaperUrl('');
    store.addNotification('System', 'Settings restored to defaults', '⚙️');
  };

  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'canvas',   icon: '🎨', label: 'Appearance' },
    { id: 'clock',    icon: '🕐', label: 'Clock' },
    { id: 'desktop',  icon: '🖥️', label: 'Desktop' },
    { id: 'engine',   icon: '⚙️', label: 'System' },
    { id: 'advanced', icon: '🔧', label: 'Advanced' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'canvas':  return <AppearanceTab accentColor={accentColor} isDarkMode={isDarkMode} store={store} tempWallpaperUrl={tempWallpaperUrl} setTempWallpaperUrl={setTempWallpaperUrl} fileInputRef={fileInputRef} handleLocalImageUpload={handleLocalImageUpload} />;
      case 'clock':   return <ClockTab clockSettings={clockSettings} updateClockSetting={updateClockSetting} clockFontSize={clockFontSize} accentColor={accentColor} />;
      case 'desktop': return <DesktopTab iconSize={iconSize} showDesktopGrid={showDesktopGrid} taskbarPosition={taskbarPosition} taskbarHeight={taskbarHeight} dockStyle={dockStyle} notificationPosition={notificationPosition} launcherPosition={launcherPosition} setSetting={setSetting} store={store} accentColor={accentColor} />;
      case 'engine':  return <SystemTab systemFontFamily={systemFontFamily} systemFontSize={systemFontSize} uiBlur={uiBlur} uiOpacity={uiOpacity} borderRadius={borderRadius} titlebarHeight={titlebarHeight} windowBorderGlow={windowBorderGlow} windowAnimation={windowAnimation} store={store} setSetting={setSetting} accentColor={accentColor} />;
      case 'advanced': return <AdvancedTab reducedMotion={reducedMotion} particleEffects={particleEffects} cursorStyle={cursorStyle} setSetting={setSetting} accentColor={accentColor} />;
      default: return null;
    }
  };

  return (
    <div className="settings-root" style={{ height: '100%', display: 'flex', color: '#fff', background: 'rgba(8,10,16,0.6)', backdropFilter: 'blur(40px)', fontFamily: systemFontFamily, overflow: 'hidden' }}>
      <style>{`
        .settings-root, .settings-root * { font-family: ${systemFontFamily} !important; }
        .s-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:2px; background:rgba(255,255,255,0.1); outline:none; }
        .s-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:14px; height:14px; border-radius:50%; background:${accentColor}; cursor:pointer; border:2px solid #080a10; box-shadow:0 0 8px ${accentColor}66; transition:transform 0.15s; }
        .s-slider::-webkit-slider-thumb:hover { transform:scale(1.3); }
        .s-toggle { width:40px; height:22px; border-radius:11px; position:relative; cursor:pointer; transition:background 0.25s; flex-shrink:0; }
        .s-toggle-thumb { width:16px; height:16px; border-radius:50%; background:#fff; position:absolute; top:3px; transition:left 0.25s cubic-bezier(0.4,0,0.2,1); box-shadow:0 1px 4px rgba(0,0,0,0.4); }
        .s-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); border-radius:14px; }
        .s-row { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.04); }
        .s-row:last-child { border-bottom:none; }
        .s-label { font-size:12px; font-weight:600; color:rgba(255,255,255,0.85); }
        .s-sublabel { font-size:10px; color:rgba(255,255,255,0.35); margin-top:2px; font-weight:500; }
        .s-value { font-size:11px; color:${accentColor}; font-weight:700; }
        .s-section-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.14em; color:rgba(255,255,255,0.3); margin-bottom:10px; margin-top:20px; }
        .s-section-title:first-child { margin-top:0; }
        .s-chip { padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s; border:1px solid transparent; }
        .s-chip-active { background:${accentColor}22 !important; border-color:${accentColor}55 !important; color:${accentColor} !important; }
        .s-chip-inactive { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5); }
        .s-chip-inactive:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.8); }
        .s-nav-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; cursor:pointer; transition:all 0.2s; border:1px solid transparent; }
        .s-nav-active { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.1); }
        .s-nav-inactive { color:rgba(255,255,255,0.4); }
        .s-nav-inactive:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); }
        .font-card { padding:12px 14px; border-radius:10px; cursor:pointer; transition:all 0.2s; border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:space-between; }
        .font-card-active { background:${accentColor}18 !important; border-color:${accentColor}44 !important; }
        .font-card:hover { background:rgba(255,255,255,0.05); }
        .wallpaper-thumb { border-radius:10px; cursor:pointer; overflow:hidden; aspect-ratio:16/9; transition:all 0.2s; border:2px solid transparent; }
        .wallpaper-thumb:hover { transform:scale(1.03); }
        .wallpaper-thumb-active { border-color:${accentColor} !important; box-shadow:0 0 12px ${accentColor}44; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 188, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 12px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ padding: '4px 6px 16px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.14em' }}>TROY OS</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 3, letterSpacing: '-0.02em' }}>Personalize</div>
          </div>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`s-nav-item ${activeTab === tab.id ? 's-nav-active' : 's-nav-inactive'}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === tab.id ? '#fff' : undefined }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{tab.label}</span>
            </button>
          ))}
        </div>
        <button onClick={handleMasterReset}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', color: 'rgba(248,113,113,0.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; }}
        >
          <span>↺</span> Reset Defaults
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {renderTabContent()}
      </div>
    </div>
  );
}

// ── Tab components ────────────────────────────────────────────────────────────

function AppearanceTab({ accentColor, isDarkMode, store, tempWallpaperUrl, setTempWallpaperUrl, fileInputRef, handleLocalImageUpload }: AppearanceTabProps) {
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
          <input type="color" value={accentColor} onChange={e => store.setAccentColor(e.target.value)}
            style={{ position: 'absolute', inset: '-8px', width: 56, height: 56, cursor: 'pointer', border: 'none', background: 'none' }} />
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
          <Toggle active={isDarkMode} onToggle={() => store.setIsDarkMode(!isDarkMode)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Wallpaper</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        {THEMES.map((wp, i) => (
          <div key={i} className={`wallpaper-thumb ${store.wallpaperIndex === i ? 'wallpaper-thumb-active' : ''}`}
            onClick={() => { store.setWallpaperIndex(i); store.setCustomWallpaper(''); }}
            style={{
              position: 'relative', minHeight: 52,
              background: wp.background && !wp.background.startsWith('http') && !wp.background.startsWith('/') && !wp.background.startsWith('blob:') && !wp.background.startsWith('data:image') ? wp.background : undefined,
              backgroundImage: wp.background && (wp.background.startsWith('http') || wp.background.startsWith('/') || wp.background.startsWith('blob:') || wp.background.startsWith('data:image')) ? `url("${wp.background}")` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{wp.name || `Theme ${i + 1}`}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={tempWallpaperUrl} onChange={e => setTempWallpaperUrl(e.target.value)} placeholder="Wallpaper image URL…"
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 11, outline: 'none' }} />
        <button onClick={() => { if (tempWallpaperUrl) store.setCustomWallpaper(tempWallpaperUrl); }}
          style={{ padding: '8px 14px', borderRadius: 8, background: accentColor, border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
      </div>
      <button onClick={() => fileInputRef.current?.click()}
        style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      >📁 Upload Local Image</button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLocalImageUpload} style={{ display: 'none' }} />
    </>
  );
}

function ClockTab({ clockSettings, updateClockSetting, clockFontSize, accentColor }: ClockTabProps) {
  // Live preview
  const [preview, setPreview] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setPreview(now.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit',
        ...(clockSettings.showSeconds ? { second: '2-digit' } : {}),
        hour12: !clockSettings.use24Hour,
      }));
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
          <button key={p.id} onClick={() => updateClockSetting('type', p.id)}
            className={`s-chip ${clockSettings.type === p.id ? 's-chip-active' : 's-chip-inactive'}`}
            style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: 'none' }}
          >
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px', marginBottom: 4, textAlign: 'center' }}>
        <div style={{ fontSize: clockFontSize * 0.6, fontWeight: 300, letterSpacing: '-0.03em', color: clockSettings.color || '#fff', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 16px ${clockSettings.glowColor || accentColor}` }}>
          {preview || '--:--'}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Preview</div>
      </div>

      <p className="s-section-title">Clock Options</p>
      <div className="s-card">
        <div className="s-row">
          <div><div className="s-label">24-Hour Format</div><div className="s-sublabel">e.g. 14:30 vs 2:30 PM</div></div>
          <Toggle active={!!clockSettings.use24Hour} onToggle={() => updateClockSetting('use24Hour', !clockSettings.use24Hour)} accentColor={accentColor} />
        </div>
        <div className="s-row">
          <div><div className="s-label">Show Seconds</div><div className="s-sublabel">Real-time second counter</div></div>
          <Toggle active={!!clockSettings.showSeconds} onToggle={() => updateClockSetting('showSeconds', !clockSettings.showSeconds)} accentColor={accentColor} />
        </div>
        <div className="s-row">
          <div><div className="s-label">Show Date</div><div className="s-sublabel">Display day and date below time</div></div>
          <Toggle active={clockSettings.showDate !== false} onToggle={() => updateClockSetting('showDate', !clockSettings.showDate)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Clock Font Size</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="s-label">Size</span>
            <span className="s-value">{clockFontSize}px</span>
          </div>
          <input type="range" min={24} max={96} value={clockFontSize} onChange={e => updateClockSetting('fontSize', parseInt(e.target.value))} className="s-slider" />
        </div>
      </div>

      <p className="s-section-title">Clock Colors</p>
      <div className="s-card">
        <div className="s-row">
          <div><div className="s-label">Text Color</div></div>
          <input type="color" value={clockSettings.color || '#ffffff'} onChange={e => updateClockSetting('color', e.target.value)}
            style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} />
        </div>
        <div className="s-row">
          <div><div className="s-label">Glow Color</div></div>
          <input type="color" value={clockSettings.glowColor?.startsWith('#') ? clockSettings.glowColor : '#3b82f6'} onChange={e => updateClockSetting('glowColor', e.target.value)}
            style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer', borderRadius: 6 }} />
        </div>
      </div>
    </>
  );
}

function DesktopTab({ iconSize, showDesktopGrid, taskbarPosition, taskbarHeight, dockStyle, notificationPosition, launcherPosition, setSetting, store, accentColor }: DesktopTabProps) {
  return (
    <>
      <p className="s-section-title">Icon Layout</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Icon Size</span><span className="s-value">{iconSize}px</span></div>
          <input type="range" min={48} max={120} value={iconSize} onChange={e => setSetting('iconSize', parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row">
          <div><div className="s-label">Show Grid Lines</div><div className="s-sublabel">Subtle alignment grid</div></div>
          <Toggle active={showDesktopGrid} onToggle={() => setSetting('showDesktopGrid', !showDesktopGrid)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Taskbar</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Position</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {TASKBAR_POSITIONS.map(p => (
              <button key={p.id} onClick={() => store.setDockPosition(p.id as DockPosition)}
                className={`s-chip ${taskbarPosition === p.id ? 's-chip-active' : 's-chip-inactive'}`}
                style={{ flex: 1, border: 'none' }}
              >{p.icon} {p.name}</button>
            ))}
          </div>
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Taskbar Height</span><span className="s-value">{taskbarHeight}px</span></div>
          <input type="range" min={40} max={72} value={taskbarHeight} onChange={e => setSetting('taskbarHeight', parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Dock Style</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {DOCK_STYLES.map(d => (
              <button key={d.id} onClick={() => store.setDockStyle(d.id as DockStyle)}
                className={`s-chip ${dockStyle === d.id ? 's-chip-active' : 's-chip-inactive'}`}
                style={{ border: 'none' }}>{d.name}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="s-section-title">Notifications</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Position</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {NOTIFICATION_POSITIONS.map(p => (
              <button key={p.id} className={`s-chip ${notificationPosition === p.id ? 's-chip-active' : 's-chip-inactive'}`} style={{ border: 'none', fontSize: 10 }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="s-section-title">App Launcher</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Launcher Position</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {(['bottom-left', 'bottom-right', 'center', 'top-left'] as LauncherPosition[]).map(pos => (
              <button key={pos} onClick={() => store.setLauncherPosition(pos)}
                className={`s-chip ${launcherPosition === pos ? 's-chip-active' : 's-chip-inactive'}`}
                style={{ border: 'none', fontSize: 10 }}>{pos.replace('-', ' ')}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SystemTab({ systemFontFamily, systemFontSize, uiBlur, uiOpacity, borderRadius, titlebarHeight, windowBorderGlow, windowAnimation, store, setSetting, accentColor }: SystemTabProps) {
  return (
    <>
      <p className="s-section-title">Typography</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {PREMIUM_FONTS.map(f => (
          <button key={f.value} onClick={() => store.setSystemFontFamily(f.value)}
            className={`font-card ${systemFontFamily === f.value ? 'font-card-active' : ''}`}
            style={{ border: 'none', cursor: 'pointer', color: '#fff' }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: f.value, color: systemFontFamily === f.value ? accentColor : 'rgba(255,255,255,0.85)' }}>{f.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>System Font</div>
            </div>
            <span style={{ fontSize: 20, fontFamily: f.value, color: systemFontFamily === f.value ? accentColor : 'rgba(255,255,255,0.25)' }}>{f.preview}</span>
          </button>
        ))}
      </div>

      <p className="s-section-title">Font Size</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Base Font Size</span><span className="s-value">{systemFontSize}px</span></div>
          <input type="range" min={10} max={18} value={systemFontSize} onChange={e => store.setSystemFontSize(parseInt(e.target.value))} className="s-slider" />
        </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Window Corner Radius</span><span className="s-value">{borderRadius}px</span></div>
          <input type="range" min={0} max={32} value={borderRadius} onChange={e => store.setUiBorderRadius(parseInt(e.target.value))} className="s-slider" />
        </div>
      </div>

      <p className="s-section-title">Window Chrome</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="s-label">Titlebar Height</span><span className="s-value">{titlebarHeight}px</span></div>
          <input type="range" min={28} max={56} value={titlebarHeight} onChange={e => setSetting('titlebarHeight', parseInt(e.target.value))} className="s-slider" />
        </div>
        <div className="s-row">
          <div><div className="s-label">Active Window Glow</div><div className="s-sublabel">Accent-colored border glow</div></div>
          <Toggle active={windowBorderGlow} onToggle={() => setSetting('windowBorderGlow', !windowBorderGlow)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Animation Style</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
        {WINDOW_ANIMATIONS.map(a => (
          <button key={a.id} onClick={() => store.setWindowAnimationCurve(a.id as WindowAnimationCurve)}
            className={`s-chip ${windowAnimation === a.id ? 's-chip-active' : 's-chip-inactive'}`}
            style={{ border: 'none' }}>{a.name}</button>
        ))}
      </div>
    </>
  );
}

function AdvancedTab({ reducedMotion, particleEffects, cursorStyle, setSetting, accentColor }: AdvancedTabProps) {
  return (
    <>
      <p className="s-section-title">Accessibility</p>
      <div className="s-card">
        <div className="s-row">
          <div><div className="s-label">Reduce Motion</div><div className="s-sublabel">Disable non-essential animations</div></div>
          <Toggle active={reducedMotion} onToggle={() => setSetting('reducedMotion', !reducedMotion)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Visual FX</p>
      <div className="s-card">
        <div className="s-row">
          <div><div className="s-label">Particle Effects</div><div className="s-sublabel">Ambient desktop particles</div></div>
          <Toggle active={particleEffects} onToggle={() => setSetting('particleEffects', !particleEffects)} accentColor={accentColor} />
        </div>
      </div>

      <p className="s-section-title">Cursor</p>
      <div className="s-card">
        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <span className="s-label">Cursor Style</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {CURSOR_STYLES.map(c => (
              <button key={c.id} onClick={() => setSetting('cursorStyle', c.id as CursorStyle)}
                className={`s-chip ${cursorStyle === c.id ? 's-chip-active' : 's-chip-inactive'}`}
                style={{ border: 'none', fontSize: 10 }}>{c.name}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="s-section-title">System Info</p>
      <div className="s-card">
        {[['OS Version','Troy OS v2.5.0'],['Build','20250513'],['Kernel','Troy 6.1.0-lts'],['Shell','NextShell 14'],['Renderer','WebGL 2.0']].map(([label, value]) => (
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