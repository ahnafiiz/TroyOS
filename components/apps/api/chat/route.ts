// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Map your messages to the format Gemini expects
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are TROY, a helpful AI assistant embedded inside a futuristic OS interface. Be concise, friendly, and helpful. Keep responses short.",
      }
    });

    return NextResponse.json({ reply: response.text });

  } catch (err) {
    console.error('Gemini API Error:', err);
    return NextResponse.json({ error: 'TS api keys cost too much man :wilted_rose:' }, { status: 500 });
  }
}