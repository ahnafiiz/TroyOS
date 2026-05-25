import { NextResponse } from 'next/server';
import { findUser } from '../../../../services/sheetService';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';

async function getSheetsClient() {
  const credPath = path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '');
  const credentials = JSON.parse(await fs.readFile(credPath, 'utf8'));
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version: 'v4', auth });
}

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    if (!email || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await findUser(email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.USER_SHEET_ID!,
      range: 'Users!B:B',
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.toLowerCase() === email.toLowerCase());
    if (rowIndex === -1) return NextResponse.json({ error: 'User not found in sheet' }, { status: 404 });

    const actualRow = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.USER_SHEET_ID!,
      range: `Users!C${actualRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[newPassword]] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('RESET_PASSWORD_ERROR:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}