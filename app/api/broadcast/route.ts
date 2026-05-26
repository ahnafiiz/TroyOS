import { NextRequest, NextResponse } from 'next/server';

// In-memory broadcast store — keyed by target email or 'all'
// Each client polls this on their cycle and picks up messages addressed to them
const broadcasts: Array<{
  id: string;
  target: string; // email or 'all'
  message: string;
  from: string;
  fromRole: string;
  dismissible: boolean;
  autoClose: number | null; // seconds, null = no auto close
  createdAt: string;
}> = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json([]);

    const relevant = broadcasts.filter(
      b => b.target === 'all' || b.target.toLowerCase() === email.toLowerCase()
    );
    return NextResponse.json(relevant);
  } catch (err) {
    console.error('Broadcast GET failed:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { target, message, from, fromRole, dismissible, autoClose } = await req.json();
    const broadcast = {
      id: crypto.randomUUID(),
      target,
      message,
      from,
      fromRole,
      dismissible: dismissible ?? true,
      autoClose:   autoClose   ?? null,
      createdAt: new Date().toISOString(),
    };
    broadcasts.push(broadcast);
    // Clean up old broadcasts after 10 minutes
    const tenMins = 10 * 60 * 1000;
    const cutoff = Date.now() - tenMins;
    while (broadcasts.length > 0 && new Date(broadcasts[0].createdAt).getTime() < cutoff) {
      broadcasts.shift();
    }
    return NextResponse.json({ ok: true, id: broadcast.id });
  } catch (err) {
    console.error('Broadcast POST failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const idx = broadcasts.findIndex(b => b.id === id);
    if (idx !== -1) broadcasts.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Broadcast DELETE failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}