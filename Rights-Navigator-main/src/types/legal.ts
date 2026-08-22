// Phase 2 — Legal engine schema.
//
// Kept deliberately separate from ../types.ts (the UI's FormState/Domain
// types) rather than merging them. The UI uses capitalized display values
// ("Consumer" | "Workplace" | "Tenant") for rendering; this engine uses
// lowercase canonical values for matching logic. src/utils/factMapping.ts
// bridges the two. This separation means Phase 1's working UI components
// are never touched by this change.

export type EngineDomain = "workplace" | "consumer" | "tenant";

export type AssessmentStatus = "supported" | "partial" | "unavailable";

export type TemporalStatus = "valid" | "ambiguous" | "invalid";

export interface Jurisdiction {
  level: "central" | "state" | "district";
  states: string[];
  districts: string[];
}

export interface LegalSource {
  id: string;
  domain: EngineDomain;
  dispute_type: string;
  jurisdiction: Jurisdiction;
  act: string;
  section: string;
  legal_role: "substantive_right" | "procedural_mechanism";
  applicability: {
    supports: string[];
    does_not_support: string[];
  };
  required_facts: string[];
  effective_from: string; // YYYY-MM-DD
  effective_to: string | null; // YYYY-MM-DD or null
  effective_status: "in_force" | "superseded" | "repealed";
  source_hierarchy_rank: number;
  last_verified: string;
  official: boolean;
  verified: boolean;
  source_url: string;
}

export interface UserIncident {
  domain: EngineDomain;
  dispute_type: string;
  jurisdiction_state: string;
  incident_date: {
    precision: "day" | "month";
    value: string; // YYYY-MM-DD or YYYY-MM
  };
  confirmed_facts: string[]; // canonical fact keys, NOT raw checkbox ids
}

export interface TemporalEvaluation {
  status: TemporalStatus;
  reason: string;
}

export interface MatchResult {
  status: AssessmentStatus;
  matched_sources: LegalSource[];
  partial_sources: LegalSource[];
  unsupported_reasons: string[];
}
