// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type GeminiContent = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

type GeminiSuccessResponse = {
  text?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      );
    }

    const contents: GeminiContent[] = body.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction:
          'You are TROY, a helpful AI assistant embedded inside a futuristic OS interface. Be concise, friendly, and helpful.',
      },
    });

    // Safer extraction (prevents undefined crashes)
    const reply =
      (result as unknown as GeminiSuccessResponse)?.text ??
      'No response generated';

    return NextResponse.json(
      {
        success: true,
        reply,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);

    const message =
      err instanceof Error ? err.message : 'Unknown server error';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}