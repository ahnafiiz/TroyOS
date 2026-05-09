// components/BootScreen.tsx
'use client';

import { useState, useEffect } from 'react';

interface Props { onComplete: () => void; }

const BOOT_STEPS = [
  { message: 'Booting Troy OS...', weight: 4.5 },
  { message: 'Initializing Troy OS kernel...', weight: 2 },
  { message: 'Loading Troy modules...', weight: 3 },
  { message: 'Mounting Proxy...', weight: 1 },
  { message: 'Starting Troy services...', weight: 9 },
  { message: 'Authenticating user...', weight: 7 },
  { message: 'Applying visual theme...', weight: 2 },
  { message: 'Almost There...', weight: 5 },
];

// Using the Geist font variable from your Layout
const GEIST_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function BootScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting up...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    let isRunning = true;

    const processBoot = async () => {
      for (const step of BOOT_STEPS) {
        if (!isRunning) break;
        setMessage(step.message);
        
        const stepTarget = (BOOT_STEPS.indexOf(step) + 1) * (100 / BOOT_STEPS.length);
        const targetForStep = Math.min(stepTarget, 99);
        
        while (currentProgress < targetForStep) {
          const chunk = Math.random() * 4; 
          currentProgress = Math.min(currentProgress + chunk, targetForStep);
          setProgress(currentProgress);
          
          const delay = Math.random() * (150 * step.weight) + 30; 
          await new Promise(r => setTimeout(r, delay));
        }

        if (Math.floor(currentProgress) >= 99) {
          setMessage('Finalizing system setup...');
          await new Promise(r => setTimeout(r, 5000)); 
        }
      }

      if (isRunning) {
        setProgress(100);
        setMessage('Troy OS Booted.');
        await new Promise(r => setTimeout(r, 800));
        setIsExiting(true);
        setTimeout(onComplete, 1200);
      }
    };

    processBoot();
    return () => { isRunning = false; };
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0, 
      background: '#020205', // Deeper black
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 42, zIndex: 9999, overflow: 'hidden',
      fontFamily: GEIST_FONT, color: '#fff',
      transition: 'opacity 1s ease-in-out, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(1.1) translateY(-20px)' : 'scale(1) translateY(0)',
    }}>
      <style>{`
        @keyframes fastRotate { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes slowFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Grid with improved saturation */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px', 
        animation: 'gridPulse 4s ease-in-out infinite',
        filter: 'blur(1px)', // Softer grid
      }} />

      {/* Glow Effect behind logo */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        background: 'rgba(59, 130, 246, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Logo Area */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ animation: 'slowFloat 6s ease-in-out infinite' }}>
          <h1 style={{
            fontSize: 92, fontWeight: 900, letterSpacing: '-0.06em',
            background: 'linear-gradient(180deg, #ffffff 40%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, lineHeight: 0.9, display: 'block', padding: '0 60px', 
            animation: 'fastRotate 3.5s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))'
          }}>TROY</h1>
        </div>
        <p style={{ 
          fontSize: 13, fontWeight: 800, letterSpacing: '0.8em', 
          color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', 
          margin: '16px 0 0', animation: 'slowFloat 6s ease-in-out infinite',
          paddingLeft: '0.8em' // Centers the text due to letter spacing
        }}>OS</p>
      </div>

      {/* Progress Bar & Percentage */}
      <div style={{ width: 340, position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', marginBottom: 14, padding: '0 4px'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {message}
          </span>
          <span style={{ 
            fontSize: 16, fontWeight: 800, color: '#3b82f6', 
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 10px rgba(59,130,246,0.5)'
          }}>
            {Math.round(progress)}%
          </span>
        </div>

        <div style={{ 
          height: 8, 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: 20, 
          padding: '2px', // Inner padding for "encased" bar look
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: 20,
            transition: 'width 0.8s cubic-bezier(0.2, 1, 0.2, 1)', 
            boxShadow: '0 0 20px rgba(59,130,246,0.6)',
          }} />
        </div>
      </div>

      {/* Versioning Footer */}
      <div style={{ 
        position: 'absolute', bottom: 40, textAlign: 'center', 
        opacity: 0.3, letterSpacing: '0.15em', textTransform: 'uppercase'
      }}>
        <p style={{ fontSize: 10, fontWeight: 800, margin: 0 }}>TROY OS v2.0.1</p>
        <p style={{ fontSize: 9, marginTop: 6, opacity: 0.5 }}>hi philip chicken</p>
      </div>
    </div>
  );
}
