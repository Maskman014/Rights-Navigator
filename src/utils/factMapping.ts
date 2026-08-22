// Bridges the EXISTING Step1Story/Step2Facts UI (which uses capitalized
// Domain values and checkbox ids like "c1", "w2", "t4" from mockData.ts)
// to the engine's canonical lowercase Domain and required_facts keys
// (defined per-record in src/data/legalSources.json).
//
// This file is new and additive — it does not modify types.ts, mockData.ts,
// or any Step*.tsx component.
//
// HONEST LIMITATION: mockData.ts's checkbox labels were written for general
// UI display, not to exactly match each legal source's required_facts. The
// mapping below is a best-effort proxy (e.g. "Salary slips available for
// last 3 months" is treated as evidence wages are overdue, which isn't a
// perfect logical fit). If you have time before the deadline, the cleanest
// fix is adding 1-2 more precise checkboxes to DOMAIN_FACTS in mockData.ts
// (e.g. "Wages have been unpaid or delayed" for Workplace, "Defect/service
// issue is documented" already exists as c5). Until then, this mapping
// keeps the pipeline functional end-to-end without touching working UI.

import type { Domain as UIDomain } from "../types";
import type { EngineDomain } from "../types/legal";

export function mapDomainToEngine(domain: UIDomain | null): EngineDomain | null {
  if (domain === "Consumer") return "consumer";
  if (domain === "Workplace") return "workplace";
  if (domain === "Tenant") return "tenant";
  return null;
}

// checkbox id (from mockData.DOMAIN_FACTS) -> canonical required_facts key
export const CHECKBOX_TO_FACT_KEY: Record<string, string> = {
  // Consumer
  c1: "proof_of_purchase",
  c2: "warranty_active",
  c3: "written_complaint_sent",
  c4: "value_measurable",
  c5: "issue_documented",
  c6: "ecommerce_platform_involved",

  // Workplace
  w1: "employment_relationship_confirmed",
  w2: "salary_records_available",
  w3: "termination_notice_received",
  w4: "five_year_service_completed",
  w5: "internal_complaints_committee_exists",
  w6: "maternity_benefit_eligible",
  w7: "wages_overdue",

  // Tenant
  t1: "rent_agreement_exists",
  t2: "rent_receipts_available",
  t3: "written_eviction_notice",
  t4: "security_deposit_receipt_available",
  t5: "utilities_in_tenant_name",
  t6: "rent_compliance_maintained",
};

export function mapConfirmedFactsToEngine(checkboxIds: string[]): string[] {
  return checkboxIds
    .map((id) => CHECKBOX_TO_FACT_KEY[id])
    .filter((key): key is string => Boolean(key));
}
