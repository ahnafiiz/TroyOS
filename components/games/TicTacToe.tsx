// components/games/TicTacToe.tsx
'use client';

import { useState } from 'react';

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const getWinner = (b: string[]): { winner: string; line: number[] } | null => {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a, c, d] };
  }
  return null;
};

export default function TicTacToe() {
  const [board, setBoard]   = useState(Array(9).fill(''));
  const [turn, setTurn]     = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);

  const play = (i: number) => {
    if (board[i] || result || isDraw) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);

    const win = getWinner(next);
    if (win) {
      setScores(s => ({ ...s, [turn]: s[turn as 'X' | 'O'] + 1 }));
    } else {
      setTurn(t => t === 'X' ? 'O' : 'X');
    }
  };

  const reset = () => { setBoard(Array(9).fill('')); setTurn('X'); };

  return (
    <div style={{ height: '100%', background: '#080a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 }}>
      {/* Score */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {(['X', 'O'] as const).map(p => (
          <div key={p} style={{ textAlign: 'center', opacity: (!result && !isDraw && turn !== p) ? 0.4 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: p === 'X' ? '#3b82f6' : '#ef4444' }}>{p}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{scores[p]}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', minHeight: 20 }}>
        {result ? `${result.winner} wins! 🎉` : isDraw ? 'Draw — nice game!' : `${turn}'s turn`}
      </div>

      {/* Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 84px)',
        gridTemplateRows: 'repeat(3, 84px)',
        gap: 6,
      }}>
        {board.map((cell, i) => {
          const isWinCell = result?.line.includes(i);
          return (
            <div
              key={i}
              onClick={() => play(i)}
              style={{
                width: 84, height: 84, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900,
                cursor: cell || result || isDraw ? 'default' : 'pointer',
                background: isWinCell
                  ? (result?.winner === 'X' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)')
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isWinCell
                  ? (result?.winner === 'X' ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)')
                  : 'rgba(255,255,255,0.08)'}`,
                color: cell === 'X' ? '#3b82f6' : '#ef4444',
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
              onMouseEnter={e => { if (!cell && !result && !isDraw) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!isWinCell) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {cell}
            </div>
          );
        })}
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        style={{
          marginTop: 4,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)',
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        NEW GAME
      </button>
    </div>
  );
}