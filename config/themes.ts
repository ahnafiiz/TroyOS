// =====================================================
// TROY OS — WALLPAPERS + ACCENT COLORS
// =====================================================

export interface Theme {
  name: string;

  // Full CSS background string
  // Supports:
  // - gradients
  // - image URLs
  // - solid colors
  background: string;

  // Desktop grid overlay color
  gridColor: string;
}

export interface AccentColor {
  name: string;
  value: string;
}

// =====================================================
// WALLPAPERS
// =====================================================

  export const WALLPAPERS = [
  {
    id: 0,
    name: 'base - 1',
    background: 'https://blogger.googleusercontent.com/img/a/AVvXsEhcKwI-zoO6Gb1kDJ3E6DgZpcDdilvJQBgGJDQK9XXHkOJUH4jyb2acHNMR2aECkWHqn2RP8K2Uii5IKkV7S2eYNO0FCL-3DNdGvLyoPrNULqNrhVhlhVBQMDX8SUChrJdPT9g89caLFWLRI0vGYaGHbVY6SXHT2QdqeT4IzWdoaKIX6kAlU9Lsc0zMXu0=s16000',
    gridColor: 'rgba(255,255,255,0.05)'
  },

  {
    id: 1,
    name: 'base - 2',
    background: 'https://images.alphacoders.com/127/thumb-1920-1276648.png',
    gridColor: 'rgba(255,255,255,0.05)'
  },

  {
    id: 2,
    name: 'Green Nature',
    background: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
    gridColor: 'rgba(255,255,255,0.05)'
  },

   {
    id: 3,
    name: 'Mclaren F1 Sao Paulo',
    background: 'https://images.pexels.com/photos/34835669/pexels-photo-34835669.jpeg',
    gridColor: 'rgba(255,255,255,0.05)'
  },

  {
    id: 4,
    name: 'Formula 1',
    background: 'https://images.pexels.com/photos/34722679/pexels-photo-34722679.jpeg',
    gridColor: 'rgba(255,255,255,0.05)'
  },

    {
    id: 5,
    name: 'Pink Clouds',
    background: '/wallpapers/pink-clouds.jpg',
    gridColor: 'rgba(255,255,255,0.05)'
  },
]

// =====================================================
// ACCENT COLORS
// =====================================================

export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Blue',
    value: '#3b82f6',
  },

  {
    name: 'Cyan',
    value: '#06b6d4',
  },

  {
    name: 'Purple',
    value: '#8b5cf6',
  },

  {
    name: 'Green',
    value: '#10b981',
  },

  {
    name: 'Orange',
    value: '#f59e0b',
  },

  {
    name: 'Pink',
    value: '#ec4899',
  },

  {
    name: 'Red',
    value: '#ef4444',
  },

  {
    name: 'Indigo',
    value: '#6366f1',
  },

  {
    name: 'Lime',
    value: '#84cc16',
  },

  {
    name: 'Coral',
    value: '#f97316',
  },
];

// =====================================================
// DEFAULT SETTINGS
// =====================================================

export const DEFAULTS = {
  wallpaperIndex: 0,

  accentColor: '#3b82f6',

  accentName: 'Blue',
};