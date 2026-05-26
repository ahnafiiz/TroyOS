'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';
import FrozenScreen from '@/components/FrozenScreen';
import BroadcastOverlay from '@/components/BroadcastOverlay';

import { RegisterPage } from '@/pages/register';
import { LockScreen } from '@/pages/lockscreen';
import { ScreenTransition } from '@/components/ScreenTransition';

type Screen = 'boot' | 'register' | 'lock' | 'desktop';

export default function Home() {
  const [ready, setReady] = useState(false);

  const bootComplete       = useOSStore((s) => s.bootComplete);
  const user               = useOSStore((s) => s.user);
  const isLoggedIn         = useOSStore((s) => s.isLoggedIn);
  const setBootComplete    = useOSStore((s) => s.setBootComplete);
  const logout             = useOSStore((s) => s.logout);
  const addBroadcast       = useOSStore((s) => s.addBroadcast);
  const seenKickedAt       = useOSStore((s) => s.seenKickedAt);
  const setSeenKickedAt    = useOSStore((s) => s.setSeenKickedAt);

  const isFrozen = isLoggedIn && !!user?.isFrozen;

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    useOSStore.getState().loadUsers();
  }, []);

  // Main poll — runs every 15s when logged in
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    const check = async () => {
      try {
        // 1. Expire timed bans/freezes/mutes
        await fetch('/api/users/expire', { method: 'POST' });

        // 2. Fetch fresh user status
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const users = await res.json();
        const fresh = users.find((u: { email: string }) => u.email === user.email);
        if (!fresh) return;

        // 3. Check kick
        if (fresh.kickedAt && fresh.kickedAt !== seenKickedAt) {
          setSeenKickedAt(fresh.kickedAt);
          // Clear kickedAt on server so they can re-login
          await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, updates: { kickedAt: '' } }),
          });
          logout();
          return;
        }

        // 4. Check ban
        if (fresh.isBanned) {
          logout();
          return;
        }

        // 5. Check freeze state change
        if (fresh.isFrozen !== user.isFrozen) {
          useOSStore.setState((s) => ({
            user: s.user ? { ...s.user, isFrozen: fresh.isFrozen } : s.user,
          }));
        }

        // 6. Check mute state change
        if (fresh.isMuted !== user.isMuted) {
          useOSStore.setState((s) => ({
            user: s.user ? { ...s.user, isMuted: fresh.isMuted } : s.user,
          }));
        }

        // 7. Check broadcasts
        const bRes = await fetch(`/api/broadcast?email=${encodeURIComponent(user.email)}`);
        if (bRes.ok) {
          const msgs = await bRes.json();
          const existing = useOSStore.getState().broadcastMessages.map(m => m.id);
          for (const msg of msgs) {
            if (!existing.includes(msg.id)) {
              addBroadcast(msg);
              // Dismiss from server after picking up
              await fetch('/api/broadcast', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: msg.id }),
              });
            }
          }
        }

      } catch (err) {
        console.error('status check failed:', err);
      }
    };

    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [isLoggedIn, user?.email, logout, seenKickedAt, setSeenKickedAt, addBroadcast, user?.isFrozen, user?.isMuted]);

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
      <BroadcastOverlay />
    </div>
  );
}