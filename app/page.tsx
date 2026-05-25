'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';

import { RegisterPage } from '@/pages/register';
import { LockScreen } from '@/pages/lockscreen';

import { ScreenTransition } from '@/components/ScreenTransition';

type Screen = 'boot' | 'register' | 'lock' | 'desktop';

export default function Home() {
  const [ready, setReady] = useState(false);

  const bootComplete    = useOSStore((s) => s.bootComplete);
  const user            = useOSStore((s) => s.user);
  const isLoggedIn      = useOSStore((s) => s.isLoggedIn);
  const setBootComplete = useOSStore((s) => s.setBootComplete);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Fetch latest users from Google Sheet on every page load,
  // overwriting whatever was cached in localStorage.
  useEffect(() => {
    useOSStore.getState().loadUsers();
  }, []);

  const deriveScreen = useCallback((): Screen => {
    if (!bootComplete) return 'boot';
    if (!user)         return 'register';
    if (!isLoggedIn)   return 'lock';
    return 'desktop';
  }, [bootComplete, user, isLoggedIn]);

  if (!ready) return null;

  const screen = deriveScreen();

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {screen === 'boot' && (
        <ScreenTransition screenKey="boot" duration={600}>
          <BootScreen onComplete={() => setBootComplete(true)} />
        </ScreenTransition>
      )}

      {screen === 'register' && (
        <ScreenTransition screenKey="register" duration={520}>
          <RegisterPage />
        </ScreenTransition>
      )}

      {screen === 'lock' && (
        <ScreenTransition screenKey="lock" duration={480}>
          <LockScreen />
        </ScreenTransition>
      )}

      {screen === 'desktop' && (
        <ScreenTransition screenKey="desktop" duration={440}>
          <Desktop />
        </ScreenTransition>
      )}
    </div>
  );
}