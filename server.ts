import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your modular API route handlers
import authHandler from './api/auth';
import casesHandler from './api/cases';
import assessHandler from './api/assess';
import explainHandler from './api/explain';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// --- API AUTH ROUTE ---
app.all('/api/auth', async (req: Request, res: Response) => {
  return await authHandler(req, res);
});

// --- API CASES ROUTE ---
app.all('/api/cases', async (req: Request, res: Response) => {
  return await casesHandler(req, res);
});

// --- API ASSESS ROUTE ---
app.all('/api/assess', async (req: Request, res: Response) => {
  return await assessHandler(req, res);
});

// --- API EXPLAIN ROUTE ---
app.all('/api/explain', async (req: Request, res: Response) => {
  return await explainHandler(req, res);
});

// Serve frontend static files if built into 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
