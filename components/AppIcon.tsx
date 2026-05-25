/* eslint-disable @next/next/no-img-element */
'use client';

import { CSSProperties } from 'react';
import { useOSStore } from '@/store/useOSStore';

export interface AppIconProps {
  src?: string;
  size?: number;
  /**
   * color="none"  → render the SVG as a raw <img> with its own colors (app icons)
   * color="#hex"  → mask the SVG and fill it with this color (UI icons)
   * color omitted → use the global iconColor from the store (UI icons)
   */
  color?: string;
  style?: CSSProperties;
  className?: string;
  title?: string;
  alt?: string;
}

export default function AppIcon({
  src,
  size = 32,
  color,
  style,
  className,
  title,
  alt,
}: AppIconProps) {
  const globalIconColor = useOSStore((s) => s.iconColor);

  if (!src) return null;

  // color="none" → raw SVG, no tinting
  if (color === 'none') {
    return (
      <img
        src={src}
        title={title}
        alt={alt ?? title ?? ''}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'inline-block',
          ...style,
        }}
      />
    );
  }

  // All other cases: CSS mask fills the SVG shape with the resolved color
  const resolvedColor = color ?? globalIconColor ?? '#ffffff';

  return (
    <div
      title={title || alt}
      className={className}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-block',
        backgroundColor: resolvedColor,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        transition: 'background-color 0.2s ease',
        ...style,
      }}
    />
  );
}