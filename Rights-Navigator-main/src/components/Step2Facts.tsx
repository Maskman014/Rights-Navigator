import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, ListChecks, AlertCircle } from "lucide-react";
import type { FormState } from "../types";
import { DOMAIN_FACTS } from "../mockData";
import { Card, Button, Badge } from "./ui";

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
      className="mx-auto max-w-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-xl"
    >
      {/* Step Title Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20">
              2
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight sm:text-2xl">
              Fact-Finding Context Builder
            </h2>
          </div>

          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-800">
            Step 2 of 5
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 sm:text-sm leading-relaxed">
          Confirm key evidentiary facts that establish statutory locus standi and substantive rights.
        </p>
      </div>

      {form.domain ? (
        <>
          {/* Domain Context Banner */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">
                    {form.domain} Dispute Context
                  </h3>
                  <Badge variant="emerald" dot>
                    {selectedCount} of {facts.length} confirmed
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Select all evidentiary circumstances that apply to your situation
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Warning Banner */}
          {form.domain === "Tenant" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-900 bg-amber-950/60 p-4 text-sm text-amber-200 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
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
                      ? "border-emerald-700 bg-gradient-to-r from-emerald-950/70 to-slate-900 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-800 bg-slate-900/80 hover:border-emerald-800 hover:bg-slate-800/60 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                      checked
                        ? "border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30"
                        : "border-slate-700 bg-slate-800 group-hover:border-slate-600"
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
                      <p className={`text-sm font-bold transition-colors ${checked ? "text-emerald-100" : "text-slate-200"}`}>
                        {fact.label}
                      </p>
                      {checked && (
                        <span className="text-[11px] font-bold text-emerald-400">
                          Confirmed
                        </span>
                      )}
                    </div>
                    {fact.hint && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {fact.hint}
                      </p>
                    )}
                  </div>
                </motion.label>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-100">Upload Evidence/Proofs</h4>
            <input 
              type="file" 
              multiple 
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-950 file:text-emerald-300 hover:file:bg-emerald-900"
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
                  <span key={i} className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
            <Button variant="ghost" onClick={onBack} className="text-slate-300 hover:text-white">
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
        <div className="rounded-2xl bg-amber-950/60 p-6 text-center text-sm text-amber-200 border border-amber-900">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-400" />
          <p className="font-semibold">No domain selected</p>
          <p className="mt-1 text-xs text-amber-300">Please return to Step 1 and choose a dispute category.</p>
          <Button variant="outline" onClick={onBack} className="mt-4 border-amber-800 text-amber-200 hover:bg-amber-900">
            Go Back to Step 1
          </Button>
        </div>
      )}
    </Card>
  );
}