// components/apps/GamingHub.tsx
'use client';

import { useOSStore } from '@/store/useOSStore';
import { GAMES, GameConfig } from '@/config/games';
import { useMemo, useState } from 'react';

/**
 * ── TROY ARCADE (GAMING HUB V2.0) ──────────────────────────────────────
 * A premium, highly detailed console-like interface for launching web-games.
 * Features: A vibrant 'Hero' carousel, category filtering, a detailed game list,
 * an enhanced status footer, and a large library of 30+ games.
 * ────────────────────────────────────────────────────────────────────
 */

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function GamingHub() {
  const { openApp } = useOSStore();
  const [activeTab, setActiveTab] = useState('All');

  // 1. Core logic to filter and group games
  const filteredGames = useMemo(() => {
    if (activeTab === 'All') return GAMES;
    if (activeTab === 'Featured') return GAMES.filter(g => g.featured);
    return GAMES.filter(g => g.category === activeTab);
  }, [activeTab]);

  const featuredGames = useMemo(() => GAMES.filter(g => g.featured), []);

  // 2. Map of category IDs to emojis for the nav rail
  const categoryIcons: Record<string, string> = {
    'All': '🏠', 'Featured': '🌟', 'Arcade': '🕹️', 'Puzzle': '🧩', 
    'Strategy': '♟️', 'Shooter': '🔫', 'Adventure': '🗺️', 'Sports': '⚽'
  };

  const navCategories = ['All', 'Featured', ...new Set(GAMES.map(g => g.category))].sort();

  // 3. Game Launch Handler
  const launchGame = (game: GameConfig) => {
    openApp(game.id.toString(), game.name, game.emoji, game.color, 820, 680);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#0a0c10', // Ultra dark background for detail contrast
      color: '#fff',
      fontFamily: GEIST_FONT,
      overflow: 'hidden',
    }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes subtlePulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
      `}</style>

      {/* ── NARROW LEFT NAV RAIL ─────────────────────── */}
      <div style={{
        width: 80,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 0',
        gap: 20,
        background: '#0d0f14',
      }}>
        <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 10px #8b5cf666)' }}>🎮</span>
        
        {navCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'transparent', border: 'none', color: activeTab === cat ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', outline: 'none', transition: 'all 0.3s ease', opacity: activeTab === cat ? 1 : 0.7,
              width: '100%', padding: '10px 0', position: 'relative',
            }}
          >
            <div style={{ fontSize: 20, filter: activeTab === cat ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none' }}>
              {categoryIcons[cat] || '📦'}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {cat}
            </span>
            {activeTab === cat && (
              <div style={{ position: 'absolute', right: -1, top: '20%', height: '60%', width: 2, background: '#8b5cf6', borderRadius: 2 }}/>
            )}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT AREA ─────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Subtle geometric grid background overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.015,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}/>

        {/* ── MAIN HEADER ── */}
        <div style={{
          padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 5
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.35em', margin: 0 }}>
              Troy Arcade v2.5
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 0', letterSpacing: '-0.04em', color: '#fff' }}>
              Explore the Metaverse
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 30, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <span style={{ fontSize: 16 }}>🌟</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>TROY Points</span>
            <span style={{ fontSize: 16, color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>12,450 XP</span>
          </div>
        </div>

        {/* ── SCROLLABLE GAME VIEW ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', position: 'relative', zIndex: 4 }}>
          
          {/* ── 1. VIBRANT HERO CAROUSEL ── */}
          {(activeTab === 'All' || activeTab === 'Featured') && featuredGames.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 15 }}>
                {featuredGames.slice(0, 3).map((hero, i) => (
                  <div
                    key={hero.id}
                    onClick={() => launchGame(hero)}
                    style={{
                      flex: '0 0 auto', width: i === 0 ? 560 : 420, height: 260, borderRadius: 24,
                      position: 'relative', overflow: 'hidden', cursor: 'pointer',
                      border: i === 0 ? `2px solid ${hero.color}` : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: i === 0 ? `0 15px 40px -5px ${hero.color}33, 0 10px 20px -10px ${hero.color}22` : '0 10px 30px rgba(0,0,0,0.5)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 20px 50px -5px ${hero.color}44, 0 10px 20px -10px ${hero.color}33` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = i === 0 ? `0 15px 40px -5px ${hero.color}33` : '0 10px 30px rgba(0,0,0,0.5)' }}
                  >
                    {/* Background visual detail */}
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${hero.color} 0%, ${hero.color}11 100%)`, opacity: 0.15, mixBlendMode: 'plus-lighter' }} />
                    
                    {/* Large background emoji detail */}
                    <div style={{ position: 'absolute', right: -20, bottom: -40, fontSize: 180, opacity: 0.07, filter: `drop-shadow(0 0 20px ${hero.color})` }}>
                      {hero.emoji}
                    </div>

                    <div style={{ position: 'relative', zIndex: 3, padding: '30px 40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '65%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: hero.color, background: `${hero.color}22`, padding: '4px 10px', borderRadius: 20 }}>
                            {hero.featuredTag || "New Title"}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}> | {hero.category}</span>
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 900, margin: '5px 0 0', letterSpacing: '-0.04em', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {hero.name}
                        </h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
                          {hero.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ color: '#fbbf24', fontSize: 14 }}>⭐ {hero.rating}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>({hero.plays} plays)</div>
                        </div>
                        <div style={{ fontSize: 11, color: hero.color, fontWeight: 800 }}>PRESS START →</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 2. NEWLY ADDED GAMES LIST ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>
              Explore the metaverse
            </h3>
            
            {filteredGames.length > 0 ? filteredGames.map(game => (
              <div
                key={game.id}
                onClick={() => launchGame(game)}
                style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr auto auto', alignItems: 'center', gap: 20,
                  padding: '16px 20px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 20, cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = `${game.color}55`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Visual accent: game color glow */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: game.color, opacity: 0.6 }}/>
                
                {/* Visual accent: subtle repeating background emoji (hidden by default, shown on hover) */}
                <div className="hover-emoji" style={{ position: 'absolute', right: -10, top: '10%', fontSize: 50, opacity: 0, transition: 'all 0.4s ease' }}>
                  {game.emoji}
                </div>

                {/* Left side: Icon & Title */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 34, filter: `drop-shadow(0 4px 10px ${game.color}44)`
                }}>
                  {game.emoji}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                      {game.name}
                    </h4>
                    {game.featured && <span style={{ fontSize: 8, color: '#f59e0b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>FEATURED</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4, maxWidth: '90%' }}>
                    {game.description}
                  </p>
                </div>

                {/* Info and Launch button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', paddingRight: 20 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{game.plays} PLAYS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>⭐ {game.rating}</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 18px', borderRadius: 30, background: `${game.color}22`, border: `1px solid ${game.color}33`,
                  color: game.color, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  PLAY NOW
                </div>
                
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '60px 0', fontSize: 13, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12 }}>
                 No {activeTab} games in library
              </div>
            )}
          </div>
        </div>

        {/* ── ARCADE STATUS FOOTER ───────────────────────── */}
        <div style={{
          padding: '15px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#0d0f14',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>TROY CLOUD v2.5 [ ONLINE ]</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            Streaming :: {GAMES.length} titles / All Systems Nominal ::
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure the hover-emoji style is loaded (e.g., in a global CSS file or within the component)
// Within this specific setup, we'll inline a minimal global style for simplicity:
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    [onClick]:hover .hover-emoji {
      opacity: 0.1 !important;
      transform: translateX(-15px);
    }
  `;
  document.head.appendChild(style);
}