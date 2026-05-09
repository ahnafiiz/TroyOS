// app/page.tsx
'use client';

import { useState } from 'react';
import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';

export default function Home() {
  const [phase, setPhase] = useState<'boot' | 'desktop'>('boot');
  const [isDesktopVisible, setIsDesktopVisible] = useState(false);

  const handleBootComplete = () => {
    setPhase('desktop');
    // Shortest possible delay to trigger the CSS transition
    requestAnimationFrame(() => {
      setIsDesktopVisible(true);
    });
  };

  return (
    <main style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      backgroundColor: '#000', 
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {phase === 'boot' ? (
        <BootScreen onComplete={handleBootComplete} />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          opacity: isDesktopVisible ? 1 : 0,
          transform: isDesktopVisible ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 1.5s ease-out, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <Desktop />
        </div>
      )}
    </main>
  );
}
