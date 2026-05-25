// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUsers, updateLastLogin } from '@/services/sheetService';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    const users = await fetchAllUsers();

    console.log('All users:', JSON.stringify(users.map(u => ({ username: u.username, email: u.email, password: u.password }))));
    console.log('Trying:', { identifier, password });

    const user = users.find(
      (u) =>
        (u.email?.trim().toLowerCase() === identifier?.trim().toLowerCase() ||
         u.username?.trim().toLowerCase() === identifier?.trim().toLowerCase()) &&
        u.password?.trim() === password?.trim()
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