export type Domain = "Consumer" | "Workplace" | "Tenant";

export type DatePrecision = "month" | "day";

export type AssessmentStatus = "Supported" | "Partial" | "Unavailable";

export interface CheckboxFact {
  id: string;
  label: string;
  hint?: string;
}

export interface FormState {
  domain: Domain | null;
  state: string;
  district: string;
  datePrecision: DatePrecision;
  incidentYear: string;
  incidentMonth: string;
  incidentDay: string;
  narrative: string;
  confirmedFacts: string[];
  proofs?: { name: string; data: string }[];
  confirmed: boolean;
  // Personalization & Notice fields
  applicantName?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  applicantAddress?: string;
  oppositePartyName?: string;
  oppositePartyAddress?: string;
  demandRelief?: string;
}

export function formatIncidentDate(form: FormState): string {
  if (!form.incidentYear || !form.incidentMonth) return "";
  const monthNum = String(
    [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ].indexOf(form.incidentMonth) + 1
  ).padStart(2, "0");
  if (form.datePrecision === "day" && form.incidentDay) {
    // Fix #19 — defensive padding: incidentDay is already padded at input, but guard against regressions
    return `${form.incidentYear}-${monthNum}-${String(form.incidentDay).padStart(2, "0")}`;
  }
  return `${form.incidentYear}-${monthNum}`;
}

export interface StatutoryCard {
  title: string;
  statute: string;
  summary: string;
  relevance: "High" | "Medium" | "Low";
}

export interface SourceProvenance {
  id: string;
  label: string;
  url: string;
  kind: "Statute" | "Portal" | "Guideline" | "Case law";
  retrievedOn: string;
}

export interface PortalLink {
  label: string;
  url: string;
  description: string;
}

export interface AssessmentResult {
  status: AssessmentStatus;
  summary: string;
  statutes: StatutoryCard[];
  sources: SourceProvenance[];
  documentChecklist: { id: string; label: string; required: boolean }[];
  portals: PortalLink[];
}
