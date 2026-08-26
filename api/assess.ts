// Phase 3 — Server Security Boundary.
import legalSources from "../src/data/legalSources.json";
import { matchLegalSources } from "../src/utils/sourceMatcher";
import { mapConfirmedFactsToEngine } from "../src/utils/factMapping";
import type { LegalSource, UserIncident } from "../src/types/legal";

// Safe UUID generator avoiding Node 'crypto' module type dependency
function generateUUID(): string {
  const gCrypto = (globalThis as any).crypto;
  if (gCrypto && typeof gCrypto.randomUUID === "function") {
    return gCrypto.randomUUID();
  }
  return "audit-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
}

// Runtime-validated domain values
const VALID_DOMAINS = new Set<string>(["consumer", "workplace", "tenant"]);

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body as {
      domain: UserIncident["domain"];
      dispute_type: string;
      jurisdiction_state: string;
      incident_date: UserIncident["incident_date"];
      confirmed_facts: string[];
      candidate_source_ids?: string[]; // UX hint only, NOT authoritative
    };

    // Runtime validation
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Request body must be a JSON object" });
      return;
    }
    if (!body.domain || !VALID_DOMAINS.has(body.domain)) {
      res.status(400).json({
        error: "Missing or invalid field: domain (must be 'consumer' | 'workplace' | 'tenant')",
      });
      return;
    }
    if (
      !body.incident_date ||
      typeof body.incident_date !== "object" ||
      !("precision" in body.incident_date) ||
      !("value" in body.incident_date) ||
      typeof (body.incident_date as any).value !== "string"
    ) {
      res.status(400).json({
        error:
          "Missing or invalid field: incident_date must be { precision: 'day'|'month', value: 'YYYY-MM-DD'|'YYYY-MM' }",
      });
      return;
    }
    if (!Array.isArray(body.confirmed_facts)) {
      res.status(400).json({ error: "Field confirmed_facts must be an array" });
      return;
    }

    // Map UI checkbox IDs to canonical engine fact keys
    const mappedFacts = mapConfirmedFactsToEngine(body.confirmed_facts);

    const incident: UserIncident = {
      domain: body.domain,
      dispute_type: body.dispute_type ?? "",
      jurisdiction_state: body.jurisdiction_state ?? "",
      incident_date: body.incident_date,
      confirmed_facts: mappedFacts,
    };

    // Server independently loads and evaluates ALL sources
    const allSources = legalSources as unknown as LegalSource[];
    const result = matchLegalSources(incident, allSources);

    const validatedSourceIds = result.matched_sources.map((s) => s.id);

    const auditLog = {
      audit_id: generateUUID(),
      timestamp: new Date().toISOString(),
      domain: incident.domain,
      client_candidate_hints: body.candidate_source_ids || [],
      validated_source_ids: validatedSourceIds,
      server_computed_status: result.status,
      gemini_consulted: false, // deterministic-only endpoint
    };

    res.status(200).json({
      status: result.status,
      matched_sources: result.matched_sources,
      partial_sources: result.partial_sources,
      unsupported_reasons: result.unsupported_reasons,
      audit: auditLog,
    });
  } catch (err) {
    console.error("assess.ts error:", err);
    res.status(500).json({ error: "Internal error evaluating assessment" });
  }
}
