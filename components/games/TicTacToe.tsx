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
        {result ? `${result.winner} wins! 🎉` : isDraw ? "Draw — nice game!" : `${turn}'s turn`}
      </div>

      {/* Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 84px)', gridTemplateRows