// api/auth.ts
import crypto from 'crypto';
import { connectDB } from './db';
import { User } from './models';
console.log("AUTH API CALLED");
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req: any, res: any) {
  const method = req.method;
  const url = new URL(req.url || '', 'http://localhost');
  const action = url.searchParams.get('action');

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (action === 'register') {
      const existingUser = await User.findOne({ email: username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      await User.create({
        email: username,
        passwordHash: hashPassword(password),
        createdAt: new Date(),
      });

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    }

    if (action === 'login') {
      const user = await User.findOne({ email: username });
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = Buffer.from(user._id.toString()).toString('base64');

      return res.status(200).json({
        success: true,
        token,
        user: { id: user._id.toString(), username: user.email },
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
