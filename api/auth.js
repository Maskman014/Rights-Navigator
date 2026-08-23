const crypto = require('crypto');
const supabase = require('./db');

console.log("SUPABASE AUTH API CALLED");

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url || '', 'http://localhost');
  const action = url.searchParams.get('action');

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (action === 'register') {
      // Check if user already exists in Supabase 'users' table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Insert new user into Supabase
      const { error } = await supabase.from('users').insert([
        { email: username, password_hash: hashPassword(password) }
      ]);

      if (error) throw error;

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    }

    if (action === 'login') {
      // Fetch user from Supabase 'users' table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (error || !user || user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = Buffer.from(user.id.toString()).toString('base64');

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id.toString(), username: user.email },
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
