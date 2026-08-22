// Phase 2 — Deterministic legal source matcher.
//
// Runs identically on the server (api/assess.ts, authoritative) and can be
// unit-tested directly. Contains ZERO calls to any LLM — this is pure,
// auditable logic so a wrong department/status is a traceable bug, not an
// unexplainable AI guess.
//
// INTEGRATION NOTE: the current UI (Step1Story) collects a broad `domain`
// (Consumer/Workplace/Tenant) but not a fine-grained `dispute_type` — that
// selector doesn't exist yet in Phase 1. Rather than block matching on a
// field the UI can't currently supply, this matcher treats `domain` as the
// primary filter and evaluates ALL of that domain's sources against
// temporal + fact criteria, independent of dispute_type. `dispute_type` is
// still stored per source for display/citation purposes. If Step1Story is
// later extended with a dispute-type selector, tighten getCandidatePool()
// to also filter on incident.dispute_type.

import type {
  LegalSource,
  UserIncident,
  TemporalEvaluation,
  MatchResult,
  AssessmentStatus,
} from "../types/legal";

function toDateRange(precision: "day" | "month", value: string): [string, string] {
  if (precision === "day") {
    return [value, value];
  }
  // month precision: "2025-11" -> ["2025-11-01", "2025-11-30"]
  const [year, month] = value.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate(); // day 0 of next month = last day of this month
  const mm = String(month).padStart(2, "0");
  const dd = String(lastDay).padStart(2, "0");
  return [`${value}-01`, `${value}-${dd}`];
}

export function evaluateTemporalApplicability(
  incidentDate: UserIncident["incident_date"],
  source: LegalSource
): TemporalEvaluation {
  // Fix #9 — Block both repealed AND superseded sources.
  // A superseded source without effective_to would otherwise be treated as in-force.
  if (source.effective_status === "repealed" || source.effective_status === "superseded") {
    return { status: "invalid", reason: `Source is ${source.effective_status}` };
  }

  const [userStart, userEnd] = toDateRange(incidentDate.precision, incidentDate.value);

  if (userEnd < source.effective_from) {
    return { status: "invalid", reason: "Incident predates law effective date" };
  }

  if (source.effective_to && userStart > source.effective_to) {
    return { status: "invalid", reason: "Incident postdates law expiration" };
  }

  if (
    incidentDate.precision === "month" &&
    source.effective_from >= userStart &&
    source.effective_from <= userEnd
  ) {
    return {
      status: "ambiguous",
      reason: "Effective date falls within incident month interval — exact day unknown",
    };
  }

  return { status: "valid", reason: "Law in force during incident interval" };
}

function getCandidatePool(incident: UserIncident, allSources: LegalSource[]): LegalSource[] {
  return allSources.filter(
    (s) => s.verified === true && s.official === true && s.domain === incident.domain
  );
}

function hasAllRequiredFacts(source: LegalSource, confirmedFacts: string[]): boolean {
  return source.required_facts.every((f) => confirmedFacts.includes(f));
}

function jurisdictionMatches(source: LegalSource, incident: UserIncident): boolean {
  if (source.jurisdiction.level === "central") return true;
  if (source.jurisdiction.level === "state") {
    return source.jurisdiction.states.includes(incident.jurisdiction_state);
  }
  // district-level not used in current dataset; default to false if unmatched
  return false;
}

export function matchLegalSources(incident: UserIncident, allSources: LegalSource[]): MatchResult {
  const pool = getCandidatePool(incident, allSources);

  if (pool.length === 0) {
    return {
      status: "unavailable",
      matched_sources: [],
      partial_sources: [],
      unsupported_reasons: [
        `No verified, official sources exist for domain "${incident.domain}" in this prototype's curated dataset.`,
      ],
    };
  }

  const fullyValid: LegalSource[] = [];
  const partial: LegalSource[] = [];
  const reasons: string[] = [];

  for (const source of pool) {
    if (!jurisdictionMatches(source, incident)) {
      reasons.push(`${source.id}: jurisdiction "${incident.jurisdiction_state}" not covered`);
      continue;
    }

    const temporal = evaluateTemporalApplicability(incident.incident_date, source);

    if (temporal.status === "invalid") {
      reasons.push(`${source.id}: ${temporal.reason}`);
      continue;
    }

    const factsComplete = hasAllRequiredFacts(source, incident.confirmed_facts);

    if (temporal.status === "valid" && factsComplete) {
      fullyValid.push(source);
    } else {
      partial.push(source);
      if (temporal.status === "ambiguous") reasons.push(`${source.id}: ${temporal.reason}`);
      if (!factsComplete) reasons.push(`${source.id}: missing required facts`);
    }
  }

  let status: AssessmentStatus;
  if (fullyValid.length > 0) status = "supported";
  else if (partial.length > 0) status = "partial";
  else status = "unavailable";

  return {
    status,
    matched_sources: fullyValid,
    partial_sources: partial,
    unsupported_reasons: reasons,
  };
}
