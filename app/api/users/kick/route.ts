import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/services/sheetService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const kickedAt = new Date().toISOString();
    await updateUser(email, { kickedAt });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Kick failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}