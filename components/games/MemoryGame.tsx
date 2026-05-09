'use client';

import { useState } from 'react';

const SYMBOLS = ['🚀', '🌙', '⭐', '🎮', '🤖', '🌊', '🔮', '💎', '🎯', '🦊'];

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };

const makeDeck = (): Card[] =>
  [...SYMBOLS, ...SYMBOLS]
    .sort(() => Math.random() - 0.5)
    .map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));

export default function MemoryGame() {
  const [cards, setCards]   = useState<Card[]>(makeDeck());
  const [picks, setPicks]   = useState<number[]>([]);
  const [moves, setMoves]   = useState(0);
  const [locked, setLocked] = useState(false);

  const matched = cards.filter(c => c.matched).length / 2;
  const won = matched === SYMBOLS.length;

  const flip = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (locked || !card || card.flipped || card.matched) return;

    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const nextPicks = [...picks, id];
    setCards(next);
    setPicks(nextPicks);

    if (nextPicks.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = nextPicks.map(pid => next.find(c => c.id === pid)!);
      setTimeout(() => {
        setCards(prev => prev.map(c => {
          if (c.id !== a.id && c.id !== b.id) return c;
          return a.symbol === b.symbol
            ? { ...c, matched: true }
            : { ...c, flipped: false };
        }));
        setPicks([]);
        setLocked(false);
      }, 750);
    }
  };

  const reset = () => { setCards(makeDeck()); setPicks([]); setMoves(0); setLocked(false); };

  return (
    <div style={{ height: '100%', background: '#0a0810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {[['Moves', moves, '#8b5cf6'], ['Pairs', `${matched}/${SYMBOLS.length}`, '#10b981']].map(([l, v, c]) => (
          <div key={String(l)} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: String(c) }}>{v}</div>
          </div>
        ))}
        <button onClick={reset} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
          Shuffle
        </button>
      </div>

      {/* Cards grid — 5 cols × 4 rows for 20 cards (10 pairs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => flip(card.id)}
            style={{
              width: 58, height: 58, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, cursor: card.matched ? 'default' : 'pointer',
              background: card.matched
                ? 'rgba(16,185,129,0.15)'
                : card.flipped
                ? 'rgba(139,92,246,0.25)'
                : 'rgba(255,255,255,0.06)',
              border: `1px solid ${card.matched
                ? 'rgba(16,185,129,0.4)'
                : card.flipped
                ? 'rgba(139,92,246,0.5)'
                : 'rgba(255,255,255,0.08)'}`,
              transform: card.flipped || card.matched ? 'scale(1)' : 'scale(0.94)