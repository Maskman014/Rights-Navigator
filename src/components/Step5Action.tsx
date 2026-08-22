import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  CheckSquare,
  FileText,
  ShieldCheck,
  User,
  Unlock,
} from "lucide-react";
import type { FormState } from "../types";
import { formatIncidentDate } from "../types";
import { DOMAIN_FACTS } from "../mockData";
import { Card, SectionTitle, Button, Badge } from "./ui";

interface Step3Props {
  form: FormState;
  onBack: () => void;
  onConfirm: () => void;
}

export default function Step3Summary({ form, onBack, onConfirm }: Step3Props) {
  const facts = form.domain ? DOMAIN_FACTS[form.domain] || [] : [];
  const confirmedLabels = facts
    .filter((f) => form.confirmedFacts.includes(f.id))
    .map((f) => f.label);

  const dateDisplay = formatIncidentDate(form);

  return (
    <Card
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl bg-transparent border-none p-0 text-slate-100"
    >
      <SectionTitle
        step={3}
        title="Summary & Confirmation Gate"
        subtitle="Review your inputs. Confirming unlocks authoritative server-side legal evaluation."
        badgeText="Step 3 of 5"
      />

      {/* Confirmation Status Banner */}
      <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
                form.confirmed
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {form.confirmed ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {form.confirmed ? "Intake Confirmed & Ready" : "Review Intake Dossier"}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    form.confirmed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {form.confirmed ? "Unlocked" : "Locked"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {form.confirmed
                  ? "Proceed to Step 4 to view deterministic statutory citations."
                  : "Please verify all statements before unlocking the legal assessment engine."}
              </p>
            </div>
          </div>

          <Button
            onClick={onConfirm}
            disabled={form.confirmed}
            variant={form.confirmed ? "secondary" : "emerald"}
            size="md"
            className={
              form.confirmed
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50"
            }
          >
            {form.confirmed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmed</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                <span>Confirm &amp; Unlock</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Structured Summary Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-lg">
        <div className="border-b border-slate-800/80 bg-slate-900/80 px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Intake Statement Breakdown
          </span>
          <Badge variant="slate">Read-only Record</Badge>
        </div>

        <div className="divide-y divide-slate-800/60 text-sm">
          {/* Domain */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Tag className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Domain
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{form.domain ?? "—"}</span>
              <Badge variant="emerald">Selected</Badge>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">
              Jurisdiction
            </span>
            <div className="space-y-1">
              <p className="font-bold text-white">
                {form.district ? `${form.district}, ` : ""}{form.state || "—"}
              </p>
              <p className="text-xs text-slate-400">
                State Jurisdiction Bound: {form.state || "Not specified"}
              </p>
            </div>
          </div>

          {/* Incident Date */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Date
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{dateDisplay || "—"}</span>
              <Badge variant="slate">
                Precision: {form.datePrecision === "month" ? "Month" : "Exact Day"}
              </Badge>
            </div>
          </div>

          {/* Confirmed Facts */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">
              Confirmed Facts
            </span>
            <div className="flex-1">
              {confirmedLabels.length > 0 ? (
                <ul className="space-y-2">
                  {confirmedLabels.map((label) => (
                    <li
                      key={label}
                      className="flex items-start gap-2 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-200 border border-slate-700/60"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No facts confirmed</p>
              )}
            </div>
          </div>

          {/* Narrative */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              <FileText className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">
              Narrative
            </span>
            <p className="flex-1 rounded-xl bg-slate-800/40 p-3.5 text-xs leading-relaxed text-slate-300 border border-slate-700/50">
              {form.narrative || "No narrative provided."}
            </p>
          </div>

          {/* Parties Profile */}
          {(form.applicantName || form.oppositePartyName) && (
            <div className="flex items-start gap-4 px-5 py-4 bg-emerald-950/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <User className="h-4 w-4" />
              </div>
              <span className="w-28 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">
                Dispute Parties
              </span>
              <div className="space-y-1 text-xs">
                {form.applicantName && (
                  <p className="text-slate-200">
                    <span className="font-bold text-slate-400">Applicant:</span> {form.applicantName}
                  </p>
                )}
                {form.oppositePartyName && (
                  <p className="text-slate-200">
                    <span className="font-bold text-slate-400">Opposite Party:</span> {form.oppositePartyName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Fact-Finding</span>
        </Button>

        {form.confirmed && (
          <Button 
            onClick={onConfirm} 
            variant="emerald" 
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50"
          >
            <span>Go to Assessment Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
