// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are TROY, a helpful AI assistant embedded inside a futuristic OS interface. Be concise, friendly, and helpful. Keep responses short unless detail is needed.',
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Anthropic error:', data);
      return NextResponse.json({ error: data }, { status: res.status });
    }

    const reply = data.content?.[0]?.text ?? 'No response.';
    return NextResponse.json({ reply });

  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}