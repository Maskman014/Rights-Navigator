// Phase 4 — Gemini Explanation Layer + Citation Sanitizer.
//
// Gemini's job here is STRICTLY to phrase, in plain language, facts that
// the server has already validated. It never decides status, and any
// statement it produces that cites a source_id outside the server's
// validated list is discarded before the client ever sees it.
//
// GEMINI_API_KEY is read from process.env only — it is never sent to or
// readable from the browser. The client calls this endpoint, not Gemini
// directly.

import type { LegalSource } from "../src/types/legal";

// Updated to an active model ID
const MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

interface CitedStatement {
  text: string;
  source_ids: string[];
}

interface GeminiExplanationResponse {
  status: string;
  summary: CitedStatement;
  rights: CitedStatement[];
  procedural_steps: CitedStatement[];
  potential_relief: CitedStatement[];
}

const SYSTEM_PROMPT = `You are a plain-language legal explanation engine. You DO NOT determine whether a law applies or assign match status. You MUST ONLY explain the verified source records provided in this prompt. Use ONLY facts explicitly present in the supplied source records. DO NOT introduce monetary amounts, statutory deadlines, fee structures, remedies, procedures, portal URLs, or eligibility criteria unless those details are explicitly present in the supplied source record text. Every statement must cite a valid source_id from the sources array provided. Respond with STRICT JSON only, matching this exact shape, no markdown fences, no extra text:
{"status":"supported|partial|unavailable","summary":{"text":"...","source_ids":["..."]},"rights":[{"text":"...","source_ids":["..."]}],"procedural_steps":[{"text":"...","source_ids":["..."]}],"potential_relief":[{"text":"...","source_ids":["..."]}]}`;

function stripFences(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "");
  t = t.replace(/\s*```+\s*$/g, "");
  return t.trim();
}

function sanitizeStatements(
  statements: CitedStatement[] | undefined,
  validIds: Set<string>
): { kept: CitedStatement[]; discarded: number } {
  if (!Array.isArray(statements)) return { kept: [], discarded: 0 };
  let discarded = 0;
  const kept = statements.filter((s) => {
    if (!s || !Array.isArray(s.source_ids) || s.source_ids.length === 0) {
      discarded++;
      return false;
    }
    const allValid = s.source_ids.every((id) => validIds.has(id));
    if (!allValid) discarded++;
    return allValid;
  });
  return { kept, discarded };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is not configured with GEMINI_API_KEY" });
    return;
  }

  try {
    const body = req.body as {
      server_computed_status: "supported" | "partial" | "unavailable";
      validated_sources: LegalSource[];
      incident_summary: string;
    };

    if (!body || !Array.isArray(body.validated_sources) || !body.server_computed_status) {
      res.status(400).json({ error: "Missing server_computed_status or validated_sources" });
      return;
    }

    const validIds = new Set(body.validated_sources.map((s) => s.id));

    if (validIds.size === 0) {
      res.status(200).json({
        status: body.server_computed_status,
        summary: { text: "No verified legal sources currently match this situation in our curated dataset.", source_ids: [] },
        rights: [],
        procedural_steps: [],
        potential_relief: [],
        audit: { gemini_status_overridden: false, discarded_gemini_statements: 0 },
      });
      return;
    }

    const MAX_SUMMARY_CHARS = 2_000;
    const rawSummary = typeof body.incident_summary === "string" ? body.incident_summary : "";
    const sanitizedSummary = rawSummary
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .slice(0, MAX_SUMMARY_CHARS);

    const userPrompt = `Server-computed status: ${body.server_computed_status}\n\nVerified sources:\n${JSON.stringify(
      body.validated_sources,
      null,
      2
    )}\n\nCitizen's situation: """${sanitizedSummary}"""`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      res.status(502).json({ error: "Upstream Gemini API call failed", details: errText });
      return;
    }

    const geminiJson = await geminiRes.json();
    const rawText: string = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: GeminiExplanationResponse;
    try {
      parsed = JSON.parse(stripFences(rawText));
    } catch {
      res.status(502).json({ error: "Could not parse Gemini response as JSON", raw: rawText });
      return;
    }

    const geminiClaimedDifferentStatus = parsed.status !== body.server_computed_status;

    const summarySan = sanitizeStatements([parsed.summary].filter(Boolean) as CitedStatement[], validIds);
    const rightsSan = sanitizeStatements(parsed.rights, validIds);
    const stepsSan = sanitizeStatements(parsed.procedural_steps, validIds);
    const reliefSan = sanitizeStatements(parsed.potential_relief, validIds);

    const totalDiscarded =
      (summarySan.kept.length === 0 && parsed.summary ? 1 : 0) +
      rightsSan.discarded +
      stepsSan.discarded +
      reliefSan.discarded;

    res.status(200).json({
      status: body.server_computed_status,
      summary: summarySan.kept[0] || { text: "", source_ids: [] },
      rights: rightsSan.kept,
      procedural_steps: stepsSan.kept,
      potential_relief: reliefSan.kept,
      audit: {
        gemini_status_overridden: geminiClaimedDifferentStatus,
        discarded_gemini_statements: totalDiscarded,
      },
    });
  } catch (err) {
    console.error("explain.ts error:", err);
    res.status(500).json({ error: "Internal error generating explanation" });
  }
}
