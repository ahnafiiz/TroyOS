'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';
import FrozenScreen from '@/components/FrozenScreen';

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
  const logout          = useOSStore((s) => s.logout);

  const isFrozen = isLoggedIn && !!user?.isFrozen;

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    useOSStore.getState().loadUsers();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    const check = async () => {
      try {
        // Trigger server-side expiry check first
        await fetch('/api/users/expire', { method: 'POST' });

        const res = await fetch('/api/users');
        if (!res.ok) return;
        const users = await res.json();
        const fresh = users.find((u: { email: string }) => u.email === user.email);
        if (!fresh) return;

        if (fresh.isBanned) {
          logout();
        } else if (fresh.isFrozen !== user.isFrozen) {
          useOSStore.setState((s) => ({
            user: s.user ? { ...s.user, isFrozen: fresh.isFrozen } : s.user,
          }));
        }
      } catch (err) {
        console.error('status check failed:', err);
      }
    };

    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [isLoggedIn, user?.email, logout, user?.isFrozen]);

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

      {isFrozen && <FrozenScreen />}
    </div>
  );
}