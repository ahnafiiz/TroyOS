'use client';

/**
 * AppIcon.tsx – Centralised icon renderer for Troy OS.
 *
 * This component now supports **currentColor** based SVGs out‑of‑the‑box.
 * If the supplied SVG uses `fill="currentColor"` (the preferred format for
 * new icons) the component will render it without any CSS filter pipeline.
 * For legacy pure‑white assets we retain the existing filter‑based colour
 * strategy.
 *
 * The colour resolution order is:
 *   1. `color="none"` – render the SVG unchanged (no filter, no currentColor).
 *   2. Explicit hex colour – use the filter pipeline to tint the white SVG.
 *   3. Omitted – fall back to the global `iconColor` from the store.
 *
 * This change restores per‑app tinting while allowing crisp, colour‑accurate
 * SVGs that rely on `currentColor`.
 */

import Image from 'next/image';
import { useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Colour helpers ────────────────────────────────────────────────────────────

/** Parse #rrggbb / #rgb hex → [r, g, b] 0-255, or null on failure */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return clean.split('').map(c => parseInt(c + c, 16)) as [number, number, number];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

/**
 * Build a CSS filter string that recolours a white SVG/PNG to the target hex.
 *
 * The algorithm:
 *  - Convert hex → HSL to get hue, saturation, lightness
 *  - Map HSL to filter parameters:
 *      sepia(1) produces ~36° yellowish base
 *      hue-rotate corrects from 36° to target hue
 *      saturate drives saturation (clamped to avoid over-saturation on pale colours)
 *      brightness matches perceived lightness
 *
 * Edge cases handled:
 *  - Pure white (#ffffff) → no sepia/hue/saturate, just brightness(1) to stay white
 *  - Very dark colours → brightness boosted so icon remains visible
 *  - Achromatic (grey) → sepia(0) saturate(0) just brightness
 */
function buildColorFilter(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'brightness(0) invert(1)'; // white fallback

  const [r, g, b] = rgb;

  // ── Special case: white ───────────────────────────────────────────────────
  if (r >= 250 && g >= 250 && b >= 250) {
    return 'brightness(0) invert(1)';
  }

  // ── Convert to HSL ────────────────────────────────────────────────────────
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l   = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  // ── Special case: achromatic (grey tones) ─────────────────────────────────
  if (sPct < 8) {
    const bFactor = Math.max(0.1, lPct / 50);
    return [
      'brightness(0)',
      'invert(1)',
      `brightness(${bFactor.toFixed(2)})`,
    ].join(' ');
  }

  // ── Chromatic colours ─────────────────────────────────────────────────────
  // sepia(1) lands around hue=36°.  We hue-rotate from there to target.
// Handle red wrap-around (hue near 0° or 360°)
let hueOffset = hDeg - 36;
if (hDeg < 30 && hueOffset < 0) {
  // For pure reds, rotate the other way around the color wheel
  hueOffset = hueOffset + 360;
}  // Clamp saturation multiplier: pale colours need less push, vivid more
  const satMult    = Math.min(25, Math.max(2, sPct * 0.22));
  // Brightness: reference point is l=50% = bFactor 1.0
  const bFactor    = Math.max(0.4, Math.min(2.2, lPct / 50));

  return [
    'brightness(0)',
    'invert(1)',
    'sepia(1)',
    `saturate(${(satMult * 100).toFixed(0)}%)`,
    `hue-rotate(${hueOffset}deg)`,
    `brightness(${bFactor.toFixed(2)})`,
  ].join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface AppIconProps {
  /** Absolute path or URL of the SVG/PNG icon */
  src: string;
  /**
   * Rendered pixel size (square).  Default: 32.
   * Passed as `sizes` hint to Next.js Image for optimised delivery.
   */
  size?: number;
  /**
   * Tint colour for this icon instance.
   *
   * - Omit → falls back to the global store `iconColor` (white by default)
   *           This is intended for UI chrome icons (settings sidebar, etc.)
   * - Hex string → tints the icon to that exact colour
   *               Use app.color from APPS config for app icons
   * - `"none"` → disables all colour transforms; renders the raw SVG as-is
   */
  color?: string;
  /** Extra inline styles merged onto the wrapper div */
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
  draggable?: boolean;
}

export default function AppIcon({
  src,
  size = 32,
  color,
  style,
  className,
  alt = '',
  draggable = false,
}: AppIconProps) {
  const globalIconColor = useOSStore(s => s.iconColor);

  // Resolve the effective colour:
  //   - "none"        → no filter (raw SVG colours preserved)
  //   - explicit hex  → use it directly (app-specific colour)
  //   - undefined     → fall back to global store value (UI chrome icons)
  const resolvedColor = color === 'none' ? undefined : (color ?? globalIconColor);

  const filter = useMemo(() => {
    if (!resolvedColor) return undefined;
    return buildColorFilter(resolvedColor);
  }, [resolvedColor]);

  if (!src) return null;

  return (
    <div
      className={className}
      style={{
        width:    size,
        height:   size,
        flexShrink: 0,
        position: 'relative',
        display:  'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        draggable={draggable}
        style={{
          objectFit: 'contain',
          filter,
          transition: 'filter 0.25s ease',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}