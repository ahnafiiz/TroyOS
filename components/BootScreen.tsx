'use client';

import { useState, useEffect, useRef } from 'react';

interface Props { onComplete: () => void; }

const BOOT_STEPS = [
  { message: 'Booting Troy OS…',           weight: 4.5 },
  { message: 'Initialising kernel…',        weight: 2 },
  { message: 'Loading modules…',            weight: 3 },
  { message: 'Starting services…',          weight: 6 },
  { message: 'Authenticating session…',     weight: 3 },
  { message: 'Applying visual theme…',      weight: 2 },
  { message: 'Almost there…',               weight: 2.5 },
];

export default function BootScreen({ onComplete }: Props) {
  const [progress, setProgress]   = useState(0);
  const [message, setMessage]     = useState('Starting up…');
  const [isExiting, setIsExiting] = useState(false);

  const bypassed = useRef(false);

  // ✅ FIX: persistent progress ref
  const progressRef = useRef(0);

  useEffect(() => {
    let running = true;

    const run = async () => {
      for (let i = 0; i < BOOT_STEPS.length; i++) {
        const step = BOOT_STEPS[i];

        if (!running || bypassed.current) break;

        setMessage(step.message);

        const target = Math.min(
          ((i + 1) / BOOT_STEPS.length) * 99,
          99
        );

        // ✅ use ref instead of resetting
        let cur = progressRef.current;

        while (cur < target && !bypassed.current) {
          cur = Math.min(cur + Math.random() * 5, target);

          progressRef.current = cur; // keep synced
          setProgress(cur);

          await new Promise(r =>
            setTimeout(r, Math.random() * 120 * step.weight + 20)
          );
        }
      }

      if (running && !bypassed.current) {
        progressRef.current = 100;
        setProgress(100);

        setMessage('Troy OS ready.');
        await new Promise(r => setTimeout(r, 500));

        setIsExiting(true);
        setTimeout(onComplete, 900);
      }
    };

    run();
    return () => { running = false; };
  }, [onComplete]);

  // Keyboard shortcut to skip boot
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown'];
    let keys: string[] = [];

    const onKey = (e: KeyboardEvent) => {
      keys = [...keys.slice(-3), e.key];

      if (
        keys.length === 4 &&
        keys.every((k, i) => k === seq[i]) &&
        !bypassed.current
      ) {
        bypassed.current = true;

        progressRef.current = 100;
        setProgress(100);

        setMessage('Boot bypassed.');

        setTimeout(() => setIsExiting(true), 150);
        setTimeout(onComplete, 1000);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onComplete]);

  return (
    <div
      className="boot-screen"
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 40, zIndex: 'var(--z-boot)' as any,
        overflow: 'hidden',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        opacity:   isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.05) translateY(-10px)' : 'scale(1)',
        transition: 'opacity 0.7s var(--ease-smooth), transform 0.9s var(--ease-spring)',
      }}
    >
      <style>{`
        @keyframes bootLogoRock {
          0%, 100% { transform: rotate(-4deg); }
          50%       { transform: rotate(4deg); }
        }
        @keyframes bootLogoFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.28; }
        }
      `}</style>

      {/* Grid backdrop */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(var(--accent-glow-soft) 1px, transparent 1px)',
          'linear-gradient(90deg, var(--accent-glow-soft) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
        animation: 'gridPulse 5s ease-in-out infinite',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow-soft) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        animation: 'bootLogoFloat 6s ease-in-out infinite',
      }}>
        <h1 style={{
          fontSize: 88, fontWeight: 900, letterSpacing: '-0.05em',
          background: 'linear-gradient(180deg, var(--text-primary) 30%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: 0, lineHeight: 0.9, padding: '0 50px',
          display: 'block',
          animation: 'bootLogoRock 3.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 24px var(--accent-glow-soft))',
        }}>TROY</h1>
        <p style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.9em',
          color: 'var(--text-tertiary)', textTransform: 'uppercase',
          margin: '16px 0 0', paddingLeft: '0.9em',
        }}>OS</p>
      </div>

      {/* Progress */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            {message}
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 10px var(--accent-glow-soft)' }}>
            {Math.round(progress)}%
          </span>
        </div>

        <div style={{
          width: '100%', height: 10,
          background: 'var(--surface-3)',
          borderRadius: 'var(--radius-full)',
          padding: 2,
          border: '1px solid var(--glass-border)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, var(--accent-dark), var(--accent-light))`,
            borderRadius: 'var(--radius-full)',
            transition: bypassed.current ? 'width 0.15s var(--ease-out)' : 'width 0.35s var(--ease-spring)',
            boxShadow: '0 0 12px var(--accent-glow)',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 36, textAlign: 'center', opacity: 0.3 }}>
        <p style={{ fontSize: 9, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '0.15em' }}>TROY OS</p>
        <p style={{ fontSize: 9, marginTop: 4, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>v2.5.0</p>
      </div>
    </div>
  );
}