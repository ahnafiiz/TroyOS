import { NextRequest, NextResponse } from 'next/server';
import { fetchLogs, writeLog, LogEntry } from '@/services/sheetService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emails = searchParams.getAll('email');
    const logs = await fetchLogs(emails.length > 0 ? emails : undefined);
    return NextResponse.json(logs);
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const entry: LogEntry = await req.json();
    await writeLog(entry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to write log:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}