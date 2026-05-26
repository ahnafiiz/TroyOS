import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUsers, updateUser, updateLastLogin } from '@/services/sheetService';

export async function GET() {
  try {
    const users = await fetchAllUsers();
    return NextResponse.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, updates } = await req.json();
    await updateUser(email, updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update user:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email } = await req.json();
    await updateLastLogin(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update last login:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}