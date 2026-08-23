const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables!');
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// --- API AUTH ROUTES ---
app.post('/api/auth', async (req, res) => {
  const action = req.query.action;
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    if (action === 'register') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const { error } = await supabase.from('users').insert([
        { email: username, password_hash: hashPassword(password) }
      ]);

      if (error) throw error;

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    }

    if (action === 'login') {
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
    console.error('Auth error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// --- API ASSESS ROUTE ---
app.all('/api/assess', async (req, res) => {
  try {
    return res.status(200).json({ success: true, count: 0, message: 'Assessment endpoint ready' });
  } catch (err) {
    console.error('Assess error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// --- API EXPLAIN ROUTE ---
app.all('/api/explain', async (req, res) => {
  try {
    return res.status(200).json({ success: true, explanation: 'Explanation generated successfully' });
  } catch (err) {
    console.error('Explain error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// --- API CASES ROUTE ---
app.all('/api/cases', async (req, res) => {
  try {
    return res.status(200).json({ success: true, cases: [] });
  } catch (err) {
    console.error('Cases error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Serve frontend static files if you built your Vite app into 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
