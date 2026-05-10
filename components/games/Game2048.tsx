// components/games/Game2048.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Grid = number[][];

const newGrid = (): Grid => Array(4).fill(null).map(() => Array(4).fill(0));

const addTile = (g: Grid): Grid => {
  const empties: [number, number][] = [];
  g.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
  if (!empties.length) return g;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = g.map(row => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const slideLeft = (row: number[]): { row: number[]; gained: number } => {
  const vals = row.filter(Boolean);
  let gained = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < vals.length) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      const v = vals[i] * 2;
      merged.push(v);
      gained += v;
      i += 2;
    } else {
      merged.push(vals[i++]);
    }
  }
  return { row: [...merged, ...Array(4 - merged.length).fill(0)], gained };
};

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  0:    { bg: 'rgba(255,255,255,0.04)', fg: 'transparent' },
  2:    { bg: '#eee4da', fg: '#776e65' },
  4:    { bg: '#ede0c8', fg: '#776e65' },
  8:    { bg: '#f2b179', fg: '#fff' },
  16:   { bg: '#f59563', fg: '#fff' },
  32:   { bg: '#f67c5f', fg: '#fff' },
  64:   { bg: '#f65e3b', fg: '#fff' },
  128:  { bg: '#edcf72', fg: '#fff' },
  256:  { bg: '#edcc61', fg: '#fff' },
  512:  { bg: '#edc850', fg: '#fff' },
  1024: { bg: '#edc53f', fg: '#fff' },
  2048: { bg: '#edc22e', fg: '#fff' },
};

export default function Game2048() {
  const [grid, setGrid]   = useState<Grid>(() => addTile(addTile(newGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest]   = useState(0);
  const [won, setWon]     = useState(false);

  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const move = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    setGrid(prev => {
      let g = prev.map(r => [...r]);
      let totalGained = 0;

      const rotateRight = (m: Grid): Grid => m[0].map((_, i) => m.map(r => r[i]).reverse());
      const rotateLeft  = (m: Grid): Grid => m[0].map((_, i) => m.map(r => r[r.length - 1 - i]));

      if (dir === 'right') g = rotateRight(rotateRight(g));
      if (dir === 'up')    g = rotateLeft(g);
      if (dir === 'down')  g = rotateRight(g);

      g = g.map(row => {
        const { row: slid, gained } = slideLeft(row);
        totalGained += gained;
        return slid;
      });

      if (dir === 'right') g = rotateRight(rotateRight(g));
      if (dir === 'up')    g = rotateRight(g);
      if (dir === 'down')  g = rotateLeft(g);

      const changed = JSON.stringify(g) !== JSON.stringify(prev);
      if (!changed) return prev;

      setScore(s => {
        const next = s + totalGained;
        setBest(b => Math.max(b, next));
        return next;
      });

      if (g.flat().includes(2048)) setWon(true);
      return addTile(g);
    });
  }, []);

  // ── Keyboard ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  // ── Mouse swipe handlers ─────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = null;

    const minSwipe = 30;
    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  };

  const onMouseLeave = () => { dragStart.current = null; };

  const reset = () => {
    setGrid(addTile(addTile(newGrid())));
    setScore(0);
    setWon(false);
  };

  return (
    <div style={{ height: '100%', background: '#faf8ef', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 320 }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: '#776e65', flex: 1 }}>2048</span>
        {[['SCORE', score], ['BEST', best]].map(([l, v]) => (
          <div key={String(l)} style={{ background: '#bbada0', borderRadius: 8, padding: '4px 14px', textAlign: 'center', minWidth: 64 }}>
            <div style={{ fontSize: 9, color: '#eee4da', fontWeight: 800, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>{v}</div>
          </div>
        ))}
        <button onClick={reset} style={{ background: '#8f7a66', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
          New
        </button>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 10, color: '#a09080', letterSpacing: '0.05em' }}>
        Arrow keys · click &amp; drag to swipe
      </div>

      {/* Board — swipeable */}
      <div
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{
          background: '#bbada0',
          borderRadius: 12,
          padding: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 72px)',
          gap: 8,
          position: 'relative',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {grid.flat().map((val, i) => {
          const tc = TILE_COLORS[val] || { bg: '#3c3a32', fg: '#fff' };
          return (
            <div key={i} style={{
              width: 72, height: 72, borderRadius: 8,
              background: tc.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: val >= 1024 ? 18 : val >= 128 ? 22 : 26,
              fontWeight: 900,
              color: val ? tc.fg : 'transparent',
              transition: 'background 0.1s ease',
            }}>
              {val || ''}
            </div>
          );
        })}

        {won && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(237,197,63,0.85)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>You Win! 🎉</div>
            <button onClick={reset} style={{ background: '#8f7a66', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Arrow button controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 44px 44px', gridTemplateRows: '44px 44px', gap: 4 }}>
        {[
          { l: '▲', col: 2, row: 1, d: 'up'    as const },
          { l: '◀', col: 1, row: 2, d: 'left'  as const },
          { l: '▼', col: 2, row: 2, d: 'down'  as const },
          { l: '▶', col: 3, row: 2, d: 'right' as const },
        ].map(b => (
          <button key={b.l} onClick={() => move(b.d)}
            style={{ gridColumn: b.col, gridRow: b.row, background: '#bbada0', border: 'none', borderRadius: 8, fontSize: 16, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            {b.l}
          </button>
        ))}
      </div>
    </div>
  );
}