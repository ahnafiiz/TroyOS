'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore } from '../store/useOSStore';
import { validateRegistration } from '../auth/validation';
import { sendOTP, verifyOTP, clearOTP } from '../services/otpService';
import { iconRegistry } from '@/icons/iconRegistry';

type Stage = 'form' | 'otp' | 'login';

const RESEND_COOLDOWN = 30;
  const stageIconMap = {
    form: iconRegistry.lock,
    login: iconRegistry.unlock,
    otp: iconRegistry.mail,
  } as const;

export const RegisterPage = () => {
  const setUser        = useOSStore((s) => s.setUser);
  const setIsLoggedIn  = useOSStore((s) => s.setIsLoggedIn);
  const setIsFirstBoot = useOSStore((s) => s.setIsFirstBoot);

  const [username,        setUsername]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [stage,           setStage]           = useState<Stage>('form');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword,   setLoginPassword]   = useState('');
  const [error,           setError]           = useState<string | null>(null);
  const [focusedField,    setFocusedField]    = useState<string | null>(null);
  const [isLoading,       setIsLoading]       = useState(false);
  const [devCode,         setDevCode]         = useState<string | null>(null);

  const [otp,    setOtp]    = useState<string[]>(Array(6).fill(''));
  const otpRefs             = useRef<(HTMLInputElement | null)[]>([]);
  const loginPasswordRef    = useRef<HTMLInputElement>(null);

  const [cooldown,  setCooldown]  = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sliding, setSliding] = useState(false);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRegistration(username, email, password, confirmPassword);
    if (err) { setError(err); return; }
    setIsLoading(true);
    setError(null);
    try {
      const usernameCheck = await fetch(`/api/auth/register?identifier=${encodeURIComponent(username)}`).then(res => res.json());
      const emailCheck = await fetch(`/api/auth/register?identifier=${encodeURIComponent(email)}`).then(res => res.json());
      if (usernameCheck.exists) { setError('Username already exists.'); setIsLoading(false); return; }
      if (emailCheck.exists) { setError('An account with this email already exists.'); setIsLoading(false); return; }
      const result = await sendOTP(email);
      setIsLoading(false);
      if (!result.success) { setError('Failed to send verification code. Try again.'); return; }
      if (result.devCode) setDevCode(result.devCode);
      setSliding(true);
      setTimeout(() => { setStage('otp'); setSliding(false); }, 320);
      startCooldown();
    } catch (fError) {
      console.error(fError);
      setError('Connection error checking database entries. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp]; next[index] = digit; setOtp(next); setError(null);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft'  && index > 0) otpRefs.current[index - 1]?.focus();
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    setIsLoading(true);
    setError(null);
    const result = verifyOTP(email, code) || (devCode && code === devCode);
    if (!result) {
      setError('Incorrect or expired code. Please try again.');
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const dbResult = await response.json();
      if (dbResult.success) {
        clearOTP(email);
        setUser({ username, email, password, createdAt: new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Dublin' }).substring(0, 16) });
        setIsLoggedIn(true);
        setIsFirstBoot(false);
      } else {
        setError(dbResult.error || 'Database rejected entry registration.');
      }
    } catch (apiError) {
      console.error(apiError);
      setError('Server network error saving account data.');
    } finally {
      setIsLoading(false);
    }
  };

 const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsLoading(true);
  setError(null);
  try {
    const identifier = loginIdentifier?.trim();
    const pwd = loginPasswordRef.current?.value?.trim() || loginPassword?.trim() || '';
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: pwd }),
    });
    const result = await response.json();
    if (response.ok && result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      setIsFirstBoot(false);
    } else if (response.status === 403) {
      setError(result.error); // shows "This account has been banned." or "This account is frozen."
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  } catch (err) {
    console.error(err);
    setError('Server connection error during login.');
  } finally {
    setIsLoading(false);
  }
};

  const handleResend = async () => {
    if (cooldown > 0) return;
    clearOTP(email);
    setOtp(Array(6).fill(''));
    setError(null);
    setIsLoading(true);
    const result = await sendOTP(email);
    setIsLoading(false);
    if (result.devCode) setDevCode(result.devCode);
    startCooldown();
  };

  const fields = [
    { id: 'username', label: 'Username',         type: 'text',     value: username,        setter: setUsername },
    { id: 'email',    label: 'Email',            type: 'email',    value: email,           setter: setEmail },
    { id: 'password', label: 'Password',         type: 'password', value: password,        setter: setPassword },
    { id: 'confirm',  label: 'Confirm Password', type: 'password', value: confirmPassword, setter: setConfirmPassword },
  ];

  // Spinner style reused across buttons
  const spinner = (
    <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 38% 52%, #07101d 0%, #02050b 75%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, "Inter", sans-serif)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes regFadeIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes slideOutLeft {
          from { opacity:1; transform:translateX(0); }
          to   { opacity:0; transform:translateX(-36px); }
        }
        @keyframes otpSlideIn {
          from { opacity:0; transform:translateX(36px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes amb {
          0%,100% { opacity:.15; transform:scale(1); }
          50%     { opacity:.26; transform:scale(1.07); }
        }
        @keyframes devPop {
          from { opacity:0; transform:translateX(-50%) translateY(-6px) scale(0.95); }
          to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes digitPop {
          0%   { transform:scale(1); }
          40%  { transform:scale(1.14); }
          100% { transform:scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .reg-input::placeholder { color:rgba(255,255,255,0.24); }
        .reg-input:focus        { outline:none; }
        .otp-box::placeholder   { color:rgba(255,255,255,0.12); }
        .otp-box:focus          { outline:none; }
        .ghost-btn:hover        { color:rgba(255,255,255,0.70) !important; }
        .primary-btn:hover      { background:rgba(96,165,250,0.26) !important; }
        .primary-btn:active     { transform:scale(0.97) !important; }
      `}</style>

      {[
        { w: 640, h: 640, c: 'rgba(96,165,250,0.11)',  top: '-8%',  left: '-4%'  },
        { w: 420, h: 420, c: 'rgba(139,92,246,0.07)',  bottom: '-6%', right: '8%' },
        { w: 280, h: 280, c: 'rgba(6,182,212,0.06)',   top: '60%',  left: '58%'  },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
          background: `radial-gradient(circle,${b.c} 0%,transparent 70%)`,
          filter: 'blur(62px)', pointerEvents: 'none',
          top: (b as {top?:string}).top, left: (b as {left?:string}).left,
          bottom: (b as {bottom?:string}).bottom, right: (b as {right?:string}).right,
          animation: `amb ${9 + i * 3}s ease-in-out ${i * 2.5}s infinite`,
        }} />
      ))}

      <div style={{
        position: 'relative', width: 416,
        background: 'rgba(11,14,24,0.91)',
        backdropFilter: 'blur(36px) saturate(170%)',
        WebkitBackdropFilter: 'blur(36px) saturate(170%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 22,
        boxShadow: '0 40px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '36px 32px 32px',
        animation: 'regFadeIn 0.55s cubic-bezier(0.22,1,0.36,1) both',
        overflow: 'hidden',
      }}>

        {devCode && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(6,182,212,0.13)', border: '1px solid rgba(6,182,212,0.32)',
            borderRadius: 9, padding: '6px 16px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'rgba(103,232,249,0.95)', whiteSpace: 'nowrap',
            animation: 'devPop 0.3s ease both', zIndex: 10,
          }}>
            DEV &nbsp;·&nbsp; OTP:&nbsp;
            <span style={{ fontSize: 13, letterSpacing: '0.22em', fontFamily: 'monospace' }}>{devCode}</span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 26, marginTop: devCode ? 30 : 0, transition: 'margin 0.3s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 13, fontSize: 18 }}>
            {(() => {
        const Icon = stageIconMap[stage];
        return Icon ? <Icon style={{ width: 24, height: 24, marginBottom: 4 }} /> : null;
      })()}
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.93)', letterSpacing: '-0.025em' }}>
            {stage === 'form' ? 'Welcome to Troy OS' : stage === 'login' ? 'Welcome back' : 'Check your email'}
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.33)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {stage === 'form' ? 'First boot · create account' : stage === 'login' ? 'Sign in to your account' : `Code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '9px 13px', borderRadius: 9, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', fontSize: 12, color: 'rgba(252,165,165,0.92)', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* ── FORM STAGE ── */}
        {stage === 'form' && (
          <form onSubmit={handleFormSubmit} style={{ animation: sliding ? 'slideOutLeft 0.32s ease forwards' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((f) => (
                <div key={f.id}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{f.label}</label>
                  <input className="reg-input" type={f.type} value={f.value}
                    onChange={(e) => { f.setter(e.target.value); setError(null); }}
                    onFocus={() => setFocusedField(f.id)} onBlur={() => setFocusedField(null)} required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: focusedField === f.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)', border: focusedField === f.id ? '1px solid rgba(96,165,250,0.44)' : '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s', boxShadow: focusedField === f.id ? '0 0 0 3px rgba(96,165,250,0.09)' : 'none' }}
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={isLoading} className="primary-btn" style={{ marginTop: 20, width: '100%', padding: '11px 0', borderRadius: 10, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.90)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? <>{spinner} Checking…</> : 'Continue →'}
            </button>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button type="button" onClick={() => { setStage('login'); setError(null); }} style={{ background: 'none', border: 'none', color: 'rgba(96,165,250,0.8)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                Already have an account? Log in
              </button>
            </div>
          </form>
        )}

        {/* ── LOGIN STAGE ── */}
        {stage === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Username or Email</label>
              <input className="reg-input" type="text" value={loginIdentifier} onChange={e => { setLoginIdentifier(e.target.value); setError(null); }} required
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit' }} />
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.34)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
              <input ref={loginPasswordRef} className="reg-input" type="password" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setError(null); }} required
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <button type="submit" disabled={isLoading} className="primary-btn" style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.90)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? <>{spinner} Logging in…</> : 'Log In'}
            </button>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button type="button" onClick={() => { setStage('form'); setError(null); }} style={{ background: 'none', border: 'none', color: 'rgba(96,165,250,0.8)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                ← Create new account
              </button>
            </div>
          </form>
        )}

        {/* ── OTP STAGE ── */}
        {stage === 'otp' && (
          <form onSubmit={handleOtpSubmit} style={{ animation: 'otpSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginBottom: 22 }}>
              {otp.map((digit, i) => (
                <input key={i} ref={(el) => { otpRefs.current[i] = el; }} className="otp-box"
                  type="text" inputMode="numeric" maxLength={1} value={digit} autoFocus={i === 0}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)} onPaste={handleOtpPaste}
                  style={{ width: 44, height: 54, borderRadius: 12, textAlign: 'center', fontSize: 21, fontWeight: 700, fontFamily: 'monospace', background: digit ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.04)', border: digit ? '1px solid rgba(96,165,250,0.48)' : '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.95)', transition: 'background 0.15s, border-color 0.15s', boxShadow: digit ? '0 0 0 3px rgba(96,165,250,0.10)' : 'none', caretColor: 'transparent', animation: digit ? 'digitPop 0.2s ease' : 'none' }}
                />
              ))}
            </div>
            <button type="submit" className="primary-btn" disabled={otp.join('').length < 6 || isLoading} style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.30)', color: 'rgba(255,255,255,0.90)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: (otp.join('').length < 6 || isLoading) ? 'not-allowed' : 'pointer', opacity: (otp.join('').length < 6 || isLoading) ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? <>{spinner} Creating account…</> : 'Verify & Create Account'}
            </button>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="ghost-btn" onClick={() => { setStage('form'); setOtp(Array(6).fill('')); setError(null); setDevCode(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: 'rgba(255,255,255,0.30)', fontFamily: 'inherit' }}>
                ← Back
              </button>
              <button type="button" onClick={handleResend} disabled={cooldown > 0 || isLoading} style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: cooldown > 0 ? 'rgba(255,255,255,0.26)' : 'rgba(96,165,250,0.80)', cursor: cooldown > 0 ? 'default' : 'pointer' }}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : isLoading ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.16)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Troy OS · First Boot Setup
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;