import { NextResponse } from 'next/server';
import { findUser, updateLastLogin } from '../../../../services/sheetService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await findUser(identifier);

    if (!user || (user.password?.trim() !== password?.trim())) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'This account has been banned.' }, { status: 403 });
    }

    if (user.isFrozen) {
      return NextResponse.json({ error: 'This account is frozen.' }, { status: 403 });
    }

    await updateLastLogin(user.email);

    return NextResponse.json({
      success: true,
      user: {
        username:  user.username,
        email:     user.email,
        password:  user.password,
        role:      user.role      ?? 'user',
        isBanned:  user.isBanned  ?? false,
        isFrozen:  user.isFrozen  ?? false,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json({ error: 'Login authentication failed' }, { status: 500 });
  }
}