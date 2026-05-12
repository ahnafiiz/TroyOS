'use client';

import { useState, useEffect, useRef } from 'react';

interface Props { onComplete: () => void; }

const BOOT_STEPS = [
  { message: 'Booting Troy OS...', weight: 4.5 },
  { message: 'Initializing Troy OS kernel...', weight: 2 },
  { message: 'Loading Troy modules...', weight: 3 },
  { message: 'Starting Troy...', weight: 1 },
  { message: 'Starting Troy services...', weight: 6 },
  { message: 'Authenticating user...', weight: 3 },
  { message: 'Applying visual theme...', weight: 2 },
  { message: 'Almost There...', weight: 2.5 },
];

const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function BootScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting up...');
  const [isExiting, setIsExiting] = useState(false);
  const bypassedRef = useRef(false);

  useEffect(() => {
    let currentProgress = 0;
    let isRunning = true;

    const processBoot = async () => {
      for (const step of BOOT_STEPS) {
        if (!isRunning || bypassedRef.current) break;
        setMessage(step.message);
        
        const stepTarget = (BOOT_STEPS.indexOf(step) + 1) * (100 / BOOT_STEPS.length);
        const targetForStep = Math.min(stepTarget, 99);
        
        while (currentProgress < targetForStep && !bypassedRef.current) {
          const chunk = Math.random() * 5; 
          currentProgress = Math.min(currentProgress + chunk, targetForStep);
          setProgress(currentProgress);
          
          const delay = Math.random() * (120 * step.weight) + 20; 
          await new Promise(r => setTimeout(r, delay));
        }

        if (Math.floor(currentProgress) >= 99 && !bypassedRef.current) {
          setMessage('Finalizing system setup...');
          await new Promise(r => setTimeout(r, 800)); 
        }
      }

      if (isRunning && !bypassedRef.current) {
        setProgress(100);
        setMessage('Troy OS Booted.');
        await new Promise(r => setTimeout(r, 500));
        setIsExiting(true);
        setTimeout(onComplete, 1000);
      }
    };

    processBoot();
    return () => { isRunning = false; };
  }, [onComplete]);

  useEffect(() => {
    const targetSequence = ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown'];
    let pressedKeys: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.push(e.key);
      if (pressedKeys.length > 4) pressedKeys.shift();

      const isMatch = pressedKeys.length === 4 && pressedKeys.every((key, i) => key === targetSequence[i]);

      if (isMatch && !bypassedRef.current) {
        bypassedRef.current = true;
        setProgress(100);
        setMessage('Boot Sequence Bypassed');
        setTimeout(() => setIsExiting(true), 150);
        setTimeout(onComplete, 1150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0, 
      background: '#04040a', 
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 42, zIndex: 9999, overflow: 'hidden',
      fontFamily: GEIST_FONT, color: '#fff',
      transition: 'opacity 0.8s ease-in-out, transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(1.05) translateY(-10px)' : 'scale(1) translateY(0)',
    }}>
      <style>{`
        @keyframes fastRotate { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes slowFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px', 
        animation: 'gridPulse 5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Radial glow effect */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59,130,246,0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Branding Header with side-to-side rotating animation */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', animation: 'slowFloat 6s ease-in-out infinite' }}>
        <h1 style={{
          fontSize: 84, fontWeight: 900, letterSpacing: '-0.05em',
          background: 'linear-gradient(180deg, #ffffff 40%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: 0, lineHeight: 0.9, padding: '0 50px',
          animation: 'fastRotate 3.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.25))',
          display: 'block'
        }}>TROY</h1>
        <p style={{ 
          fontSize: 11, fontWeight: 800, letterSpacing: '0.85em', 
          color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', 
          margin: '16px 0 0', paddingLeft: '0.85em' 
        }}>OS</p>
      </div>

      {/* Progress Section */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {message}
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#3b82f6', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
            {Math.round(progress)}%
          </span>
        </div>

        <div style={{ 
          width: '100%',
          height: 12, 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: 20, 
          padding: 2, 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            height: '100%', 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: 20,
            transition: bypassedRef.current ? 'width 0.15s ease-out' : 'width 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)', 
            boxShadow: '0 0 14px rgba(59, 130, 246, 0.5)',
          }} />
        </div>
      </div>

      {/* Footer system details */}
      <div style={{ position: 'absolute', bottom: 40, textAlign: 'center', opacity: 0.3, letterSpacing: '0.15em' }}>
        <p style={{ fontSize: 9, fontWeight: 800, margin: 0, color: '#fff' }}>TROY OS</p>
        <p style={{ fontSize: 9, marginTop: 4, color: 'rgba(255,255,255,0.5)' }}>VERSION 2.5.0</p>
      </div>
    </div>
  );
}