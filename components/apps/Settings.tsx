'use client';

import React, { useState, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';

// 5 Curated Ultra-Modern Next.js native fonts + elegant system fallbacks
const PREMIUM_FONTS = [
  { name: 'Montserrat', value: 'var(--font-montserrat), sans-serif' },
  { name: 'Inter', value: 'var(--font-inter), sans-serif' },
  { name: 'Geist Sans', value: 'var(--font-geist-sans), sans-serif' },
  { name: 'Fira Code', value: 'var(--font-fira-code), monospace' },
  { name: 'Syncopate', value: 'var(--font-syncopate), sans-serif' },
  { name: 'Playfair Serif', value: 'var(--font-playfair), Georgia, serif' }
];

const CLOCK_PRESETS = [
  { id: 'hud', name: 'Digital HUD' },
  { id: 'glass', name: 'Aero Glass' },
  { id: 'retro', name: 'Synthwave' },
  { id: 'minimal', name: 'True Minimalist' }
];

export default function Settings() {
  const store = useOSStore();
  const [activeTab, setActiveTab] = useState<'canvas' | 'clock' | 'engine'>('canvas');
  const [tempWallpaperUrl, setTempWallpaperUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic values connected directly to Zustand
  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const accentColor = store.accentColor || '#3b82f6';
  const uiBlur = store.uiBlur ?? 24;
  const uiOpacity = store.uiOpacity ?? 0.75;

  // Access or fallback safely to clockSettings in store
  const clockSettings = store.clockSettings || {
    type: 'hud',
    color: '#ffffff',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    use24Hour: true
  };

  const updateClockSetting = (key: string, value: any) => {
    if (typeof store.setClockSettings === 'function') {
      store.setClockSettings({
        ...clockSettings,
        [key]: value
      });
    }
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        store.setCustomWallpaper(base64Url);
        store.addNotification?.('Custom wallpaper loaded successfully', '🖼️');
      }
    };
    reader.readAsDataURL(file);
  };

  // Master Engine System Reset Event Trigger
  const handleMasterSystemReset = () => {
    if (window.confirm('Are you sure you want to restore all OS custom settings back to defaults?')) {
      store.setSystemFontFamily?.('var(--font-geist-sans), sans-serif');
      store.setAccentColor?.('#3b82f6', 'Default');
      store.setUIBlur?.(24);
      store.setUIOpacity?.(0.75);
      store.setWallpaperIndex?.(0);
      store.setCustomWallpaper?.('');
      if (typeof store.setClockSettings === 'function') {
        store.setClockSettings({
          type: 'hud',
          color: '#ffffff',
          glowColor: 'rgba(59, 130, 246, 0.5)',
          use24Hour: true
        });
      }
      setTempWallpaperUrl('');
      store.addNotification?.('System layout properties successfully initialized', '⚙️');
    }
  };

  const tabStyle = (tabId: typeof activeTab) => ({
    padding: '14px 18px',
    borderRadius: '12px',
    background: activeTab === tabId ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))' : 'transparent',
    color: activeTab === tabId ? '#fff' : 'rgba(255, 255, 255, 0.45)',
    border: activeTab === tabId ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: activeTab === tabId ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
  });

  return (
    <div 
      className="troy-settings-container"
      style={{
        height: '100%',
        background: 'rgba(10, 12, 18, 0.4)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        color: '#fff',
      }}
    >
      {/* Dynamic Range Slider, Form Inputs, and Global Font Override Injections */}
      <style>{`
        /* FORCES ALL INNER DESK CONTROLS TO COMPLY TO THE ACCENT SELECTION */
        .troy-settings-container,
        .troy-settings-container * {
          font-family: ${systemFontFamily} !important;
        }

        .modern-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1) !important;
          outline: none;
          transition: background 0.3s;
        }
        .modern-slider:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }
        .modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accentColor} !important;
          cursor: pointer;
          border: 2px solid #0d0e12;
          box-shadow: 0 0 10px ${accentColor}88;
          transition: transform 0.1s, background-color 0.2s;
        }
        .modern-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
        }
        .modern-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accentColor} !important;
          cursor: pointer;
          border: 2px solid #0d0e12;
          box-shadow: 0 0 10px ${accentColor}88;
          transition: transform 0.1s, background-color 0.2s;
        }
        .modern-slider::-moz-range-thumb:hover {
          transform: scale(1.25);
        }
      `}</style>

      {/* Sidebar Navigation */}
      <div style={{
        width: 200,
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.15em' }}>TROY OS</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>Control Deck</div>
          </div>
          
          <button onClick={() => setActiveTab('canvas')} style={tabStyle('canvas')}>
            <span>🎨</span> Canvas Style
          </button>
          <button onClick={() => setActiveTab('clock')} style={tabStyle('clock')}>
            <span>🕒</span> Clock Settings
          </button>
          <button onClick={() => setActiveTab('engine')} style={tabStyle('engine')}>
            <span>⚙️</span> OS Customizer
          </button>
        </div>

        {/* Master System Reset Button Placement */}
        <div style={{ padding: '0 8px', marginTop: 'auto' }}>
          <button
            onClick={handleMasterSystemReset}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#ef4444',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            ⚠️ Reset All Settings
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{
        flex: 1,
        padding: '36px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '36px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(0,0,0,0.2) 100%)'
      }}>
        {/* ─── TAB: CANVAS STYLE ─── */}
        {activeTab === 'canvas' && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
                  Interactive Wallpaper Core
                </h3>
                {store.customWallpaper && (
                  <button 
                    onClick={() => store.setCustomWallpaper('')}
                    style={{ background: 'transparent', border: 'none', color: accentColor, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reset Wallpaper
                  </button>
                )}
              </div>
              
              {/* Presets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {WALLPAPERS.map((wp, index) => {
                  const isActive = store.wallpaperIndex === index && !store.customWallpaper;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        store.setWallpaperIndex(index);
                        store.setCustomWallpaper('');
                      }}
                      style={{
                        border: isActive ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        height: '64px',
                        background: wp.background.includes('url') || wp.background.startsWith('/')
                          ? `url(${wp.background.replace('/public/', '/')}) center/cover`
                          : wp.background,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isActive ? `0 10px 25px ${accentColor}44` : 'none',
                      }}
                      title={wp.name}
                    />
                  );
                })}
              </div>

              {/* Upload & Import */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLocalImageUpload} style={{ display: 'none' }} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    🖼️ Import Saved Picture
                  </button>

                  <select
                    value={store.wallpaperStyle || 'fill'}
                    onChange={(e) => store.setWallpaperStyle?.(e.target.value as any)}
                    style={{
                      width: '120px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="fill" style={{ background: '#0a0c12' }}>Fill Scale</option>
                    <option value="fit" style={{ background: '#0a0c12' }}>Fit Scale</option>
                    <option value="stretch" style={{ background: '#0a0c12' }}>Stretch</option>
                    <option value="tile" style={{ background: '#0a0c12' }}>Tile Wrap</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                  <input
                    type="text"
                    placeholder="Or inject a remote image web URL..."
                    value={tempWallpaperUrl}
                    onChange={(e) => setTempWallpaperUrl(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempWallpaperUrl.trim()) {
                        store.setCustomWallpaper(tempWallpaperUrl.trim());
                        store.addNotification?.('Remote wallpaper applied!', '🌐');
                      }
                    }}
                    style={{
                      background: accentColor,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Accent Picker */}
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Accent Core Highlight
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => store.setAccentColor?.(e.target.value, 'Custom')}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      width: '68px',
                      height: '68px',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Dynamic Engine Spectrum</div>
                  <div style={{ fontSize: '11px', color: accentColor, fontFamily: 'monospace !important', fontWeight: 700, marginTop: '2px' }}>{accentColor}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── TAB: CLOCK SETTINGS ─── */}
        {activeTab === 'clock' && (
          <>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Desktop Clock Aesthetic
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {CLOCK_PRESETS.map(preset => {
                  const isActive = clockSettings.type === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => updateClockSetting('type', preset.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: isActive ? accentColor : 'rgba(255,255,255,0.03)',
                        border: isActive ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.06)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        boxShadow: isActive ? `0 10px 20px ${accentColor}33` : 'none',
                      }}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Clock Chromatic Styles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Clock Color Scheme</span>
                  <input
                    type="color"
                    value={clockSettings.color || '#ffffff'}
                    onChange={(e) => updateClockSetting('color', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '36px', height: '36px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Glow Aura Color</span>
                  <input
                    type="color"
                    value={clockSettings.glowColor?.startsWith('#') ? clockSettings.glowColor : '#3b82f6'}
                    onChange={(e) => updateClockSetting('glowColor', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '36px', height: '36px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }} onClick={() => updateClockSetting('use24Hour', !clockSettings.use24Hour)}>
                  <div style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: '12px',
                    background: clockSettings.use24Hour ? accentColor : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '3px',
                      left: clockSettings.use24Hour ? '21px' : '3px',
                      transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                  <label style={{ fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Use 24-Hour Military Format</label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── TAB: OS ENGINE (CLEAN CUSTOMIZATION) ─── */}
        {activeTab === 'engine' && (
          <>
            {/* System Typography */}
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Premium Typography
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                <div>
                  <label style={{ fontSize: '11px', display: 'block', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Font Face Family</label>
                  <select
                    value={systemFontFamily}
                    onChange={(e) => store.setSystemFontFamily?.(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {PREMIUM_FONTS.map(font => (
                      <option key={font.name} value={font.value} style={{ background: '#0a0c12' }}>{font.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Backdrop Settings */}
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Glassmorphic Composite Values
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                    <span>Backdrop Blur Filter Strength</span>
                    <span style={{ color: accentColor, fontWeight: 800 }}>{uiBlur}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={uiBlur} 
                    onChange={(e) => store.setUIBlur?.(parseInt(e.target.value) || 0)} 
                    className="modern-slider"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                    <span>Dock Backdrop Transparency</span>
                    <span style={{ color: accentColor, fontWeight: 800 }}>{Math.round(uiOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={Math.round(uiOpacity * 100)} 
                    onChange={(e) => store.setUIOpacity?.(parseInt(e.target.value) / 100)} 
                    className="modern-slider"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}