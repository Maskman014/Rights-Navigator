import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, ListChecks, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import type { FormState } from "../types";
import { DOMAIN_FACTS } from "../mockData";
import { Card, SectionTitle, Button, Badge } from "./ui";

interface Step2Props {
  form: FormState;
  onToggleFact: (factId: string) => void;
  onChange: (patch: Partial<FormState>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2Facts({ form, onToggleFact, onChange, onBack, onNext }: Step2Props) {
  const facts = form.domain ? DOMAIN_FACTS[form.domain] : [];
  const selectedCount = form.confirmedFacts.length;

  return (
    <Card
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <SectionTitle
        step={2}
        title="Fact-Finding Context Builder"
        subtitle="Confirm key evidentiary facts that establish statutory locus standi and substantive rights."
        badgeText="Step 2 of 5"
      />

      {form.domain ? (
        <>
          {/* Domain Context Banner */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-indigo-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {form.domain} Dispute Context
                  </h3>
                  <Badge variant="indigo" dot>
                    {selectedCount} of {facts.length} confirmed
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Select all evidentiary circumstances that apply to your situation
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Warning Banner */}
          {form.domain === "Tenant" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-xs leading-relaxed sm:text-sm">
                <span className="font-bold">Dataset Notice for Tenancy Disputes:</span> Verified canonical source records in this prototype currently index the <span className="font-semibold">Madhya Pradesh Accommodation Control Act, 1961</span>. Tenancy cases from other states will indicate limited statutory coverage.
              </div>
            </div>
          )}

          {/* Fact Checklist Tiles */}
          <div className="space-y-3">
            {facts.map((fact, idx) => {
              const checked = form.confirmedFacts.includes(fact.id);
              return (
                <motion.label
                  key={fact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                    checked
                      ? "border-indigo-600 bg-gradient-to-r from-indigo-50/80 to-white shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-slate-50/70 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                      checked
                        ? "border-indigo-600 bg-indigo-600 shadow-sm shadow-indigo-600/30"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    <AnimatePresence>
                      {checked && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check className="h-4 w-4 stroke-[3] text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleFact(fact.id)}
                    className="sr-only"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold transition-colors ${checked ? "text-indigo-950" : "text-slate-800"}`}>
                        {fact.label}
                      </p>
                      {checked && (
                        <span className="text-[11px] font-bold text-indigo-600">
                          Confirmed
                        </span>
                      )}
                    </div>
                    {fact.hint && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {fact.hint}
                      </p>
                    )}
                  </div>
                </motion.label>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-900">Upload Evidence/Proofs</h4>
            <input 
              type="file" 
              multiple 
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={async (e) => {
                if (!e.target.files?.length) return;
                const newProofs = [...(form.proofs || [])];
                for (let i = 0; i < e.target.files.length; i++) {
                  const file = e.target.files[i];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    newProofs.push({ name: file.name, data: reader.result as string });
                    if (newProofs.length === (form.proofs?.length || 0) + e.target.files!.length) {
                      onChange({ proofs: newProofs });
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {form.proofs && form.proofs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.proofs.map((p, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button onClick={onNext} disabled={selectedCount === 0} variant="primary" size="lg">
              <span>Review Summary</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-amber-50 p-6 text-center text-sm text-amber-800 border border-amber-200">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-600" />
          <p className="font-semibold">No domain selected</p>
          <p className="mt-1 text-xs text-amber-700">Please return to Step 1 and choose a dispute category.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Go Back to Step 1
          </Button>
        </div>
      )}
    </Card>
  );
}
