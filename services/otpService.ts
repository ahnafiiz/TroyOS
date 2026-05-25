interface OTPRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

const OTP_TTL_MS   = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const OTP_LENGTH   = 6;

function generateCode(): string {
  const num = Math.floor(Math.random() * 10 ** OTP_LENGTH);
  return String(num).padStart(OTP_LENGTH, '0');
}

export interface SendOTPResult {
  success: boolean;
  devCode?: string;
  error?: string;
}

export async function sendOTP(email: string): Promise<SendOTPResult> {
  const code = generateCode();
  const key  = email.toLowerCase().trim();

  otpStore.set(key, {
    code,
    email: key,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[Troy OS — OTP] Send failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.error('[Troy OS — OTP] Network error:', err);
    return { success: false, error: 'Network error' };
  }

  return { success: true };
}

export type VerifyOTPResult =
  | { valid: true }
  | { valid: false; reason: 'expired' | 'wrong' | 'max_attempts' | 'not_found' };

export function verifyOTP(email: string, code: string): VerifyOTPResult {
  const key    = email.toLowerCase().trim();
  const record = otpStore.get(key);

  if (!record)                         return { valid: false, reason: 'not_found' };
  if (Date.now() > record.expiresAt)   { otpStore.delete(key); return { valid: false, reason: 'expired' }; }
  if (record.attempts >= MAX_ATTEMPTS) return { valid: false, reason: 'max_attempts' };

  record.attempts++;

  if (record.code !== code.trim()) return { valid: false, reason: 'wrong' };

  otpStore.delete(key);
  return { valid: true };
}

export function clearOTP(email: string): void {
  otpStore.delete(email.toLowerCase().trim());
}