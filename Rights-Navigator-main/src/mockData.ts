import type {
  CheckboxFact,
  Domain,
  AssessmentResult,
  PortalLink,
} from "./types";
import { DISTRICTS_BY_STATE } from "./districtData";

export { DISTRICTS_BY_STATE };

export const DOMAINS: Domain[] = ["Consumer", "Workplace", "Tenant"];

export const STATES: string[] = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const MONTHS: string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DOMAIN_FACTS: Record<Domain, CheckboxFact[]> = {
  Consumer: [
    { id: "c1", label: "Proof of purchase available", hint: "Receipt, tax invoice, payment receipt, or digital order ID" },
    { id: "c2", label: "Product/service was within warranty or committed service period" },
    { id: "c3", label: "Written complaint or email notice already dispatched to merchant/provider" },
    { id: "c4", label: "Transaction value and consideration is quantifiable" },
    { id: "c5", label: "Defect, shortfall, or damage is documented", hint: "Photographs, test certificate, correspondence, or service job-sheet" },
    { id: "c6", label: "Transaction conducted via online e-commerce platform / marketplace" },
  ],
  Workplace: [
    { id: "w1", label: "Employment relationship confirmed", hint: "Written contract, appointment letter, or formal email offer" },
    { id: "w2", label: "Salary slips, bank credit records, or attendance logs available" },
    { id: "w3", label: "Written termination, retrenchment, or transfer notice received" },
    { id: "w4", label: "Completed continuous service tenure of 5 or more years (for gratuity)" },
    { id: "w5", label: "Internal Complaints Committee (ICC) / workplace harassment grievance exists" },
    { id: "w6", label: "Maternity benefit service threshold met (80+ days worked in preceding 12 months)" },
    { id: "w7", label: "Wages, overtime, or severance dues remain unpaid or overdue" },
  ],
  Tenant: [
    { id: "t1", label: "Written or registered tenancy agreement exists" },
    { id: "t2", label: "Rent payment receipts, UPI transactions, or bank statements available" },
    { id: "t3", label: "Formal written eviction notice received from landlord" },
    { id: "t4", label: "Security deposit payment proof or deposit receipt available" },
    { id: "t5", label: "Utility bills (electricity/water) or maintenance payment proofs available" },
    { id: "t6", label: "Tenant has maintained regular rent compliance or willingness to pay standard rent" },
  ],
};

export const MOCK_ASSESSMENT: AssessmentResult = {
  status: "Supported",
  summary:
    "Based on the confirmed facts, the situation appears to fall within the scope of the indicated statute. This is a preliminary informational mapping — not a legal conclusion.",
  statutes: [
    {
      title: "Deficiency in Service",
      statute: "Consumer Protection Act, 2019 — §2(11)",
      summary:
        "Defines deficiency as any fault, imperfection, shortcoming or inadequacy in the quality, nature or manner of performance.",
      relevance: "High",
    },
    {
      title: "Rights of Consumer",
      statute: "Consumer Protection Act, 2019 — §2(7)",
      summary:
        "Enumerates the right to be protected against marketing of hazardous goods and the right to seek redressal.",
      relevance: "Medium",
    },
    {
      title: "Unfair Trade Practice",
      statute: "Consumer Protection Act, 2019 — §2(47)",
      summary:
        "Covers misleading advertisement and false claims about the characteristics of goods or services.",
      relevance: "Low",
    },
  ],
  sources: [
    {
      id: "s1",
      label: "Consumer Protection Act, 2019 (Bare Act)",
      url: "https://egazette.gov.in/",
      kind: "Statute",
      retrievedOn: "2026-08-19",
    },
    {
      id: "s2",
      label: "e-Daakhil — Online Consumer Filing Portal",
      url: "https://edaakhil.nic.in/",
      kind: "Portal",
      retrievedOn: "2026-08-19",
    },
    {
      id: "s3",
      label: "National Consumer Helpline Guidelines",
      url: "https://consumerhelpline.gov.in/",
      kind: "Guideline",
      retrievedOn: "2026-08-19",
    },
  ],
  documentChecklist: [
    { id: "d1", label: "Proof of purchase (receipt/invoice)", required: true },
    { id: "d2", label: "Copy of written complaint to seller", required: true },
    { id: "d3", label: "Photographs of defect/product", required: false },
    { id: "d4", label: "Bank statement showing transaction", required: false },
    { id: "d5", label: "Any warranty or guarantee card", required: false },
  ],
  portals: [
    {
      label: "e-Daakhil",
      url: "https://edaakhil.nic.in/",
      description: "File a consumer complaint online with the Consumer Disputes Redressal Commission.",
    },
    {
      label: "National Consumer Helpline",
      url: "https://consumerhelpline.gov.in/",
      description: "Toll-free guidance and complaint registration for consumer grievances.",
    },
    {
      label: "SAMADHAN",
      url: "https://samadhaan.gov.in/",
      description: "Grievance redressal monitoring portal for delayed service matters.",
    },
  ],
};

export const PORTAL_LINKS: PortalLink[] = MOCK_ASSESSMENT.portals;
