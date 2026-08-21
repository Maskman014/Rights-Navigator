// Case Vault Database API — Persistent Store for Assessments & Action Plans
import fs from 'fs';
import path from 'path';

export interface SavedCase {
  id: string;
  userId: string; // Added user scoping
  createdAt: string;
  domain: string;
  state: string;
  district: string;
  incidentDate: string;
  status: 'supported' | 'partial' | 'unavailable';
  matchedStatutesCount: number;
  statutes: Array<{ title: string; statute: string; summary: string }>;
  formState: any;
  assessmentData: any;
  noticeDraft?: string;
}

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'savedCases.json');

function loadCases(): SavedCase[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading cases DB:', e);
  }
  return [];
}

function saveCases(cases: SavedCase[]) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(cases, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing cases DB:', e);
  }
}

function generateCaseId(domain: string): string {
  const prefix = (domain || 'CASE').substring(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RN-${prefix}-${new Date().getFullYear()}-${rand}`;
}

function getUserIdFromToken(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return Buffer.from(token, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

export default function handler(req: any, res: any) {
  const method = req.method;
  const url = new URL(req.url || '', 'http://localhost');
  const queryId = url.searchParams.get('id');

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    if (method === 'GET') {
      const cases = loadCases().filter(c => c.userId === userId);
      if (queryId) {
        const found = cases.find(c => c.id === queryId);
        if (!found) {
          res.status(404).json({ error: 'Case not found' });
          return;
        }
        res.status(200).json(found);
        return;
      }
      res.status(200).json(cases);
      return;
    }

    if (method === 'POST') {
      const body = req.body || {};
      const { formState, assessmentData, noticeDraft } = body;

      if (!formState || !formState.domain) {
        res.status(400).json({ error: 'Invalid payload: formState required' });
        return;
      }

      const newCase: SavedCase = {
        id: generateCaseId(formState.domain),
        userId,
        createdAt: new Date().toISOString(),
        domain: formState.domain,
        state: formState.state || '',
        district: formState.district || '',
        incidentDate:
          formState.incidentYear && formState.incidentMonth
            ? `${formState.incidentYear}-${formState.incidentMonth}`
            : 'Unspecified',
        status: assessmentData?.status || 'supported',
        matchedStatutesCount: assessmentData?.statutes?.length || 0,
        statutes: assessmentData?.statutes || [],
        formState,
        assessmentData,
        noticeDraft: noticeDraft || '',
      };

      const existing = loadCases();
      const cases = [newCase, ...existing.filter(c => c.id !== newCase.id)];
      saveCases(cases);

      res.status(201).json({
        success: true,
        message: 'Case successfully saved to vault',
        case: newCase,
      });
      return;
    }

    if (method === 'DELETE') {
      if (!queryId) {
        res.status(400).json({ error: 'Missing case id parameter' });
        return;
      }
      const existing = loadCases();
      // Ensure the case belongs to the user
      const caseToDelete = existing.find(c => c.id === queryId);
      if (!caseToDelete || caseToDelete.userId !== userId) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const filtered = existing.filter(c => c.id !== queryId);
      saveCases(filtered);

      res.status(200).json({ success: true, message: 'Case deleted', id: queryId });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Cases DB handler error:', err);
    res.status(500).json({ error: err.message || 'Internal database error' });
  }
}
