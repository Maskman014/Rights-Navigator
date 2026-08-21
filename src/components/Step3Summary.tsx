import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  CheckSquare,
  FileText,
  ShieldCheck,
  Sparkles,
  User,
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
  const facts = form.domain ? DOMAIN_FACTS[form.domain] : [];
  const confirmedLabels = facts
    .filter((f) => form.confirmedFacts.includes(f.id))
    .map((f) => f.label);

  const dateDisplay = formatIncidentDate(form);

  return (
    <Card
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <SectionTitle
        step={3}
        title="Summary & Confirmation Gate"
        subtitle="Review your inputs. Confirming unlocks authoritative server-side legal evaluation."
        badgeText="Step 3 of 5"
      />

      {/* Confirmation Status Banner */}
      <div className="mb-6 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                form.confirmed
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white"
                  : "bg-indigo-600/80 text-white"
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
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                      : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
                  }`}
                >
                  {form.confirmed ? "Unlocked" : "Locked"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {form.confirmed
                  ? "Proceed to Step 4 to view deterministic statutory citations."
                  : "Please verify all statements before unlocking the legal assessment engine."}
              </p>
            </div>
          </div>

          <Button
            onClick={onConfirm}
            disabled={form.confirmed}
            variant={form.confirmed ? "secondary" : "primary"}
            size="md"
            className={
              form.confirmed
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30"
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/75 px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Intake Statement Breakdown
          </span>
          <Badge variant="slate">Read-only Record</Badge>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          {/* Domain */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Tag className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Domain
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{form.domain ?? "—"}</span>
              <Badge variant="indigo">Selected</Badge>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
              Jurisdiction
            </span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">
                {form.district ? `${form.district}, ` : ""}{form.state || "—"}
              </p>
              <p className="text-xs text-slate-500">
                State Jurisdiction Bound: {form.state || "Not specified"}
              </p>
            </div>
          </div>

          {/* Incident Date */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Date
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{dateDisplay || "—"}</span>
              <Badge variant="slate">
                Precision: {form.datePrecision === "month" ? "Month" : "Exact Day"}
              </Badge>
            </div>
          </div>

          {/* Confirmed Facts */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
              Confirmed Facts
            </span>
            <div className="flex-1">
              {confirmedLabels.length > 0 ? (
                <ul className="space-y-2">
                  {confirmedLabels.map((label, idx) => (
                    <li
                      key={label}
                      className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-100"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No facts confirmed</p>
              )}
            </div>
          </div>

          {/* Narrative */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
            <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
              Narrative
            </span>
            <p className="flex-1 rounded-xl bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-700 border border-slate-100">
              {form.narrative || "No narrative provided."}
            </p>
          </div>

          {/* Parties Profile */}
          {(form.applicantName || form.oppositePartyName) && (
            <div className="flex items-start gap-4 px-5 py-4 bg-indigo-50/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <User className="h-4 w-4" />
              </div>
              <span className="w-28 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
                Dispute Parties
              </span>
              <div className="space-y-1 text-xs">
                {form.applicantName && (
                  <p className="text-slate-800">
                    <span className="font-bold text-slate-500">Applicant:</span> {form.applicantName}
                  </p>
                )}
                {form.oppositePartyName && (
                  <p className="text-slate-800">
                    <span className="font-bold text-slate-500">Opposite Party:</span> {form.oppositePartyName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Fact-Finding</span>
        </Button>

        {form.confirmed && (
          <Button onClick={onConfirm} variant="emerald" size="lg">
            <span>Go to Assessment Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
