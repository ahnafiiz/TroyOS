// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUsers, updateLastLogin } from '@/services/sheetService';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    const users = await fetchAllUsers();

    const user = users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await updateLastLogin(user.email);

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}