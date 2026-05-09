// config/games.ts
export interface GameConfig {
  id: number;
  name: string;
  url?: string;           // Only for external games
  category: string;
  rating: string;
  plays: string;
  emoji: string;
  color: string;
  description: string;
  featured?: boolean;
  featuredTag?: string;
  type: 'builtin' | 'external'; // ← NEW: controls how the game launches
}

export const GAMES: GameConfig[] = [
  // ── BUILT-IN GAMES (run natively inside Troy OS, always work) ──────
  {
    id: 10,
    name: 'Snake',
    category: 'Arcade',
    rating: '4.5',
    plays: '∞',
    emoji: '🐍',
    color: '#10b981',
    description: 'Classic snake — arrow keys or tap to control',
    type: 'builtin',
    featured: true,
    featuredTag: 'Built-in',
  },
  {
    id: 11,
    name: '2048',
    category: 'Puzzle',
    rating: '4.7',
    plays: '∞',
    emoji: '🔢',
    color: '#f59e0b',
    description: 'Merge tiles to reach 2048 — arrow keys to slide',
    type: 'builtin',
    featured: true,
    featuredTag: 'Built-in',
  },
  {
    id: 12,
    name: 'Memory Match',
    category: 'Puzzle',
    rating: '4.6',
    plays: '∞',
    emoji: '🃏',
    color: '#8b5cf6',
    description: 'Flip cards and find matching pairs',
    type: 'builtin',
  },
  {
    id: 13,
    name: 'Tic Tac Toe',
    category: 'Strategy',
    rating: '4.3',
    plays: '∞',
    emoji: '⭕',
    color: '#3b82f6',
    description: 'Classic X vs O — two player on one keyboard',
    type: 'builtin',
  },

  // ── EXTERNAL GAMES (open in new tab — cannot be embedded) ──────────
  {
    id: 1,
    name: 'Troy Cloud',
    url: 'https://www.raccoongame.com/',
    category: 'Adventure',
    rating: '4.8',
    plays: '2.4M',
    emoji: '🦝',
    color: '#f59e0b',
    description: 'Explore the world as a crafty raccoon',
    type: 'external',
    featured: true,
    featuredTag: 'Top Pick',
  },
  {
    id: 3,
    name: 'Chess',
    url: 'https://www.chess.com/play/computer',
    category: 'Strategy',
    rating: '4.9',
    plays: '50M',
    emoji: '♟️',
    color: '#8b5cf6',
    description: 'Play chess against AI — opens in new tab',
    type: 'external',
  },
  {
    id: 4,
    name: 'Slither.io',
    url: 'https://slither.io/',
    category: 'Arcade',
    rating: '4.5',
    plays: '30M',
    emoji: '🐍',
    color: '#ef4444',
    description: 'Massive multiplayer snake — opens in new tab',
    type: 'external',
  },
  {
    id: 5,
    name: 'Wordle',
    url: 'https://wordlegame.org/',
    category: 'Word',
    rating: '4.7',
    plays: '10M',
    emoji: '🔤',
    color: '#06b6d4',
    description: 'Guess the 5-letter word daily — opens in new tab',
    type: 'external',
  },
  {
    id: 6,
    name: 'Sudoku',
    url: 'https://sudoku.com/',
    category: 'Puzzle',
    rating: '4.7',
    plays: '12M',
    emoji: '🧩',
    color: '#3b82f6',
    description: 'Classic number puzzle — opens in new tab',
    type: 'external',
  },
];