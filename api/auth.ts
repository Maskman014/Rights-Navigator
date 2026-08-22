
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

function loadUsers(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8').trim();
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Error reading users DB:', e);
  }
  return [];
}

function saveUsers(users: any[]) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing users DB:', e);
  }
}

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default function handler(req: any, res: any) {
  const method = req.method;
  const url = new URL(req.url || '', 'http://localhost');
  const action = url.searchParams.get('action'); // e.g. ?action=login or ?action=register

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = loadUsers();

    if (action === 'register') {
      if (users.find((u: any) => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const newUser = {
        id: crypto.randomUUID(),
        username,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    }

    if (action === 'login') {
      const user = users.find((u: any) => u.username === username);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Simple pseudo-token using base64 encoded user ID
      const token = Buffer.from(user.id).toString('base64');

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, username: user.username },
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    console.error('Auth handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
