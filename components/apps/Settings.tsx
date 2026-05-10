// components/apps/Settings.tsx
'use client';

import { useState, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS, ACCENT_COLORS } from '@/config/themes';

type CustomWP = {
  id: string;
  name: string;
  type: 'image' | 'video';
  objectUrl: string;
};

const customWallpaperStore: CustomWP[] = [];

export default function Settings() {
  const {
    wallpaperIndex, accentColor, accentName,
    setWallpaper, setAccent, addNotification,
    resetIconPositions,
  } = useOSStore();

  const [tab, setTab]             = useState<'wallpaper' | 'accents' | 'desktop' | 'about'>('wallpaper');
  const [customs, setCustoms]     = useState<CustomWP[]>([...customWallpaperStore]);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── APPLY PRESET ────────────────────────────────────────────────
  const applyPreset = (index: number) => {
    setWallpaper(index);
    setActiveId(null);
    clearCustomWallpaper();
  };

  // ── CLEAR CUSTOM WALLPAPER ──────────────────────────────────────
  const clearCustomWallpaper = () => {
    const el = document.getElementById('nexus-custom-wallpaper-style');
    if (el) el.remove();
    const vid = document.getElementById('nexus-video-wallpaper') as HTMLVideoElement | null;
    if (vid) { vid.pause(); vid.remove(); }
  };

  // ── APPLY CUSTOM WALLPAPER ──────────────────────────────────────
  const applyCustom = (wp: CustomWP) => {
    setActiveId(wp.id);
    clearCustomWallpaper();

    if (wp.type === 'image') {
      const style = document.createElement('style');
      style.id = 'nexus-custom-wallpaper-style';
      style.textContent = `
        #nexus-desktop-bg {
          background-image: url('${wp.objectUrl}') !important;
          background: none !important;
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      const style = document.createElement('style');
      style.id = 'nexus-custom-wallpaper-style';
      style.textContent = `
        #nexus-desktop-bg { opacity: 0 !important; }
        #nexus-video-wallpaper { display: block !important; }
      `;
      document.head.appendChild(style);

      let video = document.getElementById('nexus-video-wallpaper') as HTMLVideoElement | null;
      if (!video) {
        video = document.createElement('video');
        video.id = 'nexus-video-wallpaper';
        video.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0; display: none; pointer-events: none;
        `;
        document.body.prepend(video);
      }
      video.src = wp.objectUrl;
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.play().catch(() => {
        addNotification('Tap the desktop to start the video wallpaper', '▶️');
        document.addEventListener('click', () => video?.play(), { once: true });
      });
    }

    addNotification(`Wallpaper: ${wp.name}`, wp.type === 'video' ? '🎥' : '🖼️');
  };

  // ── PROCESS UPLOADED FILES ──────────────────────────────────────
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const toProcess = Array.from(files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    if (toProcess.length === 0) {
      addNotification('Please upload images or videos only', '❌');
      setUploading(false);
      return;
    }

    const tooLarge = toProcess.filter(f => f.size > 100 * 1024 * 1024);
    if (tooLarge.length > 0) {
      addNotification(`${tooLarge[0].name} is too large (max 100MB)`, '❌');
      setUploading(false);
      return;
    }

    const newWps: CustomWP[] = toProcess.map(file => ({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      objectUrl: URL.createObjectURL(file),
    }));

    customWallpaperStore.push(...newWps);
    const updated = [...customs, ...newWps];
    setCustoms(updated);
    setUploading(false);
    applyCustom(newWps[0]);
    addNotification(`${newWps.length} wallpaper${newWps.length > 1 ? 's' : ''} added`, '✅');
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── REMOVE CUSTOM ───────────────────────────────────────────────
  const removeCustom = (id: string) => {
    const wp = customs.find(w => w.id === id);
    if (wp) URL.revokeObjectURL(wp.objectUrl);
    const updated = customs.filter(w => w.id !== id);
    const idx = customWallpaperStore.findIndex(w => w.id === id);
    if (idx !== -1) customWallpaperStore.splice(idx, 1);
    setCustoms(updated);
    if (activeId === id) { setActiveId(null); clearCustomWallpaper(); }
  };

  const TABS = [
    { k: 'wallpaper' as const, l: 'Wallpaper',    e: '🖼️' },
    { k: 'accents'   as const, l: 'Accent Color', e: '🎨' },
    { k: 'desktop'   as const, l: 'Desktop',      e: '🖥️' },
    { k: 'about'     as const, l: 'About',         e: 'ℹ️' },
  ];

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13,
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ height: '100%', display: 'flex', background: '#080810', color: '#fff', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
        onChange={e => processFiles(e.target.files)} />

      {/* ── SIDEBAR ── */}
      <div style={{ width: 155, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Settings</div>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 8, cursor: 'pointer', marginBottom: 2, width: '100%',
              background: tab === t.k ? accentColor + '22' : 'transparent',
              border: `1px solid ${tab === t.k ? accentColor + '44' : 'transparent'}`,
              color: tab === t.k ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: tab === t.k ? 600 : 400,
              textAlign: 'left', transition: 'all 0.15s ease',
            }}>
            <span style={{ fontSize: 15 }}>{t.e}</span>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>

        {/* ══ WALLPAPER ══════════════════════════════════════════════ */}
        {tab === 'wallpaper' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Wallpaper</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
              Upload your own image or video, or pick a built-in preset.
            </p>

            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${dragging ? accentColor : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 16, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragging ? accentColor + '0a' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease', marginBottom: 20,
              }}>
              {uploading ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Processing...</div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🖼️</div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 4 }}>Drop image or video here</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    or click to browse — JPG, PNG, GIF, MP4, WEBM · Max 100MB
                  </div>
                </>
              )}
            </div>

            {/* Uploaded wallpapers */}
            {customs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Your Uploads</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {customs.map(wp => (
                    <div key={wp.id} style={{ position: 'relative', cursor: 'pointer' }}>
                      <div onClick={() => applyCustom(wp)}
                        style={{
                          height: 80, borderRadius: 12, overflow: 'hidden',
                          border: `2px solid ${activeId === wp.id ? accentColor : 'rgba(255,255,255,0.08)'}`,
                          background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative', transition: 'border-color 0.2s',
                        }}>
                        {wp.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={wp.objectUrl} alt={wp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <>
                            <video src={wp.objectUrl} muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 5px', fontSize: 9, color: '#fff', fontWeight: 700 }}>VIDEO</div>
                          </>
                        )}
                        {activeId === wp.id && (
                          <div style={{ position: 'absolute', inset: 0, background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 18 }}>✓</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{wp.name}</span>
                        <button onClick={e => { e.stopPropagation(); removeCustom(wp.id); }}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', padding: '0 2px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preset wallpapers */}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Built-in Presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {WALLPAPERS.map((wp, i) => (
                <div key={i} onClick={() => applyPreset(i)}
                  style={{
                    height: 80, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    background: wp.background,
                    backgroundImage: [
                      `linear-gradient(${wp.gridColor} 1px, transparent 1px)`,
                      `linear-gradient(90deg, ${wp.gridColor} 1px, transparent 1px)`,
                    ].join(','),
                    backgroundSize: '20px 20px',
                    border: `2px solid ${(wallpaperIndex === i && !activeId) ? accentColor : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'flex-end', padding: 6,
                    transition: 'border-color 0.2s, transform 0.15s',
                    position: 'relative',
                    transform: (wallpaperIndex === i && !activeId) ? 'scale(1.03)' : 'scale(1)',
                  }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                    {wp.name}
                  </span>
                  {wallpaperIndex === i && !activeId && (
                    <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 14 }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ACCENT COLOR ═══════════════════════════════════════════ */}
        {tab === 'accents' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Accent Color</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
              Changes window borders, active indicators, and highlights.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
              {ACCENT_COLORS.map(a => (
                <button key={a.value} onClick={() => { setAccent(a.value, a.name); addNotification(`Accent: ${a.name}`, '🎨'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${accentColor === a.value ? a.value + '88' : 'rgba(255,255,255,0.08)'}`,
                    color: '#fff', transition: 'all 0.15s ease',
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: a.value, flexShrink: 0,
                    boxShadow: accentColor === a.value ? `0 0 14px ${a.value}` : 'none',
                    transition: 'box-shadow 0.2s',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</span>
                  {accentColor === a.value && <span style={{ marginLeft: 'auto', color: a.value, fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Live preview */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Preview</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={{ padding: '8px 18px', borderRadius: 10, background: accentColor, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'default' }}>Primary</button>
                <button style={{ padding: '8px 18px', borderRadius: 10, background: `${accentColor}22`, border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 12, fontWeight: 700, cursor: 'default' }}>Ghost</button>
                <div style={{ padding: '8px 18px', borderRadius: 10, background: `${accentColor}15`, border: `1px solid ${accentColor}33`, color: accentColor, fontSize: 12 }}>Badge</div>
              </div>
              <div style={{ marginTop: 12, height: 3, borderRadius: 4, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}33)` }} />
            </div>
          </div>
        )}

        {/* ══ DESKTOP ════════════════════════════════════════════════ */}
        {tab === 'desktop' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Desktop</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
              Manage icon layout and desktop behaviour.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Icon Positions</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                Drag any desktop icon to reposition it anywhere on the screen.
                Positions are saved automatically during your session.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { resetIconPositions(); addNotification('Icon positions reset', '🖥️'); }}
                  style={{
                    padding: '9px 18px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  Reset to Default Layout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ ABOUT ══════════════════════════════════════════════════ */}
        {tab === 'about' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <h1 style={{
                fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px',
                background: 'linear-gradient(135deg, #fff, #3b82f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>TROY OS</h1>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Version 2.0.1 — Build 20250509</div>
            </div>
            {[
              ['System',    'Troy Quantum Core'],
              ['Kernel',    '6.8.0-troy'],
              ['Shell',     'troysh 3.2.1'],
              ['AI Engine', 'Claude Sonnet 4'],
              ['Accent',    accentName],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ color: '#fff' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}