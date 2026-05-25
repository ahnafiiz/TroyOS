import { NextResponse } from 'next/server';
import { findUser, addUser } from '../../../../services/sheetService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');
    if (!identifier) return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });

    const existingUser = await findUser(identifier);
    return NextResponse.json({ exists: !!existingUser });
  } catch {
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    const newUser = await addUser({
      username,
      email,
      password,
      createdAt: formattedDate
    });

    return NextResponse.json({ success: true, user: { username: newUser.username, email: newUser.email } });
  } catch {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}
