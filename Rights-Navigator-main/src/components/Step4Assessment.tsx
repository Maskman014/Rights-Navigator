import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
  ExternalLink,
  BookOpen,
  Check,
  BookmarkPlus,
  Sparkles,
} from "lucide-react";
import type { FormState } from "../types";
import { formatIncidentDate } from "../types";
import { mapDomainToEngine } from "../utils/factMapping";
import { Card, SectionTitle, Button, Badge } from "./ui";

interface Step4Props {
  form: FormState;
  onBack: () => void;
  onNext: () => void;
}

interface AssessmentResponse {
  status: "supported" | "partial" | "unavailable";
  statutes?: Array<{
    title: string;
    statute: string;
    summary: string;
  }>;
  sources?: Array<{
    id: string;
    kind: string;
    label: string;
    url: string;
    retrievedOn: string;
  }>;
  documentChecklist?: Array<{
    id: string;
    label: string;
  }>;
  explanation?: string;
  message?: string;
}

interface ExplanationResponse {
  summary?: string;
  rights?: string[];
  procedural_steps?: string[];
  potential_relief?: string[];
}

export default function Step4Assessment({
  form,
  onBack,
  onNext,
}: Step4Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [explanationData, setExplanationData] =
    useState<ExplanationResponse | null>(null);

  const [openSource, setOpenSource] = useState<string | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSaveToVault = async () => {
    if (!data) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formState: form,
          assessmentData: data,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSavedId(json.case?.id || "Saved");
        setTimeout(() => {
          setSavedId(null);
        }, 3500);
      } else {
        console.error("Failed to save case:", res.status, await res.text());
      }
    } catch (e) {
      console.error("Error saving case to vault:", e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchAssessment() {
      setLoading(true);
      setError(null);
      setData(null);
      setExplanationData(null);

      const engineDomain = mapDomainToEngine(form.domain);

      if (!engineDomain) {
        if (isMounted) {
          setError("No domain selected. Please go back and select a domain.");
          setLoading(false);
        }
        return;
      }

      const dateValue = formatIncidentDate(form);

      if (!dateValue) {
        if (isMounted) {
          setError("Incident date is incomplete. Please go back and fill in the date fields.");
          setLoading(false);
        }
        return;
      }

      const incidentDate = {
        precision: form.datePrecision,
        value: dateValue,
      };

      try {
        const response = await fetch("/api/assess", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: engineDomain,
            dispute_type:
              engineDomain === "consumer"
                ? "consumer_defective_product"
                : "general_dispute",
            jurisdiction_state: form.state,
            incident_date: incidentDate,
            confirmed_facts: form.confirmedFacts,
          }),
        });

        if (!response.ok) {
          throw new Error(`Assessment API returned HTTP ${response.status}`);
        }

        const rawResult = await response.json();

        const matchedSources = Array.isArray(rawResult.matched_sources)
          ? rawResult.matched_sources
          : [];

        const partialSources = Array.isArray(rawResult.partial_sources)
          ? rawResult.partial_sources
          : [];

        const allSources = [...matchedSources, ...partialSources];

        const statutes = allSources.map((s: any) => {
          const rawAct = String(s.act || "").trim();

          const cleanTitle =
            rawAct
              .split(/[\u2014\u2013-]|Section|Rule/i)[0]
              .trim()
              .replace(/\s+/g, " ") ||
            "Statutory Provision";

          const roleLabel =
            s.legal_role === "substantive_right"
              ? "Substantive Right"
              : "Procedural Redressal";

          const cleanSection = s.section
            ? `${s.section} (${roleLabel})`
            : roleLabel;

          const summary =
            s.applicability?.supports?.[0] ||
            "Statutory protection and redressal mechanism.";

          return {
            title: cleanTitle,
            statute: cleanSection,
            summary,
          };
        });

        const sources = allSources.map((s: any) => {
          const rawAct = String(s.act || "").trim();

          const cleanAct =
            rawAct
              .split(/[\u2014\u2013-]|Section|Rule/i)[0]
              .trim()
              .replace(/\s+/g, " ") ||
            "Legal Source";

          const label = s.section ? `${cleanAct} — ${s.section}` : cleanAct;

          return {
            id: s.id || `${cleanAct}-${s.section || "source"}`,
            kind: s.legal_role === "substantive_right" ? "Bare Act" : "Statutory Rule",
            label,
            url: s.source_url || "#",
            retrievedOn: s.last_verified || "Verification date unavailable",
          };
        });

        let documentChecklist = [
          { id: "id_proof", label: "Government ID / Identity Verification" },
          { id: "written_notice", label: "Copy of written notice / representation sent to opposite party" },
        ];

        if (engineDomain === "consumer") {
          documentChecklist = [
            { id: "invoice_bill", label: "Tax invoice / cash memo / order receipt (Proof of purchase)" },
            { id: "defect_photo", label: "Photographic or technical documentation of defect / service shortfall" },
            { id: "merchant_comm", label: "Email / chat / ticket correspondence with merchant or customer care" },
            { id: "warranty_doc", label: "Warranty card or terms of service agreement" },
          ];
        } else if (engineDomain === "workplace") {
          documentChecklist = [
            { id: "offer_contract", label: "Employment contract / appointment letter / offer agreement" },
            { id: "salary_slips", label: "Salary slips or bank statement showing wage credits" },
            { id: "termination_letter", label: "Notice of termination / retrenchment / official email trail" },
            { id: "service_proof", label: "Proof of service duration / employee ID card" },
          ];
        } else if (engineDomain === "tenant") {
          documentChecklist = [
            { id: "rent_agreement", label: "Written / Registered Tenancy / Lease Agreement" },
            { id: "rent_receipts", label: "Rent payment receipts or bank/UPI transaction history" },
            { id: "eviction_notice", label: "Formal written eviction / demand notice from landlord" },
            { id: "deposit_proof", label: "Security deposit transfer proof or receipt" },
          ];
        }

        let explanation = "";
        if (rawResult.status === "supported") {
          explanation = `Direct statutory grounding verified. Your incident details satisfy all required evidentiary facts under ${matchedSources.length} verified legislation(s) applicable in ${
            form.state || "Central Jurisdiction"
          }.`;
        } else if (rawResult.status === "partial") {
          explanation = `Partially grounded. Some statutory provisions may apply, but additional fact verification or state-specific criteria are required. ${
            rawResult.unsupported_reasons?.[0] || ""
          }`;
        } else {
          explanation = `No direct statutory match found in the verified dataset. ${
            rawResult.unsupported_reasons?.[0] ||
            "Please consult a qualified legal practitioner."
          }`;
        }

        const result: AssessmentResponse = {
          status: rawResult.status || "unavailable",
          statutes,
          sources,
          documentChecklist,
          explanation,
          message: rawResult.message,
        };

        if (isMounted) {
          setData(result);
        }

        try {
          const explainRes = await fetch("/api/explain", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              server_computed_status: rawResult.status,
              validated_sources: allSources,
              incident_summary: form.narrative,
            }),
          });

          if (explainRes.ok) {
            const expData = await explainRes.json();
            if (isMounted) {
              setExplanationData(expData);
            }
          }
        } catch (explainErr) {
          console.warn("Gemini explanation fallback triggered:", explainErr);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to reach assessment server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAssessment();

    return () => {
      isMounted = false;
    };
  }, [
    form.domain,
    form.state,
    form.datePrecision,
    form.incidentYear,
    form.incidentMonth,
    form.incidentDay,
    form.confirmedFacts,
    form.narrative,
  ]);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "supported":
        return (
          <Badge variant="emerald" dot className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            STATUTORILY SUPPORTED
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="amber" dot className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            PARTIALLY SUPPORTED
          </Badge>
        );
      case "unavailable":
        return (
          <Badge variant="red" dot className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            UNAVAILABLE / NO DIRECT MATCH
          </Badge>
        );
      default:
        return <Badge variant="slate">EVALUATING</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="mx-auto max-w-3xl w-full p-12 text-center bg-slate-900 border-slate-800 text-slate-100">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-950 text-indigo-400 shadow-inner">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-slate-100">
            Running Deterministic Legal Matcher...
          </h3>
          <p className="mt-2 mx-auto max-w-md text-xs leading-relaxed text-slate-400 sm:text-sm">
            Evaluating statutory conditions, temporal jurisdiction bounds, and source hierarchy for{" "}
            <span className="font-semibold text-slate-200">
              {form.state || "selected jurisdiction"}
            </span>.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
        <Card className="mx-auto max-w-3xl w-full bg-slate-900 border-slate-800 text-slate-100">
          <div className="flex items-start gap-4 rounded-2xl border border-red-900 bg-red-950/60 p-5 shadow-sm">
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
            <div>
              <h3 className="text-base font-bold text-red-200">Assessment Service Notice</h3>
              <p className="mt-1 text-sm text-red-300">{error}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={onBack} className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Summary</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statutesList = data?.statutes || [];
  const sourcesList = data?.sources || [];
  const checklist = data?.documentChecklist || [];
  const checkedCount = checkedDocs.size;
  const isSupported = data?.status === "supported";
  const isPartial = data?.status === "partial";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <SectionTitle
            step={4}
            title="Statutory Assessment Results"
            subtitle="Deterministic evaluation computed against canonical legal source records."
            badgeText="Step 4 of 5"
          />

          {/* LIVE STATUS HERO */}
          <div
            className={`mb-8 rounded-2xl border p-5 shadow-sm transition-all ${
              isSupported
                ? "border-emerald-800 bg-gradient-to-r from-emerald-950/90 via-emerald-950/40 to-slate-900 ring-2 ring-emerald-500/20 text-emerald-100"
                : isPartial
                ? "border-amber-800 bg-gradient-to-r from-amber-950/90 via-amber-950/40 to-slate-900 ring-2 ring-amber-500/20 text-amber-100"
                : "border-red-800 bg-gradient-to-r from-red-950/90 via-red-950/40 to-slate-900 ring-2 ring-red-500/20 text-red-100"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  isSupported
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : isPartial
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-red-600 text-white shadow-md shadow-red-600/30"
                }`}
              >
                {isSupported ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Evaluation Verdict:
                  </span>
                  {renderStatusBadge(data?.status)}
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-200">
                  {explanationData?.summary ||
                    data?.explanation ||
                    data?.message ||
                    "The deterministic matcher has evaluated the provided facts against active statutory provisions."}
                </p>
              </div>
            </div>
          </div>

          {/* AI CASE ANALYSIS */}
          {explanationData && (
            <div className="mb-8 space-y-4 rounded-2xl border border-indigo-900 bg-indigo-950/30 p-5 text-indigo-100">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>AI Case Analysis</span>
              </div>
              {explanationData.rights && explanationData.rights.length > 0 && (
                <div>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Your Applicable Rights
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300 sm:text-sm">
                    {explanationData.rights.map((right, idx) => (
                      <li key={idx}>{right}</li>
                    ))}
                  </ul>
                </div>
              )}
              {explanationData.procedural_steps && explanationData.procedural_steps.length > 0 && (
                <div>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Recommended Procedural Steps
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300 sm:text-sm">
                    {explanationData.procedural_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {explanationData.potential_relief && explanationData.potential_relief.length > 0 && (
                <div>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Potential Relief Available
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300 sm:text-sm">
                    {explanationData.potential_relief.map((relief, idx) => (
                      <li key={idx}>{relief}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STATUTORY PROVISIONS */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
                  Statutory Provisions &amp; Rights
                </h3>
                <Badge variant="indigo" dot>
                  {statutesList.length} Provisions
                </Badge>
              </div>
              <span className="text-xs text-slate-400">
                Jurisdiction: {form.state || "Central"}
              </span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {statutesList.length > 0 ? (
                statutesList.map((stat, idx) => (
                  <div
                    key={`${stat.title}-${idx}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4.5 shadow-sm transition-all duration-200 hover:border-indigo-700 hover:shadow-md"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-md border border-indigo-900 bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                          {stat.statute}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold leading-snug text-slate-100">
                        {stat.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {stat.summary}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-xs text-slate-400">
                  <BookOpen className="mx-auto mb-2 h-6 w-6 text-slate-500" />
                  No direct statutory provisions were matched for the provided facts.
                </div>
              )}
            </div>
          </div>

          {/* VERIFIED SOURCES */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
                  Verified Legal Sources
                </h3>
                <Badge variant="emerald" dot>
                  {sourcesList.length} Verified Sources
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              {sourcesList.length > 0 ? (
                sourcesList.map((source) => {
                  const isOpen = openSource === source.id;
                  return (
                    <div
                      key={source.id}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-colors hover:border-slate-700"
                    >
                      <button
                        onClick={() => setOpenSource(isOpen ? null : source.id)}
                        className="flex w-full items-center justify-between px-4.5 py-3 text-left transition-colors hover:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="slate">{source.kind}</Badge>
                          <span className="text-sm font-bold text-slate-200">
                            {source.label}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-indigo-400" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="overflow-hidden border-t border-slate-800 bg-slate-950/60">
                          <div className="flex flex-col justify-between gap-2 px-4.5 py-3 text-xs sm:flex-row sm:items-center">
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-400">
                                Official Reference URL:{" "}
                              </span>
                              {source.url && source.url !== "#" ? (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex max-w-full items-center gap-1 break-all font-bold text-indigo-400 hover:underline"
                                >
                                  {source.url}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-500">Not available</span>
                              )}
                            </div>
                            <div className="shrink-0 text-slate-500">
                              Verified on:{" "}
                              <span className="font-medium text-slate-400">
                                {source.retrievedOn}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center text-xs text-slate-400">
                  No explicit source records bound to this assessment response.
                </div>
              )}
            </div>
          </div>

          {/* DOCUMENT CHECKLIST */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
                  Document Checklist
                </h3>
                <Badge variant="cyan" dot>
                  {checkedCount} of {checklist.length} Prepared
                </Badge>
              </div>
            </div>
            <div className="space-y-2.5">
              {checklist.map((doc) => {
                const checked = checkedDocs.has(doc.id);
                return (
                  <label
                    key={doc.id}
                    className={`group flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 ${
                      checked
                        ? "border-emerald-800 bg-emerald-950/40 shadow-sm"
                        : "border-slate-800 bg-slate-900 hover:border-indigo-800 hover:bg-slate-800/40"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        checked
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "border-slate-700 bg-slate-800 group-hover:border-slate-600"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDoc(doc.id)}
                      className="sr-only"
                    />
                    <FileCheck
                      className={`h-4 w-4 ${checked ? "text-emerald-400" : "text-slate-500"}`}
                    />
                    <span
                      className={`flex-1 text-xs font-medium sm:text-sm ${
                        checked ? "font-bold text-emerald-200" : "text-slate-300"
                      }`}
                    >
                      {doc.label}
                    </span>
                    <Badge variant={checked ? "emerald" : "slate"}>
                      {checked ? "Ready" : "Required"}
                    </Badge>
                  </label>
                );
              })}
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row">
            <Button variant="ghost" onClick={onBack} className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Summary</span>
            </Button>
            <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={handleSaveToVault}
                disabled={isSaving || !data}
                className={
                  savedId
                    ? "border-emerald-700 bg-emerald-950 font-bold text-emerald-300"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : savedId ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Saved as {savedId}!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4 text-indigo-400" />
                    <span>Save Case to Vault</span>
                  </>
                )}
              </Button>
              <Button onClick={onNext} variant="primary" size="lg">
                <span>Proceed to Action Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* INFORMATION NOTICE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4.5 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-slate-200">
                Deterministic Assessment Notice:
              </span>{" "}
              Citations and status are matched against verified Bare Acts and rules. This system provides informational research and does not substitute for licensed legal representation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
