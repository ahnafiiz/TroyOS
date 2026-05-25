'use client';

import { useState, useEffect, useRef } from 'react';
import { OS_VERSION, OS_BUILD } from '@/store/useOSStore';

interface Props {
  onComplete: () => void;
}

const BOOT_STEPS = [
  { message: 'Starting Troy OS…', weight: 8.5 },
  { message: 'Checking for Updates…', weight: 4.8 },
  { message: 'Loading modules…', weight: 3.9 },
  { message: 'Starting services…', weight: 6 },
  { message: 'Checking for past logins…', weight: 5 },
  { message: 'Applying visual theme…', weight: 3.2 },
  { message: 'Almost there…', weight: 2.5 },
];

export default function BootScreen({
  onComplete,
}: Props) {
  const [, setProgress] = useState(0);

  const [message, setMessage] =
    useState('Starting up…');

  const [isExiting, setIsExiting] =
    useState(false);

  const bypassed = useRef(false);

  const progressRef = useRef(0);

  useEffect(() => {
    let running = true;

    const run = async () => {
      for (
        let i = 0;
        i < BOOT_STEPS.length;
        i++
      ) {
        const step = BOOT_STEPS[i];

        if (!running || bypassed.current)
          break;

        setMessage(step.message);

        const target = Math.min(
          ((i + 1) / BOOT_STEPS.length) *
            99,
          99
        );

        let cur = progressRef.current;

        while (
          cur < target &&
          !bypassed.current
        ) {
          cur = Math.min(
            cur + Math.random() * 4,
            target
          );

          progressRef.current = cur;

          setProgress(cur);

          await new Promise((r) =>
            setTimeout(
              r,
              Math.random() *
                110 *
                step.weight +
                20
            )
          );
        }
      }

      if (running && !bypassed.current) {
        progressRef.current = 100;

        setProgress(100);

        setMessage('Troy OS Booted...');

        await new Promise((r) =>
          setTimeout(r, 700)
        );

        setIsExiting(true);

        setTimeout(onComplete, 1200);
      }
    };

    run();

    return () => {
      running = false;
    };
  }, [onComplete]);

  useEffect(() => {
    const seq = [
      'ArrowUp',
      'ArrowDown',
      'ArrowUp',
      'ArrowDown',
    ];

    let keys: string[] = [];

    const onKey = (
      e: KeyboardEvent
    ) => {
      keys = [...keys.slice(-3), e.key];

      if (
        keys.length === 4 &&
        keys.every(
          (k, i) => k === seq[i]
        ) &&
        !bypassed.current
      ) {
        bypassed.current = true;

        progressRef.current = 100;

        setProgress(100);

        setMessage('Boot Skipped...');

        setTimeout(
          () => setIsExiting(true),
          150
        );

        setTimeout(onComplete, 1000);
      }
    };

    window.addEventListener(
      'keydown',
      onKey
    );

    return () =>
      window.removeEventListener(
        'keydown',
        onKey
      );
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,

        background:
          'radial-gradient(circle at center, #07101d 0%, #02050b 72%)',

        display: 'flex',
        flexDirection: 'column',

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        zIndex: 999999,

        fontFamily:
          'var(--font-family)',

        color:
          'var(--text-primary)',

        opacity: isExiting ? 0 : 1,

        transform: isExiting
          ? 'scale(1.02)'
          : 'scale(1)',

        transition:
          'opacity 1s ease, transform 1.2s ease',
      }}
    >
      <style>{`
        @keyframes spinnerRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /*
          VERY smooth Windows 11 style spinner
          seamless loop with full rotation
        */
        @keyframes spinnerArc {
          0% {
            stroke-dasharray: 1 140;
            stroke-dashoffset: 0;
          }

          50% {
            stroke-dasharray: 90 140;
            stroke-dashoffset: -35;
          }

          100% {
            stroke-dasharray: 1 140;
            stroke-dashoffset: -140;
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes textFade {
          0%, 100% {
            opacity: 0.55;
          }

          50% {
            opacity: 0.95;
          }
        }
      `}</style>

      {/* ambient glow */}
      <div
        style={{
          position: 'absolute',

          width: 700,
          height: 700,

          borderRadius: '50%',

          background:
            'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 72%)',

          filter: 'blur(80px)',

          pointerEvents: 'none',
        }}
      />

      {/* logo */}
      <div
        style={{
          position: 'absolute',

          top: '31%',

          transform:
            'translateY(-50%)',

          textAlign: 'center',

          animation:
            'logoFloat 7s ease-in-out infinite',
        }}
      >
        <h1
          style={{
            margin: 0,

            fontSize: 90,

            fontWeight: 800,

            letterSpacing: '-0.07em',

            lineHeight: 0.9,

            color: '#ffffff',

            textShadow:
              '0 0 24px rgba(255,255,255,0.08)',
          }}
        >
          TROY
        </h1>

        <p
          style={{
            marginTop: 14,

            fontSize: 11,

            fontWeight: 700,

            letterSpacing: '0.8em',

            textTransform: 'uppercase',

            color:
              'rgb(255, 255, 255)',

            paddingLeft: '0.8em',
          }}
        >
          OS
        </p>
      </div>

      {/* spinner */}
      <div
        style={{
          position: 'absolute',

          top: '55%',

          width: 82,
          height: 82,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          style={{
            animation:
              'spinnerRotate 2.8s linear infinite',

            overflow: 'visible',
          }}
        >
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.98)"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="140"
            style={{
              animation:
                'spinnerArc 2.8s cubic-bezier(0.37, 0, 0.63, 1) infinite',

              transformOrigin: 'center',

              filter:
                'drop-shadow(0 0 10px rgba(255,255,255,0.34))',
            }}
          />
        </svg>
      </div>

      {/* progress text */}
      <div
        style={{
          position: 'absolute',

          top: '63%',

          textAlign: 'center',

          animation:
            'textFade 3s ease-in-out infinite',
        }}
      >
        <p
          style={{
            margin: 0,

            fontSize: 12,

            fontWeight: 500,

            color:
              'rgba(255,255,255,0.72)',

            letterSpacing: '0.03em',
          }}
        >
          {message}
        </p>
      </div>

      {/* footer */}
      <div
        style={{
          position: 'absolute',

          bottom: 36,

          textAlign: 'center',

          opacity: 0.32,
        }}
      >
        <p
          style={{
            margin: 0,

            fontSize: 9,

            fontWeight: 800,

            letterSpacing: '0.15em',
          }}
        >
          TROY OS
        </p>

        <p
          style={{
            marginTop: 4,

            fontSize: 9,

            color:
              'rgba(255,255,255,0.55)',

            letterSpacing: '0.08em',
          }}
        >
          version {OS_VERSION} - build {OS_BUILD}
        </p>
      </div>
    </div>
  );
}