import { NextResponse } from 'next/server';
import { fetchAllUsers, updateUser } from '@/services/sheetService';

export async function POST() {
  try {
    const users = await fetchAllUsers();
    const now = Date.now();

    for (const user of users) {
      if (user.isBanned && user.banUntil && user.banUntil !== 'permanent') {
        const expiry = new Date(user.banUntil).getTime();
        if (!isNaN(expiry) && now >= expiry) {
          await updateUser(user.email, { isBanned: false, banUntil: '' });
          console.log(`Auto-unbanned: ${user.email}`);
        }
      }
      if (user.isFrozen && user.freezeUntil && user.freezeUntil !== 'permanent') {
        const expiry = new Date(user.freezeUntil).getTime();
        if (!isNaN(expiry) && now >= expiry) {
          await updateUser(user.email, { isFrozen: false, freezeUntil: '' });
          console.log(`Auto-unfrozen: ${user.email}`);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Expire check failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}