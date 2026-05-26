// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUsers, updateLastLogin } from '@/services/sheetService';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const users = await fetchAllUsers();

    const user = users.find(
      (u) =>
        (u.email?.trim().toLowerCase() === identifier?.trim().toLowerCase() ||
         u.username?.trim().toLowerCase() === identifier?.trim().toLowerCase()) &&
        u.password?.trim() === password?.trim()
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Your account has been permanently banned.' }, { status: 403 });
    }

    // frozen users are allowed in — they hit the FrozenScreen overlay instead
    await updateLastLogin(user.email);

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}