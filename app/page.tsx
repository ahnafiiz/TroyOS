'use client';

import { useState, useCallback, useEffect } from 'react';
import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';

/**
 * App phases:
 *   boot     — BootScreen is visible, Desktop is not mounted
 *   desktop  — Desktop is mounted and faded in
 *   resetting — triggered by Settings reset panel "skip" combo:
 *               Desktop fades out, then BootScreen mounts again cleanly
 *
 * The Settings component fires a custom DOM event 'troy:skip-to-boot' when
 * the secret key combo (UP DOWN UP DOWN) is pressed during the reset flow.
 * page.tsx listens for that event and transitions back to the boot phase.
 */

type Phase = 'boot' | 'transitioning' | 'desktop';

export default function Home() {
  const [phase, setPhase]           = useState<Phase>('boot');
  const [desktopVisible, setDesktopVisible] = useState(false);
  const [bootKey, setBootKey]       = useState(0); // increment to remount BootScreen fresh

  const handleBootComplete = useCallback(() => {
    setPhase('transitioning');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDesktopVisible(true);
        setTimeout(() => setPhase('desktop'), 1200);
      });
    });
  }, []);

  /**
   * Called by Settings when the secret combo skips the reset animation.
   * Smoothly fades the desktop out, then remounts BootScreen.
   */
  const handleSkipToBoot = useCallback(() => {
    // Fade desktop out
    setDesktopVisible(false);
    setTimeout(() => {
      // Remount BootScreen with a fresh key so it runs the boot sequence again
      setBootKey(k => k + 1);
      setPhase('boot');
    }, 800);
  }, []);

  // Listen for the custom event dispatched by Settings
  // We use a ref-stable listener via useCallback to avoid adding/removing on every render
useEffect(() => {
  const handler = () => handleSkipToBoot();

  window.addEventListener('troy:skip-to-boot', handler);

  return () => {
    window.removeEventListener('troy:skip-to-boot', handler);
  };
}, [handleSkipToBoot]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--background-color, #060810)',
        position: 'relative',
        fontFamily: 'var(--font-family, system-ui, sans-serif)',
      }}
    >
      {/* Boot screen — unmounted once desktop is live */}
      {(phase === 'boot' || phase === 'transitioning') && (
        <div
          key={bootKey}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            // Fade out when transitioning to desktop
            opacity:    phase === 'transitioning' ? 0 : 1,
            transform:  phase === 'transitioning' ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: phase === 'transitioning' ? 'none' : 'auto',
          }}
        >
          <BootScreen onComplete={handleBootComplete} />
        </div>
      )}

      {/* Desktop — mounted from transitioning phase onward */}
      {phase !== 'boot' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity:    desktopVisible ? 1 : 0,
            transform:  desktopVisible ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <Desktop />
        </div>
      )}
    </main>
  );
}