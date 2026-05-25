"use client";

import { useEffect, useCallback } from 'react';
import { useOSStore } from '@/store/useOSStore';

/**
 * ThemeProvider — single source of truth between Zustand state and CSS.
 *
 * Every customisable value is mapped to a CSS custom property or data-*
 * attribute on <html> so ALL components automatically reflect settings
 * without prop-drilling.
 *
 * Token hierarchy:
 *   Zustand state → ThemeProvider → CSS variables on :root / [data-theme] → components
 *
 * Theme coverage:
 *   dark   — default deep-dark glass OS
 *   light  — real light mode: bright surfaces, dark text, light glass
 *   glass  — ultra-transparent glass with heavy blur
 *   neon   — hyper-dark with vivid accent glow
 *   aero   — Windows Aero-inspired with soft blue tones
 *   system — follows OS prefers-color-scheme
 *
 * FIX: Added hasHydrated guard so the effect does not run with SSR default
 * values before Zustand has rehydrated from localStorage. This prevents the
 * flash of light-mode styles (black text, bright surfaces) on hard refresh.
 * ThemeProvider now also owns the `dark` class on <html> — Desktop.tsx should
 * NOT toggle it independently.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ── Hydration guard — must be checked before reading any other state ──────
  const hasHydrated = useOSStore(s => s.hasHydrated);

  const {
    themeMode,
    isDarkMode,
    accentColor,
    uiOpacity,
    uiBlur,
    uiBorderRadius,
    windowBorderGlow,
    titlebarHeight,
    taskbarHeight,
    dockPosition,
    dockSize,
    dockStyle,
    systemFontFamily,
    systemFontSize,
    systemFontWeight,
    iconSize,
    showDesktopGrid,
    cursorStyle,
    reducedMotion,
    particleEffects,
    desktopGridOpacity,
    desktopGridColor,
  } = useOSStore();

  /** Derive full accent palette from a single hex colour */
  const deriveAccentTokens = useCallback((hex: string) => {
    const parse = (h: string): [number, number, number] => {
      const clean = h.replace('#', '');
      const full  = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean;
      const n = parseInt(full, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const clamp  = (v: number) => Math.max(0, Math.min(255, v));
    const toHex  = (r: number, g: number, b: number) =>
      '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');

    const [r, g, b] = parse(hex);
    return {
      base:     hex,
      light:    toHex(r + 30, g + 30, b + 30),
      dark:     toHex(r - 30, g - 30, b - 30),
      rgb:      `${r} ${g} ${b}`,
      muted:    `rgba(${r}, ${g}, ${b}, 0.18)`,
      border:   `rgba(${r}, ${g}, ${b}, 0.35)`,
      glow:     `rgba(${r}, ${g}, ${b}, 0.50)`,
      glowSoft: `rgba(${r}, ${g}, ${b}, 0.18)`,
    };
  }, []);

  /** Convert numeric dockSize → dock sizing tokens */
  const getDockTokens = useCallback(() => {
    const sizes = {
      small:  { height: 44, item: 32, gap: 3, padding: 3 },
      medium: { height: 54, item: 40, gap: 4, padding: 4 },
      large:  { height: 68, item: 52, gap: 6, padding: 6 },
    };
    const label: keyof typeof sizes =
      dockSize <= 44 ? 'small' : dockSize <= 56 ? 'medium' : 'large';
    return sizes[label];
  }, [dockSize]);

  useEffect(() => {
    // ── HYDRATION GUARD ─────────────────────────────────────────────────────
    // Do not apply any theme until Zustand has rehydrated from localStorage.
    // The blocking <script> in layout.tsx handles the initial dark class so
    // there is no flash of unstyled content during this wait.
    if (!hasHydrated) return;

    const root    = document.documentElement;
    const accent  = deriveAccentTokens(accentColor ?? '#3b82f6');
    const dock    = getDockTokens();
    const mode    = themeMode ?? (isDarkMode ? 'dark' : 'light');
    const blur    = uiBlur    ?? 24;
    const opacity = uiOpacity ?? 0.85;
    const isLight = mode === 'light';

    // ── 0. dark class — ThemeProvider is the single owner ──────────────────
    // Desktop.tsx must NOT also toggle this; one owner prevents race conditions.
    root.classList.toggle('dark', mode !== 'light');

    // ── 1. Accent palette ───────────────────────────────────────────────────
    root.style.setProperty('--accent',           accent.base);
    root.style.setProperty('--accent-light',     accent.light);
    root.style.setProperty('--accent-dark',      accent.dark);
    root.style.setProperty('--accent-rgb',       accent.rgb);
    root.style.setProperty('--accent-muted',     accent.muted);
    root.style.setProperty('--accent-border',    accent.border);
    root.style.setProperty('--accent-glow',      accent.glow);
    root.style.setProperty('--accent-glow-soft', accent.glowSoft);
    root.style.setProperty('--accent-color',     accent.base);
    root.style.setProperty('--accent-contrast',  '#ffffff');

    // ── 2. Glass / blur ─────────────────────────────────────────────────────
    root.style.setProperty('--glass-blur',     `${blur}px`);
    root.style.setProperty('--ui-blur',        `${blur}px`);
    root.style.setProperty('--ui-opacity',     String(opacity));
    root.style.setProperty('--glass-saturate', mode === 'glass' ? '220%' : '160%');

    // ── 3. Surface & glass bg tokens — per theme ────────────────────────────
    if (isLight) {
      // REAL light mode: bright surfaces, subtle borders
      root.style.setProperty('--surface-0',       'rgba(235, 238, 248, 1)');
      root.style.setProperty('--surface-1',       'rgba(242, 245, 254, 1)');
      root.style.setProperty('--surface-2',       'rgba(255, 255, 255, 0.97)');
      root.style.setProperty('--surface-3',       'rgba(255, 255, 255, 0.90)');
      root.style.setProperty('--surface-4',       'rgba(248, 250, 255, 0.85)');
      root.style.setProperty('--surface-5',       'rgba(228, 232, 245, 0.90)');
      root.style.setProperty('--glass-bg',        `rgba(255, 255, 255, ${Math.min(opacity, 0.88)})`);
      root.style.setProperty('--glass-bg-deep',   `rgba(238, 242, 252, ${Math.min(opacity + 0.05, 0.95)})`);
      root.style.setProperty('--glass-border',    'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--glass-border-hi', 'rgba(0, 0, 0, 0.13)');
      root.style.setProperty('--text-primary',    'rgba(12, 14, 26, 0.95)');
      root.style.setProperty('--text-secondary',  'rgba(12, 14, 26, 0.62)');
      root.style.setProperty('--text-tertiary',   'rgba(12, 14, 26, 0.40)');
      root.style.setProperty('--text-disabled',   'rgba(12, 14, 26, 0.25)');
      root.style.setProperty('--text-accent',     accent.dark);
      root.style.setProperty('--border-subtle',   'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--border-default',  'rgba(0, 0, 0, 0.09)');
      root.style.setProperty('--border-strong',   'rgba(0, 0, 0, 0.16)');
      root.style.setProperty('--shadow-xs',  '0 2px 6px   rgba(0,0,0,0.07)');
      root.style.setProperty('--shadow-sm',  '0 4px 14px  rgba(0,0,0,0.09)');
      root.style.setProperty('--shadow-md',  '0 8px 28px  rgba(0,0,0,0.11)');
      root.style.setProperty('--shadow-lg',  '0 16px 48px rgba(0,0,0,0.14)');
      root.style.setProperty('--shadow-xl',  '0 28px 72px rgba(0,0,0,0.17)');
      root.style.setProperty('--background-color', '#eef1fa');
      root.style.setProperty('--foreground-color', 'rgba(12,14,26,0.95)');

    } else if (mode === 'glass') {
      // Ultra-transparent — content shows through heavily
      root.style.setProperty('--surface-0',       'rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--surface-1',       'rgba(255,255,255,0.04)');
      root.style.setProperty('--surface-2',       'rgba(255,255,255,0.06)');
      root.style.setProperty('--surface-3',       'rgba(255,255,255,0.08)');
      root.style.setProperty('--surface-4',       'rgba(255,255,255,0.10)');
      root.style.setProperty('--surface-5',       'rgba(255,255,255,0.14)');
      root.style.setProperty('--glass-bg',        `rgba(255, 255, 255, ${Math.min(opacity * 0.10, 0.12)})`);
      root.style.setProperty('--glass-bg-deep',   `rgba(255, 255, 255, ${Math.min(opacity * 0.06, 0.08)})`);
      root.style.setProperty('--glass-border',    'rgba(255,255,255,0.12)');
      root.style.setProperty('--glass-border-hi', 'rgba(255,255,255,0.20)');
      root.style.setProperty('--text-primary',    'rgba(255,255,255,0.95)');
      root.style.setProperty('--text-secondary',  'rgba(255,255,255,0.65)');
      root.style.setProperty('--text-tertiary',   'rgba(255,255,255,0.38)');
      root.style.setProperty('--text-disabled',   'rgba(255,255,255,0.22)');
      root.style.setProperty('--text-accent',     accent.light);
      root.style.setProperty('--border-subtle',   'rgba(255,255,255,0.06)');
      root.style.setProperty('--border-default',  'rgba(255,255,255,0.10)');
      root.style.setProperty('--border-strong',   'rgba(255,255,255,0.18)');
      root.style.setProperty('--background-color', '#080a12');
      root.style.setProperty('--foreground-color', 'rgba(255,255,255,0.95)');

    } else if (mode === 'neon') {
      // Hyper-dark with vivid accent
      root.style.setProperty('--surface-0',       'rgba(2,  3,  8,  1)');
      root.style.setProperty('--surface-1',       'rgba(4,  5,  14, 0.98)');
      root.style.setProperty('--surface-2',       'rgba(6,  8,  20, 0.92)');
      root.style.setProperty('--surface-3',       'rgba(8,  10, 26, 0.88)');
      root.style.setProperty('--surface-4',       'rgba(10, 14, 32, 0.80)');
      root.style.setProperty('--surface-5',       'rgba(14, 18, 40, 0.70)');
      const bgAlpha = Math.min(opacity, 0.97);
      root.style.setProperty('--glass-bg',        `rgba(4, 5, 14, ${bgAlpha})`);
      root.style.setProperty('--glass-bg-deep',   `rgba(2, 3, 8, ${Math.min(bgAlpha + 0.02, 0.99)})`);
      root.style.setProperty('--glass-border',    accent.border);
      root.style.setProperty('--glass-border-hi', accent.glow);
      root.style.setProperty('--text-primary',    'rgba(255,255,255,0.97)');
      root.style.setProperty('--text-secondary',  'rgba(255,255,255,0.60)');
      root.style.setProperty('--text-tertiary',   'rgba(255,255,255,0.35)');
      root.style.setProperty('--text-disabled',   'rgba(255,255,255,0.20)');
      root.style.setProperty('--text-accent',     accent.light);
      root.style.setProperty('--border-subtle',   accent.muted);
      root.style.setProperty('--border-default',  accent.border);
      root.style.setProperty('--border-strong',   accent.glow);
      root.style.setProperty('--shadow-accent',   `0 0 40px ${accent.glow}, 0 0 80px ${accent.glowSoft}`);
      root.style.setProperty('--background-color', '#020308');
      root.style.setProperty('--foreground-color', 'rgba(255,255,255,0.97)');

    } else if (mode === 'aero') {
      // Windows Aero — soft blue-grey glass with subtle reflections
      root.style.setProperty('--surface-0',       'rgba(8,  12, 22, 1)');
      root.style.setProperty('--surface-1',       'rgba(12, 18, 32, 0.96)');
      root.style.setProperty('--surface-2',       'rgba(18, 26, 48, 0.88)');
      root.style.setProperty('--surface-3',       'rgba(24, 34, 60, 0.80)');
      root.style.setProperty('--surface-4',       'rgba(32, 44, 72, 0.72)');
      root.style.setProperty('--surface-5',       'rgba(40, 54, 86, 0.65)');
      root.style.setProperty('--glass-bg',        `rgba(20, 30, 55, ${opacity * 0.80})`);
      root.style.setProperty('--glass-bg-deep',   `rgba(10, 16, 34, ${Math.min(opacity, 0.92)})`);
      root.style.setProperty('--glass-border',    'rgba(120,160,255,0.15)');
      root.style.setProperty('--glass-border-hi', 'rgba(160,200,255,0.25)');
      root.style.setProperty('--text-primary',    'rgba(220,230,255,0.96)');
      root.style.setProperty('--text-secondary',  'rgba(180,200,240,0.65)');
      root.style.setProperty('--text-tertiary',   'rgba(140,165,210,0.42)');
      root.style.setProperty('--text-disabled',   'rgba(100,130,180,0.28)');
      root.style.setProperty('--text-accent',     accent.light);
      root.style.setProperty('--border-subtle',   'rgba(80,120,200,0.10)');
      root.style.setProperty('--border-default',  'rgba(100,150,220,0.16)');
      root.style.setProperty('--border-strong',   'rgba(120,170,240,0.24)');
      root.style.setProperty('--background-color', '#080c1a');
      root.style.setProperty('--foreground-color', 'rgba(220,230,255,0.96)');

    } else {
      // Default dark mode
      const bgAlpha   = Math.min(opacity, 0.97);
      const deepAlpha = Math.min(opacity + 0.08, 0.99);
      root.style.setProperty('--surface-0',       'rgba(6,  8,  14, 1)');
      root.style.setProperty('--surface-1',       'rgba(10, 13, 22, 0.98)');
      root.style.setProperty('--surface-2',       'rgba(14, 17, 28, 0.92)');
      root.style.setProperty('--surface-3',       'rgba(18, 22, 36, 0.88)');
      root.style.setProperty('--surface-4',       'rgba(24, 28, 44, 0.80)');
      root.style.setProperty('--surface-5',       'rgba(32, 38, 58, 0.70)');
      root.style.setProperty('--glass-bg',        `rgba(14, 17, 28, ${bgAlpha})`);
      root.style.setProperty('--glass-bg-deep',   `rgba(8,  10, 18, ${deepAlpha})`);
      root.style.setProperty('--glass-border',    'rgba(255,255,255,0.07)');
      root.style.setProperty('--glass-border-hi', 'rgba(255,255,255,0.12)');
      root.style.setProperty('--text-primary',    'rgba(255,255,255,0.95)');
      root.style.setProperty('--text-secondary',  'rgba(255,255,255,0.60)');
      root.style.setProperty('--text-tertiary',   'rgba(255,255,255,0.35)');
      root.style.setProperty('--text-disabled',   'rgba(255,255,255,0.20)');
      root.style.setProperty('--text-accent',     accent.light);
      root.style.setProperty('--border-subtle',   'rgba(255,255,255,0.05)');
      root.style.setProperty('--border-default',  'rgba(255,255,255,0.08)');
      root.style.setProperty('--border-strong',   'rgba(255,255,255,0.14)');
      root.style.setProperty('--shadow-xs',  '0 2px 6px   rgba(0,0,0,0.25)');
      root.style.setProperty('--shadow-sm',  '0 4px 14px  rgba(0,0,0,0.35)');
      root.style.setProperty('--shadow-md',  '0 8px 28px  rgba(0,0,0,0.45)');
      root.style.setProperty('--shadow-lg',  '0 16px 48px rgba(0,0,0,0.55)');
      root.style.setProperty('--shadow-xl',  '0 28px 72px rgba(0,0,0,0.65)');
      root.style.setProperty('--background-color', '#060810');
      root.style.setProperty('--foreground-color', 'rgba(255,255,255,0.95)');
    }

    // ── 4. Window glow ──────────────────────────────────────────────────────
    if (!windowBorderGlow) {
      root.style.setProperty('--accent-glow',      'transparent');
      root.style.setProperty('--accent-glow-soft', 'transparent');
      root.style.setProperty('--shadow-accent',    'none');
    }

    // ── 5. Border radius ────────────────────────────────────────────────────
    const radius = uiBorderRadius ?? 16;
    root.style.setProperty('--radius-window', `${radius}px`);
    root.style.setProperty('--radius-lg',     `${radius}px`);
    root.style.setProperty('--radius-md',     `${Math.max(6, radius - 4)}px`);
    root.style.setProperty('--radius-sm',     `${Math.max(4, radius - 8)}px`);
    root.style.setProperty('--border-radius', `${radius}px`);

    // ── 6. Typography ───────────────────────────────────────────────────────
    const fontSize = systemFontSize ?? 13;
    root.style.setProperty('--font-family',    systemFontFamily ?? 'var(--font-geist-sans), sans-serif');
    root.style.setProperty('--font-size-base', `${fontSize}px`);
    root.style.setProperty('--font-size',      `${fontSize}px`);
    root.style.setProperty('--font-weight',    String(systemFontWeight ?? 500));
    root.style.setProperty('--text-xs',   `${Math.round(fontSize * 0.77)}px`);
    root.style.setProperty('--text-sm',   `${Math.round(fontSize * 0.85)}px`);
    root.style.setProperty('--text-base', `${fontSize}px`);
    root.style.setProperty('--text-md',   `${Math.round(fontSize * 1.08)}px`);
    root.style.setProperty('--text-lg',   `${Math.round(fontSize * 1.23)}px`);
    root.style.setProperty('--text-xl',   `${Math.round(fontSize * 1.54)}px`);
    root.style.setProperty('--text-2xl',  `${Math.round(fontSize * 2.0)}px`);
    root.style.setProperty('--text-3xl',  `${Math.round(fontSize * 2.6)}px`);

    // ── 7. Dock ─────────────────────────────────────────────────────────────
    const effectiveDockHeight = taskbarHeight ?? dock.height;
    root.style.setProperty('--dock-height',    `${effectiveDockHeight}px`);
    root.style.setProperty('--dock-item-size', `${dock.item}px`);
    root.style.setProperty('--dock-gap',       `${dock.gap}px`);
    root.style.setProperty('--dock-padding',   `${dock.padding}px`);

    // ── 8. Window chrome ────────────────────────────────────────────────────
    root.style.setProperty('--titlebar-height', `${titlebarHeight ?? 40}px`);

    // ── 9. Icon sizing ──────────────────────────────────────────────────────
    root.style.setProperty('--icon-size', `${iconSize ?? 64}px`);

    // ── 10. Shadow depth ────────────────────────────────────────────────────
    if (!isLight) {
      const shadowAlpha = 0.3 + (1 - opacity) * 0.3;
      root.style.setProperty('--shadow-md', `0 8px  28px rgba(0,0,0,${shadowAlpha + 0.15})`);
      root.style.setProperty('--shadow-lg', `0 16px 48px rgba(0,0,0,${shadowAlpha + 0.2})`);
      root.style.setProperty('--shadow-xl', `0 28px 72px rgba(0,0,0,${shadowAlpha + 0.25})`);
    }

    // ── 11. Reduced motion — ONLY animation durations, nothing else ─────────
    root.style.setProperty('--dur-fast',   reducedMotion ? '0ms' : '120ms');
    root.style.setProperty('--dur-normal', reducedMotion ? '0ms' : '220ms');
    root.style.setProperty('--dur-slow',   reducedMotion ? '0ms' : '380ms');
    root.style.setProperty('--dur-lazy',   reducedMotion ? '0ms' : '550ms');

    // ── 12. Data attributes ─────────────────────────────────────────────────
    root.dataset.theme         = mode;
    root.dataset.reducedMotion = String(reducedMotion ?? false);
    root.dataset.cursor        = cursorStyle ?? 'default';
    root.dataset.dockPosition  = dockPosition ?? 'bottom';
    root.dataset.dockStyle     = dockStyle ?? 'glass';
    root.dataset.particles     = String(particleEffects ?? false);
    root.dataset.grid          = String(showDesktopGrid ?? true);

    // Apply background colour to body for areas outside the desktop component
    document.body.style.backgroundColor =
      isLight ? '#eef1fa' : mode === 'neon' ? '#020308' : '#060810';

  }, [
    hasHydrated, // ← guard: skip until store is ready
    accentColor,
    themeMode,
    isDarkMode,
    uiOpacity,
    uiBlur,
    uiBorderRadius,
    windowBorderGlow,
    titlebarHeight,
    taskbarHeight,
    dockPosition,
    dockSize,
    dockStyle,
    systemFontFamily,
    systemFontSize,
    systemFontWeight,
    iconSize,
    showDesktopGrid,
    cursorStyle,
    reducedMotion,
    particleEffects,
    desktopGridOpacity,
    desktopGridColor,
    deriveAccentTokens,
    getDockTokens,
  ]);

  return <>{children}</>;
}