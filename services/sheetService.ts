import { google, sheets_v4 } from "googleapis";

export interface User {
  role?: 'owner' | 'admin' | 'moderator' | 'user';
  isBanned?: boolean;
  isFrozen?: boolean;
  isMuted?: boolean;
  isBannable?: boolean;
  isFreezeable?: boolean;
  banUntil?: string;
  freezeUntil?: string;
  muteUntil?: string;
  kickedAt?: string;
  username: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LogEntry {
  timestamp: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  targetEmail: string;
  details: string;
}

let sheets: sheets_v4.Sheets | null = null;

async function getSheetsClient() {
  if (sheets) return sheets;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

const parseBool = (val: unknown, defaultVal = false) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const s = String(val).toLowerCase().trim();
  if (s === 'yes' || s === 'true' || s === '1') return true;
  if (s === 'no'  || s === 'false'|| s === '0') return false;
  return defaultVal;
};

// Sheet column layout (Users tab):
// A=username B=email C=password D=createdAt E=role
// F=isBanned G=isFrozen H=lastLogin I=banUntil J=freezeUntil
// K=isMuted L=muteUntil M=isFreezeable N=isBannable O=kickedAt

const COL = {
  username: 0, email: 1, password: 2, createdAt: 3, role: 4,
  isBanned: 5, isFrozen: 6, lastLogin: 7, banUntil: 8, freezeUntil: 9,
  isMuted: 10, muteUntil: 11, isFreezeable: 12, isBannable: 13, kickedAt: 14,
};

function rowToUser(r: string[]): User {
  return {
    username:    String(r[COL.username]    || ''),
    email:       String(r[COL.email]       || ''),
    password:    r[COL.password]  ? String(r[COL.password])  : undefined,
    createdAt:   String(r[COL.createdAt]   || ''),
    role:        (String(r[COL.role] || 'user') as User['role']),
    isBanned:    parseBool(r[COL.isBanned]),
    isFrozen:    parseBool(r[COL.isFrozen]),
    lastLogin:   r[COL.lastLogin]  ? String(r[COL.lastLogin])  : undefined,
    banUntil:    r[COL.banUntil]   ? String(r[COL.banUntil])   : undefined,
    freezeUntil: r[COL.freezeUntil]? String(r[COL.freezeUntil]): undefined,
    isMuted:     parseBool(r[COL.isMuted]),
    muteUntil:   r[COL.muteUntil]  ? String(r[COL.muteUntil])  : undefined,
    isFreezeable:parseBool(r[COL.isFreezeable], true),
    isBannable:  parseBool(r[COL.isBannable],   true),
    kickedAt:    r[COL.kickedAt]   ? String(r[COL.kickedAt])   : undefined,
  };
}

export async function fetchAllUsers(): Promise<User[]> {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Users!A:O',
  });
  const rows = res.data.values ?? [];
  const start = rows[0]?.[0]?.toLowerCase() === 'username' ? 1 : 0;
  return rows.slice(start).filter(r => r[0]).map(rowToUser);
}

export async function findUser(identifier: string): Promise<User | undefined> {
  const lowered = identifier.toLowerCase();
  const users = await fetchAllUsers();
  return users.find(
    u => u.email.toLowerCase() === lowered || u.username.toLowerCase() === lowered
  );
}

export async function addUser(user: User): Promise<User> {
  const client = await getSheetsClient();
  const row = Array(15).fill('');
  row[COL.username]    = user.username;
  row[COL.email]       = user.email;
  row[COL.password]    = user.password ?? '';
  row[COL.createdAt]   = user.createdAt;
  row[COL.role]        = user.role ?? 'user';
  row[COL.isBanned]    = user.isBanned    ? 'yes' : 'no';
  row[COL.isFrozen]    = user.isFrozen    ? 'yes' : 'no';
  row[COL.lastLogin]   = '';
  row[COL.banUntil]    = user.banUntil    ?? '';
  row[COL.freezeUntil] = user.freezeUntil ?? '';
  row[COL.isMuted]     = 'no';
  row[COL.muteUntil]   = '';
  row[COL.isFreezeable]= 'yes';
  row[COL.isBannable]  = 'yes';
  row[COL.kickedAt]    = '';
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Users!A:O',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return user;
}

export async function updateUser(email: string, updates: Partial<User>): Promise<void> {
  const client = await getSheetsClient();
  const resp = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Users!A:O',
  });
  const rows = resp.data.values ?? [];
  const startIdx = rows[0]?.[0]?.toLowerCase() === 'username' ? 1 : 0;

  for (let i = startIdx; i < rows.length; i++) {
    if (rows[i][COL.email]?.toString().toLowerCase() === email.toLowerCase()) {
      const row = [...rows[i]];
      while (row.length < 15) row.push('');

      if (updates.password     !== undefined) row[COL.password]     = updates.password;
      if (updates.role         !== undefined) row[COL.role]         = updates.role;
      if (updates.isBanned     !== undefined) row[COL.isBanned]     = updates.isBanned     ? 'yes' : 'no';
      if (updates.isFrozen     !== undefined) row[COL.isFrozen]     = updates.isFrozen     ? 'yes' : 'no';
      if (updates.isMuted      !== undefined) row[COL.isMuted]      = updates.isMuted      ? 'yes' : 'no';
      if (updates.isFreezeable !== undefined) row[COL.isFreezeable] = updates.isFreezeable ? 'yes' : 'no';
      if (updates.isBannable   !== undefined) row[COL.isBannable]   = updates.isBannable   ? 'yes' : 'no';
      if (updates.lastLogin    !== undefined) row[COL.lastLogin]    = updates.lastLogin;
      if (updates.banUntil     !== undefined) row[COL.banUntil]     = updates.banUntil;
      if (updates.freezeUntil  !== undefined) row[COL.freezeUntil]  = updates.freezeUntil;
      if (updates.muteUntil    !== undefined) row[COL.muteUntil]    = updates.muteUntil;
      if (updates.kickedAt     !== undefined) row[COL.kickedAt]     = updates.kickedAt;

      await client.spreadsheets.values.update({
        spreadsheetId: process.env.USER_SHEET_ID!,
        range: `Users!A${i + 1}:O${i + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
      });
      return;
    }
  }
  throw new Error('User not found for update');
}

export async function updateLastLogin(email: string): Promise<void> {
  const timestamp = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Europe/Dublin' })
    .substring(0, 16);
  await updateUser(email, { lastLogin: timestamp });
}

// ─── LOGS ────────────────────────────────────────────────────
// Logs tab columns: A=timestamp B=adminEmail C=adminRole D=action E=targetEmail F=details

export async function writeLog(entry: LogEntry): Promise<void> {
  const client = await getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Logs!A:F',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        entry.timestamp,
        entry.adminEmail,
        entry.adminRole,
        entry.action,
        entry.targetEmail,
        entry.details,
      ]],
    },
  });
}

export async function fetchLogs(targetEmails?: string[]): Promise<LogEntry[]> {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.USER_SHEET_ID!,
    range: 'Logs!A:F',
  });
  const rows = res.data.values ?? [];
  const start = rows[0]?.[0]?.toLowerCase() === 'timestamp' ? 1 : 0;
  const entries: LogEntry[] = rows.slice(start).map(r => ({
    timestamp:   String(r[0] || ''),
    adminEmail:  String(r[1] || ''),
    adminRole:   String(r[2] || ''),
    action:      String(r[3] || ''),
    targetEmail: String(r[4] || ''),
    details:     String(r[5] || ''),
  }));
  if (!targetEmails || targetEmails.length === 0) return entries;
  const lowered = targetEmails.map(e => e.toLowerCase());
  return entries.filter(e => lowered.includes(e.targetEmail.toLowerCase()));
}

export async function autoFormatPastLogins(): Promise<void> {
  const client = await getSheetsClient();
  const spreadsheetId = process.env.USER_SHEET_ID!;
  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Users!A:O',
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
    const cleanCreated = cleanTimestamp(rows[i][COL.createdAt]);
    const cleanLogin   = cleanTimestamp(rows[i][COL.lastLogin]);
    if (rows[i][COL.createdAt] !== cleanCreated) { updatedRows[i][COL.createdAt] = cleanCreated; hasChanges = true; }
    if (rows[i][COL.lastLogin] !== cleanLogin)   { updatedRows[i][COL.lastLogin] = cleanLogin;   hasChanges = true; }
  }

  if (hasChanges) {
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: updatedRows },
    });
  }
}