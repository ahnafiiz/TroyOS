"use client";

import { useEffect, useCallback } from 'react';
import { useOSStore } from '@/store/useOSStore';

/**
 * ThemeProvider — the single source of truth between Zustand state and CSS.
 *
 * Every customizable value is mapped to a CSS custom property or data-* attribute
 * on <html> so ALL components automatically reflect settings without prop-drilling.
 *
 * Token hierarchy:
 *   Zustand state → ThemeProvider → CSS variables on :root / [data-theme] → components
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const {
    // Theme
    themeMode,
    isDarkMode,
    accentColor,

    // UI
    uiOpacity,
    uiBlur,
    uiBorderRadius,       // FIX: removed non-existent `borderRadius` — only uiBorderRadius exists on OSState
    windowBorderGlow,
    titlebarHeight,

    // Dock
    taskbarHeight,
    dockPosition,
    dockSize,
    dockStyle,

    // Typography
    systemFontFamily,
    systemFontSize,
    systemFontWeight,

    // Desktop
    iconSize,
    showDesktopGrid,
    cursorStyle,
    reducedMotion,
    particleEffects,
  } = useOSStore();

  /**
   * Derive a full accent palette from a single hex colour.
   * Returns light, dark, muted, border, glow, glow-soft variants.
   */
  const deriveAccentTokens = useCallback((hex: string) => {
    const parse = (h: string): [number, number, number] => {
      const clean = h.replace('#', '');
      const full = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean;
      const n = parseInt(full, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const clamp = (v: number) => Math.max(0, Math.min(255, v));
    const toHex = (r: number, g: number, b: number) =>
      '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');

    const [r, g, b] = parse(hex);
    const light = toHex(r + 30, g + 30, b + 30);
    const dark  = toHex(r - 30, g - 30, b - 30);

    return {
      base:      hex,
      light,
      dark,
      rgb:       `${r} ${g} ${b}`,
      muted:     `rgba(${r}, ${g}, ${b}, 0.18)`,
      border:    `rgba(${r}, ${g}, ${b}, 0.35)`,
      glow:      `rgba(${r}, ${g}, ${b}, 0.50)`,
      glowSoft:  `rgba(${r}, ${g}, ${b}, 0.18)`,
    };
  }, []);

  /**
   * Derive dock sizing tokens from the numeric dockSize store value.
   * FIX: dockSize is a number (e.g. 44 / 56 / 68), not a string key.
   * Convert to a label before indexing into the sizes map.
   */
  const getDockTokens = useCallback(() => {
    const sizes = {
      small:  { height: 44, item: 32, gap: 3, padding: 3 },
      medium: { height: 54, item: 40, gap: 4, padding: 4 },
      large:  { height: 68, item: 52, gap: 6, padding: 6 },
    };
    // FIX: convert number → "small" | "medium" | "large"
    const label: keyof typeof sizes =
      dockSize <= 44 ? 'small' : dockSize <= 56 ? 'medium' : 'large';
    return sizes[label];
  }, [dockSize]);

  /**
   * Main sync effect — runs whenever any relevant store value changes.
   */
  useEffect(() => {
    const root = document.documentElement;
    const accent = deriveAccentTokens(accentColor ?? '#3b82f6');
    const dock   = getDockTokens();

    // ── Accent palette ──────────────────────────────────────────────────────
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

    // ── Glass / blur ────────────────────────────────────────────────────────
    const blur    = uiBlur ?? 24;
    const opacity = uiOpacity ?? 0.85;

    root.style.setProperty('--glass-blur',  `${blur}px`);
    root.style.setProperty('--ui-blur',     `${blur}px`);
    root.style.setProperty('--ui-opacity',  String(opacity));

    const bgAlpha   = Math.min(opacity, 0.97);
    const deepAlpha = Math.min(opacity + 0.08, 0.99);

    if ((themeMode ?? 'dark') === 'light') {
      root.style.setProperty('--glass-bg',      `rgba(255,255,255,${bgAlpha})`);
      root.style.setProperty('--glass-bg-deep', `rgba(240,243,252,${deepAlpha})`);
    } else if (themeMode === 'glass') {
      root.style.setProperty('--glass-bg',      `rgba(255,255,255,${Math.min(opacity * 0.10, 0.12)})`);
      root.style.setProperty('--glass-bg-deep', `rgba(255,255,255,${Math.min(opacity * 0.05, 0.07)})`);
    } else {
      root.style.setProperty('--glass-bg',      `rgba(14, 17, 28, ${bgAlpha})`);
      root.style.setProperty('--glass-bg-deep', `rgba(8,  10, 18, ${deepAlpha})`);
    }

    // ── Border radius ───────────────────────────────────────────────────────
    // FIX: removed non-existent `borderRadius` — use uiBorderRadius only
    const radius = uiBorderRadius ?? 16;
    root.style.setProperty('--radius-window', `${radius}px`);
    root.style.setProperty('--radius-lg',     `${radius}px`);
    root.style.setProperty('--radius-md',     `${Math.max(6, radius - 4)}px`);
    root.style.setProperty('--radius-sm',     `${Math.max(4, radius - 8)}px`);
    root.style.setProperty('--border-radius', `${radius}px`);

    // ── Typography ──────────────────────────────────────────────────────────
    const fontSize = systemFontSize ?? 13;
    root.style.setProperty('--font-family',    systemFontFamily ?? 'var(--font-geist-sans), sans-serif');
    root.style.setProperty('--font-size-base', `${fontSize}px`);
    root.style.setProperty('--font-size',      `${fontSize}px`);
    // FIX: systemFontWeight is a number; setProperty requires a string
    root.style.setProperty('--font-weight',    String(systemFontWeight ?? 500));

    root.style.setProperty('--text-xs',   `${Math.round(fontSize * 0.77)}px`);
    root.style.setProperty('--text-sm',   `${Math.round(fontSize * 0.85)}px`);
    root.style.setProperty('--text-base', `${fontSize}px`);
    root.style.setProperty('--text-md',   `${Math.round(fontSize * 1.08)}px`);
    root.style.setProperty('--text-lg',   `${Math.round(fontSize * 1.23)}px`);
    root.style.setProperty('--text-xl',   `${Math.round(fontSize * 1.54)}px`);
    root.style.setProperty('--text-2xl',  `${Math.round(fontSize * 2.0)}px`);
    root.style.setProperty('--text-3xl',  `${Math.round(fontSize * 2.6)}px`);

    // ── Dock ─────────────────────────────────────────────────────────────────
    const effectiveDockHeight = taskbarHeight ?? dock.height;
    root.style.setProperty('--dock-height',    `${effectiveDockHeight}px`);
    root.style.setProperty('--dock-item-size', `${dock.item}px`);
    root.style.setProperty('--dock-gap',       `${dock.gap}px`);
    root.style.setProperty('--dock-padding',   `${dock.padding}px`);

    // ── Window chrome ────────────────────────────────────────────────────────
    root.style.setProperty('--titlebar-height', `${titlebarHeight ?? 40}px`);

    // ── Glow on/off ──────────────────────────────────────────────────────────
    if (!windowBorderGlow) {
      root.style.setProperty('--accent-glow',      'transparent');
      root.style.setProperty('--accent-glow-soft', 'transparent');
      root.style.setProperty('--shadow-accent',    'none');
    }

    // ── Desktop icon sizing ──────────────────────────────────────────────────
    root.style.setProperty('--icon-size', `${iconSize ?? 72}px`);

    // ── Shadow depth ─────────────────────────────────────────────────────────
    const shadowAlpha = 0.3 + (1 - opacity) * 0.3;
    root.style.setProperty('--shadow-md',  `0 8px  28px rgba(0,0,0,${shadowAlpha + 0.15})`);
    root.style.setProperty('--shadow-lg',  `0 16px 48px rgba(0,0,0,${shadowAlpha + 0.2})`);
    root.style.setProperty('--shadow-xl',  `0 28px 72px rgba(0,0,0,${shadowAlpha + 0.25})`);

    // ── Background colour ────────────────────────────────────────────────────
    if (themeMode === 'light') {
      root.style.setProperty('--background-color', '#f0f3fa');
      root.style.setProperty('--foreground-color', 'rgba(10,12,22,0.95)');
    } else if (themeMode === 'neon') {
      root.style.setProperty('--background-color', '#020308');
    } else {
      root.style.setProperty('--background-color', '#060810');
      root.style.setProperty('--foreground-color', 'rgba(255,255,255,0.95)');
    }

    // ── Data attributes ───────────────────────────────────────────────────────
    const resolvedTheme = themeMode ?? (isDarkMode ? 'dark' : 'light');
    root.dataset.theme         = resolvedTheme;
    root.dataset.reducedMotion = String(reducedMotion ?? false);
    root.dataset.cursor        = cursorStyle ?? 'default';
    root.dataset.dockPosition  = dockPosition ?? 'bottom';
    root.dataset.dockStyle     = dockStyle ?? 'floating';
    root.dataset.particles     = String(particleEffects ?? false);
    root.dataset.grid          = String(showDesktopGrid ?? true);

  }, [
    accentColor,
    themeMode,
    isDarkMode,
    uiOpacity,
    uiBlur,
    uiBorderRadius,       // FIX: removed borderRadius from dep array
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
    deriveAccentTokens,
    getDockTokens,
  ]);

  return <>{children}</>;
}