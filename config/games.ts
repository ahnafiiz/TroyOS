export interface GameConfig {
  id: number;
  name: string;
  url: string;
  category: string;
  rating: string;
  plays: string;
  emoji: string;
  color: string;
  description: string;
  featured?: boolean;
}

export const GAMES: GameConfig[] = [
  {
    id: 1,
    name: 'Troy Cloud',
    url: 'https://www.raccoongame.com/',
    category: 'Adventure',
    rating: '4.8',
    plays: '2.4M',
    emoji: 'TROY',
    color: '#f59e0b',
    description: 'Explore the world as a crafty raccoon',
    featured: true,
  },
  {
    id: 2,
    name: '2048',
    url: 'https://play2048.co/',
    category: 'Puzzle',
    rating: '4.6',
    plays: '18M',
    emoji: '🔢',
    color: '#10b981',
    description: 'Merge tiles to reach 2048',
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
    description: 'Classic number puzzle game',
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
    description: 'Play chess against AI',
  },
  {
    id: 4,
    name: 'Slither.io',
    url: 'https://slither.io/',
    category: 'Action',
    rating: '4.5',
    plays: '30M',
    emoji: '🐍',
    color: '#ef4444',
    description: 'Massive multiplayer snake',
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
    description: 'Guess the 5-letter word',
  },
];