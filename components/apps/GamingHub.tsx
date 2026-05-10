'use client';

import { useMemo, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { GAMES, GameConfig } from '@/config/games';

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function GamingHub() {
  const { openApp } = useOSStore();
  const [activeTab, setActiveTab] = useState('All');

  const filteredGames = useMemo(() => {
    if (activeTab === 'All') return GAMES;
    if (activeTab === 'Featured') return GAMES.filter(g => g.featured);
    return GAMES.filter(g => g.category === activeTab);
  }, [activeTab]);

  const featuredGames = useMemo(() => GAMES.filter(g => g.featured), []);

  const categoryIcons: Record<string, string> = {
    'All': '🏠', 'Featured': '🌟', 'Arcade': '🕹️', 'Puzzle': '🧩',
    'Strategy': '♟️', 'Shooter': '🔫', 'Adventure': '🗺️', 'Sports': '⚽'
  };

  const navCategories = ['All', 'Featured', ...new Set(GAMES.map(g => g.category))].sort();

  const launchGame = (game: GameConfig) => {
    openApp(game.id.toString(), game.name, game.emoji, game.color, 820, 680);
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
        
        /* Modernized Interactive Hover States */
        .nav-button {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-button:hover {
          color: #fff !important;
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.02);
        }
        
        .hero-banner {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-banner:hover {
          transform: translateY(-3px) scale(1.005);
        }

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
        .list-game-row:active {
          transform: scale(0.99);
        }
      `}</style>

      {/* Side Navigation Rail */}
      <div style={{
        width: 76,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        gap: 16,
        background: '#090a0e',
      }}>
        <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))', marginBottom: 12 }}>🎮</span>

        {navCategories.map(cat => {
          const isSelected = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="nav-button"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'transparent', border: 'none', color: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', outline: 'none', opacity: isSelected ? 1 : 0.6,
                width: '100%', padding: '12px 0', position: 'relative',
              }}
            >
              <div style={{ fontSize: 18, filter: isSelected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' : 'none' }}>
                {categoryIcons[cat] || '📦'}
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {cat}
              </span>
              {isSelected && (
                <div style={{ 
                  position: 'absolute', right: -1, top: '25%', height: '50%', width: 2, 
                  background: '#8b5cf6', borderRadius: 99,
                  boxShadow: '0 0 8px #8b5cf6'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Abstract Background Tech Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.012, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Global Application Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 5
        }}>
          <div>
            <p style={{ fontSize: 9, color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>
              NEXUS ARCADE v2.5
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.03em', color: '#fff' }}>
              Explore Arcade Universe
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20,
            background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)'
          }}>
            <span style={{ fontSize: 13 }}>🌟</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>XP LEVEL</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 800, letterSpacing: '-0.01em' }}>12,450 pts</span>
          </div>
        </div>

        {/* Main Content Scroll container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative', zIndex: 4 }}>

          {/* Hero Carousel Banner */}
          {(activeTab === 'All' || activeTab === 'Featured') && featuredGames.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
                {featuredGames.slice(0, 3).map((hero, i) => (
                  <div
                    key={hero.id}
                    onClick={() => launchGame(hero)}
                    className="hero-banner"
                    style={{
                      flex: '0 0 auto', width: i === 0 ? 500 : 380, height: 220, borderRadius: 16,
                      position: 'relative', overflow: 'hidden', cursor: 'pointer',
                      border: `1px solid ${i === 0 ? hero.color : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: i === 0 
                        ? `0 16px 36px -8px ${hero.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` 
                        : '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${hero.color} 0%, ${hero.color}05 100%)`, opacity: 0.12 }} />
                    <div style={{ position: 'absolute', right: -15, bottom: -30, fontSize: 150, opacity: 0.06, filter: `drop-shadow(0 0 16px ${hero.color})` }}>
                      {hero.emoji}
                    </div>
                    <div style={{ position: 'relative', zIndex: 3, padding: '24px 30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff', background: hero.color, padding: '2px 8px', borderRadius: 99 }}>
                            {(hero as any).featuredTag || 'FEATURED'}
                          </span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{hero.category}</span>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.02em', color: '#fff' }}>
                          {hero.name}
                        </h2>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {hero.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ color: '#fbbf24', fontSize: 11 }}>★ {hero.rating}</div>
                        </div>
                        <div style={{ fontSize: 9, color: hero.color, fontWeight: 800, letterSpacing: '0.05em' }}>LAUNCH MACHINE →</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List Games Catalog Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>
              All Systems Libraries
            </h3>

            {filteredGames.length > 0 ? filteredGames.map(game => (
              <div
                key={game.id}
                onClick={() => launchGame(game)}
                className="list-game-row"
                style={{
                  display: 'grid', gridTemplateColumns: '50px 1fr auto auto', alignItems: 'center', gap: 16,
                  padding: '12px 16px',
                  borderRadius: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  ['--row-accent-color' as any]: `${game.color}33`
                }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: game.color, opacity: 0.5 }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, filter: `drop-shadow(0 4px 8px ${game.color}33)` }}>
                  {game.emoji}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                      {game.name}
                    </h4>
                    {game.featured && <span style={{ fontSize: 7, color: '#fbbf24', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>FEATURED</span>}
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.3, maxWidth: '95%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {game.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end', paddingRight: 16 }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{game.plays} PLAYS</span>
                  <span style={{ color: '#fbbf24', fontSize: 11 }}>★ {game.rating}</span>
                </div>

                <div style={{
                  padding: '8px 14px', borderRadius: 99, background: `${game.color}15`, border: `1px solid ${game.color}25`,
                  color: game.color, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  PLAY
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '48px 0', fontSize: 11, border: '1px dashed rgba(255,255,255,0.04)', borderRadius: 12 }}>
                Empty dynamic directory
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Console metrics */}
        <div style={{
          padding: '12px 32px', borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#090a0e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>NEXUS NODE [ ACTIVE ]</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
            Streaming :: {GAMES.length} online configurations
          </div>
        </div>
      </div>
    </div>
  );
}