'use client';

/**
 * AppIcon.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Centralised icon renderer for Troy OS.
 *
 * Strategy: CSS `filter` pipeline
 *   1. `brightness(0)` → forces every SVG pixel to black (handles all SVG colours)
 *   2. `invert(1)`     → flips black → white
 *   3. Then we apply a colour-shift matrix to tint from white to any target hue.
 *
 * This works automatically for EVERY SVG without touching the source files.
 *
 * The tint is derived from a hex colour string by decomposing it into individual
 * hue/saturation shifts applied via `sepia`, `saturate`, `hue-rotate`, and
 * `brightness` filters — a well-known pure-CSS trick that requires no canvas API.
 *
 * Usage:
 *   <AppIcon src="/icons/apps/browser.svg" size={48} color="#3b82f6" />
 *   <AppIcon src="/icons/apps/browser.svg" size={32} />   ← uses store iconColor
 */

import Image from 'next/image';
import { useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Colour helpers ────────────────────────────────────────────────────────────

/** Parse a #rrggbb / #rgb hex string into [r, g, b] 0-255 */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const [r, g, b] = clean.split('').map(c => parseInt(c + c, 16));
    return [r, g, b];
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
 * Build a CSS filter string that recolours a "pure white" SVG to a target hex
 * colour.  Works by:
 *  brightness(0) invert(1)  →  makes icon white
 *  sepia → saturate → hue-rotate → brightness  → tint to target colour
 *
 * The algorithm is a heuristic that works well for solid-icon SVGs.
 */
function buildColorFilter(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'brightness(0) invert(1)';   // fallback: white

  const [r, g, b] = rgb;

  // Convert to HSL to derive the filter parameters
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6;                  break;
      case bn: h = ((rn - gn) / d + 4) / 6;                  break;
    }
  }

  const hDeg    = Math.round(h * 360);
  const sPct    = Math.round(s * 100);
  const lPct    = Math.round(l * 100);
  const bFactor = Math.max(0.5, Math.min(2, lPct / 50));  // brightness boost

  // Pure white → sepia gives a yellowish base → saturate + hue-rotate → target hue
  return [
    'brightness(0)',          // crush to black
    'invert(1)',              // flip to white
    'sepia(1)',               // warm yellow base
    `saturate(${Math.max(0, sPct * 4)}%)`,   // push saturation
    `hue-rotate(${hDeg - 30}deg)`,           // rotate to target hue (-30 corrects sepia offset)
    `brightness(${bFactor.toFixed(2)})`,     // match lightness
  ].join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AppIconProps {
  /** Absolute path or URL of the SVG icon */
  src: string;
  /** Rendered pixel size (square).  Default: 32 */
  size?: number;
  /**
   * Override colour for this specific icon instance.
   * Falls back to the global store `iconColor` when omitted.
   * Pass `"none"` to disable all colour filters (use raw SVG colour).
   */
  color?: string;
  /** Extra inline styles merged onto the wrapper div */
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
}

export default function AppIcon({
  src,
  size = 32,
  color,
  style,
  className,
  alt = '',
}: AppIconProps) {
  const globalIconColor = useOSStore(s => s.iconColor);

  const resolvedColor = color === 'none' ? undefined : (color ?? globalIconColor);

  const filter = useMemo(() => {
    if (!resolvedColor) return undefined;
    return buildColorFilter(resolvedColor);
  }, [resolvedColor]);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        style={{
          objectFit: 'contain',
          filter,
          transition: 'filter 0.3s ease',
        }}
      />
    </div>
  );
}