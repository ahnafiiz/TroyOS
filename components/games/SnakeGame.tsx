'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GRID = 20;
const TICK = 110;

type Point = { x: number; y: number };

const randFood = (snake: Point[]): Point => {
  let f: Point;
  do { f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
  while (snake.some(s => s.x === f.x && s.y === f.y));
  return f;
};

export default function SnakeGame() {
  const [snake, setSnake]   = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood]     = useState<Point>({ x: 5, y: 5 });
  const [alive, setAlive]   = useState(false);
  const [score, setScore]   = useState(0);
  const [best, setBest]     = useState(0);
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDir = useRef({ x: 1, y: 0 }); // Buffered direction to prevent double-turn bugs
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  snakeRef.current = snake;
  foodRef.current = food;

  const reset = () => {
    const s = [{ x: 10, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    setSnake(s);
    setFood(randFood(s));
    setScore(0);
    setAlive(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      const map: Record<string, Point> = {
        ArrowUp:    { x: 0,  y: -1 },
        ArrowDown:  { x: 0,  y: 1  },
        ArrowLeft:  { x: -1, y: 0  },
        ArrowRight: { x: 1,  y: 0  },
        w: { x: 0,  y: -1 },
        s: { x: 0,  y: 1  },
        a: { x: -1, y: 0  },
        d: { x: 1,  y: 0  },
      };
      const nd = map[e.key];
      if (!nd) return;
      // Prevent reversing
      if (nd.x === -d.x && nd.y === -d.y) return;
      nextDir.current = nd;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      dirRef.current = nextDir.current;
      const { x: dx, y: dy } = dirRef.current;
      setSnake(prev => {
        const head = {
          x: (prev[0].x + dx + GRID) % GRID,
          y: (prev[0].y + dy + GRID) % GRID,
        };
        if (prev.some(s => s.x === head.x && s.y === head.y)) {
          setAlive(false);
          setBest(b => Math.max(b, score));
          return prev;
        }
        const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
        const next = [head, ...prev.slice(0, ate ? undefined : -1)];
        if (ate) {
          setScore(sc => sc + 10);
          setFood(randFood(next));
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [alive, score]);

  const cellPx = 320 / GRID;

  return (
    <div style={{ height: '100%', background: '#030a05', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 }}>
      {/* Score row */}
      <div style={{ display: 'flex', gap: 28 }}>
        {[['Score', score, '#10b981'], ['Best', best, '#fbbf24']].map(([l, v, c]) => (
          <div key={String(l)} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: String(c) }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ position: 'relative', width: 320, height: 320, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Grid lines */}
        {Array.from({ length: GRID }).map((_, i) => (
          <div key={i}>
            <div style={{ position: 'absolute', left: i * cellPx, top: 0, width: 1, height: 320, background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'absolute', top: i * cellPx, left: 0, height: 1, width: 320, background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ))}

        {/* Snake */}
        {snake.map((seg, i) => (
          <div key={`${seg.x}-${seg.y}-${i}`} style={{
            position: 'absolute',
            left: seg.x * cellPx + 1, top: seg.y * cellPx + 1,
            width: cellPx - 2, height: cellPx - 2,
            background: i === 0 ? '#10b981' : `rgba(16,185,129,${0.9 - i * 0.02})`,
            borderRadius: i === 0 ? 4 : 2,
            boxShadow: i === 0 ? '0 0 10px rgba(16,185,129,0.9)' : 'none',
          }} />
        ))}

        {/* Food */}
        <div style={{
          position: 'absolute',
          left: food.x * cellPx + 1, top: food.y * cellPx + 1,
          width: cellPx - 2, height: cellPx - 2,
          background: '#ef4444', borderRadius: '50%',
          boxShadow: '0 0 10px rgba(239,68,68,0.9)',
        }} />

        {/* Overlay */}
        {!alive && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ fontSize: 36 }}>{score === 0 ? '🐍' : '💀'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
              {score === 0 ? 'Snake' : `Game Over — ${score} pts`}
            </div>
            <button onClick={reset} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '9px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {score === 0 ? '▶ Start' : '↺ Try Again'}
            </button>
          </div>
        )}
      </div>

      {/* Arrow pad */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 44px 44px', gridTemplateRows: '44px 44px', gap: 4 }}>
        {[
          { label: '▲', col: 2, row: 1, dir: { x: 0, y: -1 }, block: { x: 0, y: 1 } },
          { label: '◀', col: 1, row: 2, dir: { x: -1, y: 0 }, block: { x: 1, y: 0 } },
          { label: '▼', col: 2, row: 2, dir: { x: 0, y: 1 }, block: { x: 0, y: -1 } },
          { label: '▶', col: 3, row: 2, dir: { x: 1, y: 0 }, block: { x: -1, y: 0 } },
        ].map(btn => (
          <button key={btn.label}
            onClick={() => {
              if (!alive) return;
              const d = dirRef.current;
              if (d.x === btn.block.x && d.y === btn.block.y) return;
              nextDir.current = btn.dir;
            }}
            style={{ gridColumn: btn.col, gridRow: btn.row, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>ARROW KEYS OR WASD</div>
    </div>
  );
}