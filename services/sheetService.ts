import { promises as fs } from "fs";
import path from 'path';
import { google, sheets_v4 } from "googleapis";

export interface User {
  role?: 'user' | 'admin';
  isBanned?: boolean;
  isFrozen?: boolean;
  username: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

let sheets: sheets_v4.Sheets | null = null;

async function getSheetsClient() {
  if (sheets) return sheets;

  const credPath = path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '');
  const credentials = JSON.parse(await fs.readFile(credPath, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// Sheet column layout:
// A=username, B=email, C=password, D=createdAt, E=role, F=isBanned, G=isFrozen, H=lastLogin

export async function fetchAllUsers(): Promise<User[]> {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: "Users!A:H",
  });
  const rows = res.data.values ?? [];
  const start = rows[0]?.[0] === "username" ? 1 : 0;
  return rows.slice(start).map((r) => ({
    username:  String(r[0] || ""),
    email:     String(r[1] || ""),
    password:  r[2] ? String(r[2]) : undefined,
    createdAt: String(r[3] || ""),
    role:      (String(r[4] || "user") as 'user' | 'admin'),
    isBanned:  String(r[5] || "no").toLowerCase() === "yes",
    isFrozen:  String(r[6] || "no").toLowerCase() === "yes",
    lastLogin: r[7] ? String(r[7]) : undefined,
  }));
}

export async function findUser(identifier: string): Promise<User | undefined> {
  const lowered = identifier.toLowerCase();
  const client = await getSheetsClient();
  const response = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: "Users!A:H",
  });
  const rows = response.data.values ?? [];
  const startIdx = rows[0]?.[0] === "username" ? 1 : 0;
  for (let i = startIdx; i < rows.length; i++) {
    const [username, email, password, createdAt, role, isBanned, isFrozen, lastLogin] = rows[i];
    if (!username) continue;
    if (username.toLowerCase() === lowered || (email && email.toLowerCase() === lowered)) {
      return {
        username:  String(username),
        email:     String(email),
        password:  password ? String(password) : undefined,
        createdAt: String(createdAt),
        role:      (String(role || "user") as 'user' | 'admin'),
        isBanned:  String(isBanned || "no").toLowerCase() === "yes",
        isFrozen:  String(isFrozen || "no").toLowerCase() === "yes",
        lastLogin: lastLogin ? String(lastLogin) : undefined,
      };
    }
  }
  return undefined;
}

export async function addUser(user: User): Promise<User> {
  const client = await getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: "Users!A:H",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        user.username,
        user.email,
        user.password ?? '',
        user.createdAt,
        user.role ?? 'user',
        user.isBanned ? 'yes' : 'no',
        user.isFrozen ? 'yes' : 'no',
        '',
      ]],
    },
  });
  return user;
}

export async function updateUser(email: string, updates: Partial<User>): Promise<void> {
  const client = await getSheetsClient();
  const resp = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: "Users!A:H",
  });
  const rows = resp.data.values ?? [];
  const startIdx = rows[0]?.[0] === "username" ? 1 : 0;
  const colMap = { username: 0, email: 1, password: 2, createdAt: 3, role: 4, isBanned: 5, isFrozen: 6, lastLogin: 7 };

  for (let i = startIdx; i < rows.length; i++) {
    if (rows[i][1]?.toString().toLowerCase() === email.toLowerCase()) {
      const rowNumber = i + 1;
      const row = [...rows[i]];
      if (updates.password  !== undefined) row[colMap.password]  = updates.password;
      if (updates.role      !== undefined) row[colMap.role]      = updates.role;
      if (updates.isBanned  !== undefined) row[colMap.isBanned]  = updates.isBanned  ? 'yes' : 'no';
      if (updates.isFrozen  !== undefined) row[colMap.isFrozen]  = updates.isFrozen  ? 'yes' : 'no';
      if (updates.lastLogin !== undefined) row[colMap.lastLogin] = updates.lastLogin;
      await client.spreadsheets.values.update({
        spreadsheetId: process.env.USER_SHEET_ID!,
        range: `Users!A${rowNumber}:H${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
      return;
    }
  }
  throw new Error('User not found for update');
}

export async function updateLastLogin(email: string): Promise<void> {
  const client = await getSheetsClient();

  const response = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Users!B:B',
  });

  const rows = response.data.values || [];
  const startIdx = rows[0]?.[0]?.toLowerCase() === 'email' ? 1 : 0;
  const rowIndex = rows.findIndex(
    (row, i) => i >= startIdx && row[0]?.toLowerCase() === email.toLowerCase()
  );

  if (rowIndex === -1) throw new Error(`User not found: ${email}`);

  const actualRow = rowIndex + 1;
  const timestamp = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Europe/Dublin' })
    .substring(0, 16);

  await client.spreadsheets.values.update({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: `Users!H${actualRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[timestamp]] },
  });
}

export async function autoFormatPastLogins(): Promise<void> {
  const client = await getSheetsClient();
  const spreadsheetId = process.env.USER_SHEET_ID!;

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Users!A:H',
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return;

  const updatedRows = rows.map(r => [...r]);
  let hasChanges = false;

  const cleanTimestamp = (val: string | undefined): string => {
    if (!val || val.trim() === '') return '';
    const dateObj = /^\d+$/.test(val) ? new Date(parseInt(val, 10)) : new Date(val);
    if (isNaN(dateObj.getTime())) return val;
    return dateObj.toISOString().replace('T', ' ').substring(0, 16);
  };

  for (let i = 1; i < rows.length; i++) {
    const createdAtIdx = 3; // D
    const lastLoginIdx = 7; // H

    const cleanCreated = cleanTimestamp(rows[i][createdAtIdx]);
    const cleanLogin   = cleanTimestamp(rows[i][lastLoginIdx]);

    if (rows[i][createdAtIdx] !== cleanCreated) {
      updatedRows[i][createdAtIdx] = cleanCreated;
      hasChanges = true;
    }
    if (rows[i][lastLoginIdx] !== cleanLogin) {
      updatedRows[i][lastLoginIdx] = cleanLogin;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: updatedRows },
    });
    console.log("Past logins auto-formatted.");
  }
}