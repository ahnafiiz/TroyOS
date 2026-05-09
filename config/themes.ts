// config/themes.ts
// =====================================================
// ✏️  EDIT THIS FILE to change colors and wallpapers!
// =====================================================

export interface Theme {
  name: string;
  background: string;   // CSS for the desktop wallpaper
  gridColor: string;    // Color of the grid dots on desktop
}

export interface AccentColor {
  name: string;
  value: string;        // Hex color code
}

// Desktop wallpapers — these are CSS gradients
// ✏️ Add your own gradient, or use a URL to an image
export const WALLPAPERS: Theme[] = [
  {
    name: 'Midnight',
    // CSS radial gradient — two circles of color blending together
    background: `
      radial-gradient(ellipse at 20% 40%, #0d1b2a 0%, #050508 55%),
      radial-gradient(ellipse at 80% 10%, #0a0f20 0%, transparent 45%)
    `,
    gridColor: 'rgba(59, 130, 246, 0.025)',
  },
  {
    name: 'Aurora',
    background: `
      radial-gradient(ellipse at 30% 70%, #0a1628 0%, #050508 50%),
      radial-gradient(ellipse at 70% 20%, #160828 0%, transparent 45%)
    `,
    gridColor: 'rgba(139, 92, 246, 0.03)',
  },
  {
    name: 'Nebula',
    background: `
      radial-gradient(ellipse at 60% 40%, #0e0820 0%, #050508 55%),
      radial-gradient(ellipse at 20% 80%, #081520 0%, transparent 40%)
    `,
    gridColor: 'rgba(6, 182, 212, 0.025)',
  },
  {
    name: 'Void',
    background: '#040406',
    gridColor: 'rgba(255, 255, 255, 0.02)',
  },
  {
    name: 'Cosmos',
    background: `radial-gradient(ellipse at 50% 50%, #080f1e 0%, #040408 60%)`,
    gridColor: 'rgba(59, 130, 246, 0.03)',
  },

  // ─── ✏️ ADD YOUR OWN WALLPAPER ──────────────────────
  // {
  //   name: 'My Wallpaper',
  //   background: 'radial-gradient(ellipse at 50% 0%, #1a0030 0%, #040408 60%)',
  //   gridColor: 'rgba(236, 72, 153, 0.03)',
  // },
  //
  // To use an image file instead of a gradient:
  // background: 'url(/wallpapers/my-image.jpg) center/cover no-repeat',
];

// Accent colors available in Settings
// ✏️ Add any hex color you want here
export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Blue',   value: '#3b82f6' },
  { name: 'Cyan',   value: '#06b6d4' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green',  value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink',   value: '#ec4899' },
  { name: 'Red',    value: '#ef4444' },
  // { name: 'My Color', value: '#ff6600' },  // ✏️ Add yours here
];

// Default values when the OS first loads
export const DEFAULTS = {
  wallpaperIndex: 0,           // Index in WALLPAPERS array above
  accentColor: '#3b82f6',      // Must match one of the ACCENT_COLORS values
  accentName: 'Blue',
};