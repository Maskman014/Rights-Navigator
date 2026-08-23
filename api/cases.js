// Case Vault Database API — Persistent Store for Assessments & Action Plans (MongoDB Edition)
import { connectDB } from './db';
import { Case } from './models';

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

function generateCaseId(domain: string): string {
  const prefix = (domain || 'CASE').substring(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RN-${prefix}-${new Date().getFullYear()}-${rand}`;
}

export default async function handler(req: any, res: any) {
  const method = req.method;
  const url = new URL(req.url || '', 'http://localhost');
  const queryId = url.searchParams.get('id');

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    await connectDB();

    if (method === 'GET') {
      const cases = await Case.find({ userId }).sort({ createdAt: -1 });
      if (queryId) {
        const found = cases.find((c: any) => c.caseData?.id === queryId || c._id.toString() === queryId);
        if (!found) {
          return res.status(404).json({ error: 'Case not found' });
        }
        return res.status(200).json(found.caseData);
      }
      return res.status(200).json(cases.map((c: any) => c.caseData));
    }

    if (method === 'POST') {
      const body = req.body || {};
      const { formState, assessmentData, noticeDraft } = body;

      if (!formState || !formState.domain) {
        return res.status(400).json({ error: 'Invalid payload: formState required' });
      }

      const caseId = generateCaseId(formState.domain);
      const newCaseObj = {
        id: caseId,
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

      // Save into MongoDB
      await Case.create({
        userId,
        caseData: newCaseObj,
      });

      return res.status(201).json({
        success: true,
        message: 'Case successfully saved to vault',
        case: newCaseObj,
      });
    }

    if (method === 'DELETE') {
      if (!queryId) {
        return res.status(400).json({ error: 'Missing case id parameter' });
      }

      // Find and delete matching case where userId matches and caseData.id matches queryId
      const deleted = await Case.findOneAndDelete({
        userId,
        'caseData.id': queryId,
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Case not found' });
      }

      return res.status(200).json({ success: true, message: 'Case deleted', id: queryId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Cases DB handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal database error' });
  }
}
