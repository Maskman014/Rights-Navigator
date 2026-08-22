import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Step4Assessment({ form, onBack, onNext }: Step4Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [explanationData, setExplanationData] = useState<ExplanationResponse | null>(null);

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
        setTimeout(() => setSavedId(null), 3500);
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

        const matchedSources = rawResult.matched_sources || [];
        const partialSources = rawResult.partial_sources || [];
        const allSources = [...matchedSources, ...partialSources];

        const statutes = allSources.map((s: any) => ({
          title: s.act,
          statute: `${s.section} (${s.legal_role === "substantive_right" ? "Substantive Right" : "Procedural Redressal"})`,
          summary: s.applicability?.supports?.[0] || "Statutory protection and redressal mechanism.",
        }));

        const sources = allSources.map((s: any) => ({
          id: s.id,
          kind: s.legal_role === "substantive_right" ? "Bare Act" : "Statutory Rule",
          label: `${s.act} — ${s.section}`,
          url: s.source_url,
          retrievedOn: s.last_verified,
        }));

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
          explanation = `Direct statutory grounding verified. Your incident details satisfy all required evidentiary facts under ${matchedSources.length} verified legislation(s) applicable in ${form.state || "Central Jurisdiction"}.`;
        } else if (rawResult.status === "partial") {
          explanation = `Partially grounded. Some statutory provisions may apply, but additional fact verification or state-specific criteria are required. ${rawResult.unsupported_reasons?.[0] || ""}`;
        } else {
          explanation = `No direct statutory match found in the verified dataset. ${rawResult.unsupported_reasons?.[0] || "Please consult a qualified legal practitioner."}`;
        }

        const result: AssessmentResponse = {
          status: rawResult.status,
          statutes,
          sources,
          documentChecklist,
          explanation,
        };

        if (isMounted) {
          setData(result);
        }

        // Secondary fetch to /api/explain
        try {
          const explainRes = await fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      <Card className="mx-auto max-w-3xl p-12 text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">
          Running Deterministic Legal Matcher...
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Evaluating statutory conditions, temporal jurisdiction bounds, and source hierarchy for{" "}
          <span className="font-semibold text-slate-700">{form.state || "selected jurisdiction"}</span>.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-3xl">
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
          <XCircle className="h-6 w-6 shrink-0 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-red-900">Assessment Service Notice</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Summary</span>
          </Button>
        </div>
      </Card>
    );
  }

  const statutesList = data?.statutes || [];
  const sourcesList = data?.sources || [];
  const checklist = data?.documentChecklist || [];
  const checkedCount = checkedDocs.size;
  const isSupported = data?.status === "supported";
  const isPartial = data?.status === "partial";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SectionTitle
          step={4}
          title="Statutory Assessment Results"
          subtitle="Deterministic evaluation computed against canonical legal source records."
          badgeText="Step 4 of 5"
        />

        {/* Live Status Hero Banner */}
        <div
          className={`mb-8 rounded-2xl border p-5 shadow-sm transition-all ${
            isSupported
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white ring-2 ring-emerald-500/20"
              : isPartial
              ? "border-amber-200 bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white ring-2 ring-amber-500/20"
              : "border-red-200 bg-gradient-to-r from-red-50/90 via-red-50/40 to-white ring-2 ring-red-500/20"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isSupported
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : isPartial
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-red-600 text-white shadow-md shadow-red-600/30"
              }`}
            >
              {isSupported ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Evaluation Verdict:
                </span>
                {renderStatusBadge(data?.status)}
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-800 font-medium">
                {explanationData?.summary ||
                  data?.explanation ||
                  data?.message ||
                  "The deterministic matcher has evaluated the provided facts against active statutory provisions."}
              </p>
            </div>
          </div>
        </div>

        {/* Structured Gemini Explanation */}
        {explanationData && (
          <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>AI Case Analysis</span>
            </div>

            {explanationData.rights && explanationData.rights.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1.5">
                  Your Applicable Rights
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                  {explanationData.rights.map((right, idx) => (
                    <li key={idx}>{right}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanationData.procedural_steps && explanationData.procedural_steps.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1.5">
                  Recommended Procedural Steps
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                  {explanationData.procedural_steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanationData.potential_relief && explanationData.potential_relief.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1.5">
                  Potential Relief Available
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                  {explanationData.potential_relief.map((relief, idx) => (
                    <li key={idx}>{relief}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Statutory Breakdown Cards */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Statutory Provisions &amp; Rights
              </h3>
              <Badge variant="indigo" dot>
                {statutesList.length} Provisions
              </Badge>
            </div>
            <span className="text-xs text-slate-400">Jurisdiction: {form.state || "Central"}</span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-3">
            {statutesList.length > 0 ? (
              statutesList.map((stat, idx) => (
                <motion.div
                  key={stat.title + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                        {stat.statute.split("—")[0] || "Act"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {stat.title}
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-indigo-600">
                      {stat.statute}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {stat.summary}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                No direct statutory provisions were matched for the provided facts.
              </div>
            )}
          </div>
        </div>

        {/* Source Provenance Accordion */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
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
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
                  >
                    <button
                      onClick={() => setOpenSource(isOpen ? null : source.id)}
                      className="flex w-full items-center justify-between px-4.5 py-3 text-left transition-colors hover:bg-slate-50/80"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="slate">{source.kind}</Badge>
                        <span className="text-sm font-bold text-slate-800">{source.label}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-indigo-600" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100 bg-slate-50/60"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4.5 py-3 text-xs">
                            <div>
                              <span className="font-semibold text-slate-500">Official Reference URL: </span>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                              >
                                {source.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <div className="text-slate-400">
                              Verified on: <span className="font-medium text-slate-600">{source.retrievedOn}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                No explicit source records bound to this assessment response.
              </div>
            )}
          </div>
        </div>

        {/* Interactive Document Checklist */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
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
                      ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-slate-50/60"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                      checked
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
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
                    className={`h-4 w-4 ${checked ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <span
                    className={`flex-1 text-xs sm:text-sm font-medium ${
                      checked ? "text-emerald-950 font-bold" : "text-slate-700"
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

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Summary</span>
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={handleSaveToVault}
              disabled={isSaving || !data}
              className={savedId ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold" : ""}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : savedId ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Saved as {savedId}!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 text-indigo-600" />
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

      {/* Information Notice Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <p className="text-xs leading-relaxed text-slate-500">
            <span className="font-bold text-slate-700">Deterministic Assessment Notice:</span> Citations and status are matched against verified Bare Acts and rules. This system provides informational research and does not substitute for licensed legal representation.
          </p>
        </div>
      </div>
    </div>
  );
}
