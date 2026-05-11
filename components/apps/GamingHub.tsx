'use client';

import { useMemo, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { GAMES, GameConfig } from '@/config/games';

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

const CATEGORY_ICONS: Record<string, string> = {
  'All':         '🏠',
  'Featured':    '🌟',
  'Arcade':      '🕹️',
  'Puzzle':      '🧩',
  'Strategy':    '♟️',
  'Shooter':     '🔫',
  'Adventure':   '🗺️',
  'Sports':      '⚽',
  'Multiplayer': '👥',
  'Racing':      '🏎️',
  'Sandbox':     '🧱',
  'Word':        '🔤',
  'Idle':        '⏳',
  'Casual':      '😎',
  'Rhythm':      '🎵',
  'Physics':     '💥',
  'Cloud':       '☁️',
};

export default function GamingHub() {
  const { openApp } = useOSStore();
  const [activeTab, setActiveTab] = useState('All');

  // Build nav categories: All + Featured + sorted unique categories from games
  const navCategories = useMemo(() => {
    const cats = new Set(GAMES.map(g => g.category));
    return ['All', 'Featured', ...[...cats].sort()];
  }, []);

  const filteredGames = useMemo(() => {
    if (activeTab === 'All') return GAMES;
    if (activeTab === 'Featured') return GAMES.filter(g => g.featured);
    return GAMES.filter(g => g.category === activeTab);
  }, [activeTab]);

  const featuredGames = useMemo(() => GAMES.filter(g => g.featured), []);

  const launchGame = (game: GameConfig) => {
    if (game.type === 'external' && game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    } else {
      openApp(game.id.toString(), game.name, game.emoji, game.color, 820, 680);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#07080b',
      color: '#fff',
      fontFamily: GEIST_FONT,
      overflow: 'hidden',
    }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }

        .nav-button { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .nav-button:hover { color: #fff !important; opacity: 1 !important; background: rgba(255,255,255,0.02); }

        .hero-banner { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .hero-banner:hover { transform: translateY(-3px) scale(1.005); }

        .list-game-row {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
        }
        .list-game-row:hover {
          background: rgba(255,255,255,0.03) !important;
          border-color: var(--row-accent-color) !important;
          transform: translateY(-1px);
        }
        .list-game-row:active { transform: scale(0.99); }

        .hero-scroll::-webkit-scrollbar { height: 3px; }
        .hero-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      {/* ── Side Navigation Rail ── */}
      <div style={{
        width: 76,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        gap: 4,
        background: '#090a0e',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))', marginBottom: 16 }}>🎮</span>

        {navCategories.map(cat => {
          const isSelected = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="nav-button"
              title={cat}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                background: 'transparent', border: 'none',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', outline: 'none',
                opacity: isSelected ? 1 : 0.6,
                width: '100%', padding: '10px 0', position: 'relative',
              }}
            >
              <div style={{
                fontSize: 17,
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' : 'none',
              }}>
                {CATEGORY_ICONS[cat] ?? '📦'}
              </div>
              <span style={{
                fontSize: 7, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.04em', lineHeight: 1.2, textAlign: 'center', padding: '0 4px',
              }}>
                {cat}
              </span>
              {isSelected && (
                <div style={{
                  position: 'absolute', right: -1, top: '25%', height: '50%', width: 2,
                  background: '#8b5cf6', borderRadius: 99, boxShadow: '0 0 8px #8b5cf6',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Content Viewport ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.012, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 5,
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 9, color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>
              NEXUS ARCADE v2.5
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.03em', color: '#fff' }}>
              {activeTab === 'All' ? 'Explore Arcade Universe' : activeTab === 'Featured' ? 'Featured Picks' : `${activeTab} Games`}
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 20,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 12 }}>🌟</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>LIBRARY</span>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>{GAMES.length} games</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px', position: 'relative', zIndex: 4 }}>

          {/* Hero Carousel — only on All / Featured */}
          {(activeTab === 'All' || activeTab === 'Featured') && featuredGames.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', margin: '0 0 12px' }}>
                Featured
              </p>
              <div className="hero-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
                {featuredGames.slice(0, 4).map((hero, i) => (
                  <div
                    key={hero.id}
                    onClick={() => launchGame(hero)}
                    className="hero-banner"
                    style={{
                      flex: '0 0 auto',
                      width: i === 0 ? 480 : 340,
                      height: 200,
                      borderRadius: 14,
                      position: 'relative', overflow: 'hidden', cursor: 'pointer',
                      border: `1px solid ${i === 0 ? hero.color + '60' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: i === 0
                        ? `0 16px 36px -8px ${hero.color}25, inset 0 1px 0 rgba(255,255,255,0.08)`
                        : '0 8px 24px rgba(0,0,0,0.4)',
                      background: '#0d0e14',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${hero.color}22 0%, transparent 70%)` }} />
                    <div style={{ position: 'absolute', right: -20, bottom: -30, fontSize: 130, opacity: 0.07, filter: `drop-shadow(0 0 16px ${hero.color})`, pointerEvents: 'none' }}>
                      {hero.emoji}
                    </div>
                    <div style={{ position: 'relative', zIndex: 3, padding: '22px 26px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '80%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#fff', background: hero.color, padding: '2px 8px', borderRadius: 99 }}>
                            {hero.featuredTag ?? 'FEATURED'}
                          </span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{hero.category}</span>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.02em', color: '#fff' }}>
                          {hero.name}
                        </h2>
                        <p style={{
                          fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, margin: 0,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {hero.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#fbbf24', fontSize: 11 }}>★ {hero.rating}</span>
                        <span style={{ fontSize: 9, color: hero.color, fontWeight: 800, letterSpacing: '0.05em' }}>
                          {hero.type === 'external' ? 'OPEN IN NEW TAB →' : 'LAUNCH →'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>
              {filteredGames.length} {activeTab === 'All' ? 'Total' : activeTab} Game{filteredGames.length !== 1 ? 's' : ''}
            </p>

            {filteredGames.length > 0 ? filteredGames.map(game => (
              <div
                key={game.id}
                onClick={() => launchGame(game)}
                className="list-game-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr auto auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '11px 14px',
                  borderRadius: 11,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  ['--row-accent-color' as any]: `${game.color}44`,
                }}
              >
                {/* Left accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: game.color, opacity: 0.5 }} />

                {/* Emoji */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, filter: `drop-shadow(0 4px 8px ${game.color}44)` }}>
                  {game.emoji}
                </div>

                {/* Name + description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                      {game.name}
                    </h4>
                    {game.featured && (
                      <span style={{ fontSize: 7, color: '#fbbf24', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
                        ★ FEATURED
                      </span>
                    )}
                    {game.type === 'external' && (
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
                        ↗ NEW TAB
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {game.description}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end', paddingRight: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>{game.plays} PLAYS</span>
                  <span style={{ color: '#fbbf24', fontSize: 11 }}>★ {game.rating}</span>
                </div>

                {/* Play button */}
                <div style={{
                  padding: '7px 13px', borderRadius: 99,
                  background: `${game.color}18`,
                  border: `1px solid ${game.color}30`,
                  color: game.color, fontSize: 9, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  flexShrink: 0,
                }}>
                  PLAY
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '48px 0', fontSize: 11, border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 12 }}>
                No games in this category
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 28px', borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#090a0e', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>NEXUS NODE [ ACTIVE ]</span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
            {GAMES.length} games · {GAMES.filter(g => g.type === 'builtin').length} built-in · {GAMES.filter(g => g.type === 'external').length} external
          </span>
        </div>
      </div>
    </div>
  );
}