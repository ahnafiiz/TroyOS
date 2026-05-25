'use client';

import { useState, useEffect, useRef } from 'react';
import { OS_VERSION, OS_BUILD, useOSStore } from '../store/useOSStore';
import { sendOTP, verifyOTP, clearOTP } from '../services/otpService';

type LockStage = 'lock' | 'forgot-email' | 'forgot-otp' | 'forgot-newpassword';

export const LockScreen = () => {
  const { user, users, setUser, setIsLoggedIn, logout, setUsers } = useOSStore();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<LockStage>('lock');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [shaking, setShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const startCooldown = () => {
    setCooldown(30);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const pwd = (formData.get('password') as string || '').trim();

    const account = users.find((u) => u.username === user?.username || u.email === user?.email);
    const storedPassword = account?.password ?? user?.password;

    if (!pwd) { setError('Password field cannot be empty.'); return; }

    setIsLoading(true);

    if (account?.isBanned) {
      setError('Account suspended.');
      setIsLoading(false);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    if (storedPassword && pwd === storedPassword) {
      const isAdminEmail = account?.email?.toLowerCase() === '25atahmeed@castletroycollege.ie';
      const updatedAccount = {
        ...(account ?? user!),
        role: isAdminEmail ? 'admin' : 'user',
      } as typeof user;

      setUser(updatedAccount!);
      setIsLoggedIn(true);

      const idx = users.findIndex((u) => u.email === updatedAccount?.email);
      if (idx !== -1) {
        const newUsers = [...users];
        newUsers[idx] = updatedAccount!;
        setUsers(newUsers);
      }
    } else {
      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: user!.email, password: pwd }),
        });
      } catch { /* non-blocking */ }

      setIsLoading(false);
      setError('Incorrect password');
      setShaking(true);
      if (passwordRef.current) passwordRef.current.value = '';
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setIsLoading(false);
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotEmail.trim();
    if (!email) { setError('Please enter your email.'); return; }
    if (email.toLowerCase() !== user?.email?.toLowerCase()) {
      setError('That email does not match the account on this device.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await sendOTP(email);
    setIsLoading(false);
    if (!result.success) { setError('Failed to send code. Try again.'); return; }
    if (result.devCode) setDevCode(result.devCode);
    setStage('forgot-otp');
    startCooldown();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[index] = digit; setOtp(next);
    setError(null);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    text.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    const valid = verifyOTP(forgotEmail, code) || (devCode && code === devCode);
    if (!valid) {
      setError('Incorrect or expired code.');
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
      return;
    }
    clearOTP(forgotEmail);
    setStage('forgot-newpassword');
    setError(null);
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUser({ ...user!, password: newPassword });
        setStage('lock');
        setError(null);
        setForgotEmail('');
        setNewPassword('');
        setConfirmNewPassword('');
        setOtp(Array(6).fill(''));
        setDevCode(null);
      } else {
        setError(result.error || 'Failed to reset password.');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = () => { logout(); };

  if (!user) return null;
  const letter = user.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 35% 55%, #07101d 0%, #02050b 72%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, "Inter", sans-serif)',
      overflow: 'hidden', userSelect: 'none',
    }}>
      <style>{`
        @keyframes lockFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lockAmbient {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.25; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        @keyframes digitPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.14); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .lock-input::placeholder { color: rgba(255,255,255,0.28); }
        .lock-input:focus        { outline: none; }
        .lock-btn:hover          { background: rgba(255,255,255,0.13) !important; }
        .lock-btn:active         { transform: scale(0.97) !important; }
        .otp-box:focus           { outline: none; }
      `}</style>

      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)', filter: 'blur(80px)', top: '-10%', left: '-5%', pointerEvents: 'none', animation: 'lockAmbient 9s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)', bottom: '-5%', right: '5%', pointerEvents: 'none', animation: 'lockAmbient 12s ease-in-out infinite reverse' }} />

      {/* Clock */}
      <div style={{ textAlign: 'center', marginBottom: 48, animation: 'lockFadeIn 0.6s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.05s' }}>
        <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.95)', textShadow: '0 0 40px rgba(255,255,255,0.08)', fontVariantNumeric: 'tabular-nums' }}>
          {time || '--:--'}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.04em' }}>
          {dateStr}
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: 320,
        background: 'rgba(14, 17, 28, 0.82)',
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '28px 28px 24px',
        animation: 'lockFadeIn 0.65s cubic-bezier(0.22,1,0.36,1) both',
        animationDelay: '0.1s',
      }}>

        {devCode && (
          <div style={{ marginBottom: 14, padding: '6px 12px', borderRadius: 8, background: 'rgba(6,182,212,0.13)', border: '1px solid rgba(6,182,212,0.32)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(103,232,249,0.95)', textAlign: 'center' }}>
            DEV · OTP: <span style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.22em' }}>{devCode}</span>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', fontSize: 12, color: 'rgba(252,165,165,0.9)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* ── LOCK STAGE ── */}
        {stage === 'lock' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginBottom: 10, boxShadow: '0 0 24px rgba(96,165,250,0.12)' }}>
                {letter}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>{user.username}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>{user.email}</div>
            </div>

            <form onSubmit={handleLogin} style={{ animation: shaking ? 'shake 0.45s ease' : 'none' }}>
              <input
                ref={passwordRef} name="password" className="lock-input"
                type="password" placeholder="Password" autoFocus
                onChange={() => setError(null)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
                  background: isFocused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                  border: isFocused ? '1px solid rgba(96,165,250,0.45)' : '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.92)', fontSize: 14, fontFamily: 'inherit', letterSpacing: '0.08em',
                  transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
                  boxShadow: isFocused ? '0 0 0 3px rgba(96,165,250,0.10)' : 'none',
                  textAlign: 'center', opacity: isLoading ? 0.5 : 1,
                }}
              />
              <button type="submit" className="lock-btn" disabled={isLoading} style={{
                marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 10,
                background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.30)',
                color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                boxShadow: '0 0 18px rgba(96,165,250,0.10)',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {isLoading ? (
                  <>
                    <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Logging in…
                  </>
                ) : 'Log In'}
              </button>
            </form>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button onClick={() => { setStage('forgot-email'); setForgotEmail(user.email || ''); setError(null); }} style={{ background: 'none', border: 'none', color: 'rgba(96,165,250,0.7)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}>
                Forgot Password?
              </button>
              <button onClick={handleSwitchAccount} style={{ background: 'none', border: 'none', color: 'rgba(96,165,250,0.7)', cursor: 'pointer', fontSize: 12.4, fontFamily: 'inherit', padding: 0 }}>
                Switch Accounts?
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT EMAIL STAGE ── */}
        {stage === 'forgot-email' && (
          <form onSubmit={handleForgotEmailSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Reset Password</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>We&apos;ll send a code to your email</div>
            </div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</label>
            <input className="lock-input" type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setError(null); }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit' }} />
            <button type="submit" disabled={isLoading} style={{ marginTop: 14, width: '100%', padding: '10px 0', borderRadius: 10, background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? (<><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Sending…</>) : 'Send Code →'}
            </button>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button type="button" onClick={() => { setStage('lock'); setError(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>← Back</button>
            </div>
          </form>
        )}

        {/* ── FORGOT OTP STAGE ── */}
        {stage === 'forgot-otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Check your email</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Code sent to {forgotEmail}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
              {otp.map((digit, i) => (
                <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                  className="otp-box" type="text" inputMode="numeric" maxLength={1}
                  value={digit} autoFocus={i === 0}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  style={{ width: 38, height: 48, borderRadius: 10, textAlign: 'center', fontSize: 19, fontWeight: 700, fontFamily: 'monospace', background: digit ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.04)', border: digit ? '1px solid rgba(96,165,250,0.48)' : '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.95)', caretColor: 'transparent', animation: digit ? 'digitPop 0.2s ease' : 'none' }}
                />
              ))}
            </div>
            <button type="submit" disabled={otp.join('').length < 6} style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: otp.join('').length < 6 ? 'not-allowed' : 'pointer', opacity: otp.join('').length < 6 ? 0.45 : 1 }}>
              Verify Code →
            </button>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => { setStage('forgot-email'); setOtp(Array(6).fill('')); setError(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>← Back</button>
              <button type="button" onClick={async () => { if (cooldown > 0) return; clearOTP(forgotEmail); setOtp(Array(6).fill('')); setIsLoading(true); const r = await sendOTP(forgotEmail); setIsLoading(false); if (r.devCode) setDevCode(r.devCode); startCooldown(); }} disabled={cooldown > 0} style={{ background: 'none', border: 'none', color: cooldown > 0 ? 'rgba(255,255,255,0.26)' : 'rgba(96,165,250,0.80)', cursor: cooldown > 0 ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* ── NEW PASSWORD STAGE ── */}
        {stage === 'forgot-newpassword' && (
          <form onSubmit={handleNewPasswordSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔑</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>New Password</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Choose a strong password</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Password</label>
                <input className="lock-input" type="password" value={newPassword} autoFocus onChange={(e) => { setNewPassword(e.target.value); setError(null); }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Confirm Password</label>
                <input className="lock-input" type="password" value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); setError(null); }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit' }} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} style={{ marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 10, background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? (<><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Saving…</>) : 'Reset Password'}
            </button>
          </form>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 32, textAlign: 'center', opacity: 0.22, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>
        TROY OS
        <p style={{ marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
          version {OS_VERSION} - build {OS_BUILD}
        </p>
      </div>
    </div>
  );
};

export default LockScreen;