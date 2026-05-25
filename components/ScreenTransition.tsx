'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  screenKey: string;
  duration?: number;
}

const styleId = 'screen-transition-styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ensureStyles(duration: number) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes screenIn {
      from { opacity: 0; transform: scale(0.98) translateY(8px); filter: blur(10px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);   filter: blur(0px);  }
    }
    .screen-transition {
      position: fixed;
      inset: 0;
      animation: screenIn var(--screen-duration, 500ms) ease forwards;
    }
  `;
  document.head.appendChild(style);
}

export function ScreenTransition({ children, screenKey, duration = 500 }: Props) {
  ensureStyles(duration);

  return (
    <div
      key={screenKey}
      className="screen-transition"
      style={{ '--screen-duration': `${duration}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}