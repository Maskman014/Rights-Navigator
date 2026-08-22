import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  FileText,
  ChevronDown,
  AlertCircle,
  ShoppingBag,
  Briefcase,
  Home,
  ArrowRight,
  CheckCircle2,
  User,
} from "lucide-react";
import type { Domain, FormState } from "../types";
import { DOMAINS, STATES, DISTRICTS_BY_STATE, MONTHS } from "../mockData";

interface Step1Props {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onNext: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i));

const MONTH_INDEX: Record<string, number> = {};
MONTHS.forEach((m, i) => {
  MONTH_INDEX[m] = i;
});

function daysInMonth(monthName: string): number {
  const idx = MONTH_INDEX[monthName];
  if (idx === undefined) return 31;
  if (idx === 1) return 29; // Feb safe leap year
  if ([3, 5, 8, 10].includes(idx)) return 30;
  return 31;
}

interface ValidationErrors {
  domain?: string;
  state?: string;
  district?: string;
  incidentYear?: string;
  incidentMonth?: string;
  incidentDay?: string;
  narrative?: string;
}

function validate(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.domain) errors.domain = "Please select a dispute domain.";
  if (!form.state) errors.state = "Please select a State / UT.";
  if (!form.district) errors.district = "Please select a district.";
  if (!form.incidentYear) errors.incidentYear = "Please select a year.";
  if (!form.incidentMonth) errors.incidentMonth = "Please select a month.";
  if (form.datePrecision === "day" && !form.incidentDay) {
    errors.incidentDay = "Please select a day.";
  }
  if (form.narrative.trim().length === 0) {
    errors.narrative = "Please describe what happened.";
  }
  return errors;
}

const DOMAIN_DETAILS: Record<
  Domain,
  { icon: typeof ShoppingBag; title: string; subtitle: string; tag: string }
> = {
  Consumer: {
    icon: ShoppingBag,
    title: "Consumer Rights",
    subtitle: "Defective goods, service deficiency, refunds, unfair trade practices",
    tag: "CPA 2019",
  },
  Workplace: {
    icon: Briefcase,
    title: "Workplace & Labor",
    subtitle: "Unpaid/delayed wages, wrongful termination, gratuity, notice period",
    tag: "Wage Code & Acts",
  },
  Tenant: {
    icon: Home,
    title: "Tenant & Housing",
    subtitle: "Eviction notices, security deposit recovery, rent escalation",
    tag: "Rent Control",
  },
};

export default function Step1Story({ form, onChange, onNext }: Step1Props) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [attemptedNext, setAttemptedNext] = useState(false);

  const districts = form.state ? DISTRICTS_BY_STATE[form.state] ?? [] : [];
  const maxDay = form.incidentMonth ? daysInMonth(form.incidentMonth) : 31;

  const dayOptions = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, "0")),
    [maxDay]
  );

  const dayOutOfRange = form.incidentDay && parseInt(form.incidentDay, 10) > maxDay;

  const handleChange = (patch: Partial<FormState>) => {
    onChange(patch);
    if (attemptedNext) {
      setErrors(validate({ ...form, ...patch }));
    }
  };

  const handleStateChange = (newState: string) => {
    handleChange({ state: newState, district: "" });
  };

  const handlePrecisionChange = (precision: "month" | "day") => {
    if (precision === "month") {
      handleChange({ datePrecision: "month", incidentDay: "" });
    } else {
      handleChange({ datePrecision: "day" });
    }
  };

  const handleMonthChange = (newMonth: string) => {
    if (form.incidentDay && parseInt(form.incidentDay, 10) > daysInMonth(newMonth)) {
      handleChange({ incidentMonth: newMonth, incidentDay: "" });
    } else {
      handleChange({ incidentMonth: newMonth });
    }
  };

  const handleNext = () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setAttemptedNext(true);
    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  };

  const fieldError = (field: keyof ValidationErrors): string | undefined => {
    return errors[field];
  };

  const errorClass = (hasError: boolean): string =>
    hasError
      ? "border-red-500/80 ring-2 ring-red-500/20 bg-red-950/20 text-white focus:border-red-500"
      : "border-slate-800 bg-slate-950/70 text-white placeholder:text-slate-500 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full text-slate-100"
    >
      {/* Title Header */}
      <div className="mb-8 border-b border-slate-800/80 pb-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            Step 1 of 5
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">
          Dispute Category &amp; Location
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Specify the dispute category, jurisdiction, and incident timeline to load relevant statutes.
        </p>
      </div>

      {/* Domain Cards */}
      <div className="mb-8">
        <label className="mb-3 flex items-center justify-between text-sm font-bold text-slate-200">
          <span>1. Select Dispute Domain</span>
          <span className="text-xs font-normal text-slate-400">Required</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          {DOMAINS.map((d: Domain) => {
            const active = form.domain === d;
            const details = DOMAIN_DETAILS[d];
            const Icon = details.icon;

            return (
              <button
                type="button"
                key={d}
                onClick={() => handleChange({ domain: d, confirmedFacts: [] })}
                className={`group relative flex flex-col items-start rounded-2xl p-4 text-left transition-all duration-200 border ${
                  active
                    ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/30"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
                }`}
              >
                <div className="flex w-full items-center justify-between mb-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      active ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {active && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                </div>

                <h3 className="text-sm font-bold text-white">{details.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{details.subtitle}</p>

                <div className="mt-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                      active
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700/50"
                    }`}
                  >
                    {details.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {fieldError("domain") && <FieldError message={fieldError("domain")!} />}
      </div>

      {/* State & District Grid */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-bold text-slate-200">
          2. Jurisdiction &amp; Location
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              State / Union Territory
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={form.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium transition-all focus:outline-none ${errorClass(
                  !!fieldError("state")
                )}`}
              >
                <option value="" className="bg-slate-900 text-slate-300">Select State / UT</option>
                <optgroup label="States" className="bg-slate-900 text-emerald-400 font-semibold">
                  {STATES.filter((s) => !isUT(s)).map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white font-normal">
                      {s}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories" className="bg-slate-900 text-emerald-400 font-semibold">
                  {STATES.filter((s) => isUT(s)).map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white font-normal">
                      {s}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            {fieldError("state") && <FieldError message={fieldError("state")!} />}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              District
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={form.district}
                onChange={(e) => handleChange({ district: e.target.value })}
                disabled={!form.state}
                className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium transition-all focus:outline-none disabled:bg-slate-900/40 disabled:border-slate-800 disabled:text-slate-600 ${errorClass(
                  !!fieldError("district")
                )}`}
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  {form.state ? "Select district" : "Select State first"}
                </option>
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            {fieldError("district") && <FieldError message={fieldError("district")!} />}
          </div>
        </div>
      </div>

      {/* Incident Date Picker */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-200">
            3. Incident Timeline
          </label>
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => handlePrecisionChange("month")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                form.datePrecision === "month"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Month Precision
            </button>
            <button
              type="button"
              onClick={() => handlePrecisionChange("day")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                form.datePrecision === "day"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Exact Day
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Year */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={form.incidentYear}
              onChange={(e) => handleChange({ incidentYear: e.target.value })}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium transition-all focus:outline-none ${errorClass(
                !!fieldError("incidentYear")
              )}`}
            >
              <option value="" className="bg-slate-900 text-slate-300">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Month */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={form.incidentMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium transition-all focus:outline-none ${errorClass(
                !!fieldError("incidentMonth")
              )}`}
            >
              <option value="" className="bg-slate-900 text-slate-300">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Day */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={form.incidentDay}
              onChange={(e) => handleChange({ incidentDay: e.target.value })}
              disabled={form.datePrecision !== "day"}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium transition-all focus:outline-none disabled:bg-slate-900/40 disabled:border-slate-800 disabled:text-slate-600 ${errorClass(
                !!fieldError("incidentDay")
              )}`}
            >
              <option value="" className="bg-slate-900 text-slate-300">Day</option>
              {dayOptions.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {/* Date formatted tag */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {form.incidentYear && form.incidentMonth && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {form.datePrecision === "day" && form.incidentDay
                ? `${form.incidentYear}-${String(MONTH_INDEX[form.incidentMonth] + 1).padStart(2, "0")}-${form.incidentDay}`
                : `${form.incidentYear}-${String(MONTH_INDEX[form.incidentMonth] + 1).padStart(2, "0")} (Full month interval)`}
            </span>
          )}
          {dayOutOfRange && form.datePrecision === "day" && (
            <span className="text-xs font-semibold text-red-400">
              Invalid day for selected month.
            </span>
          )}
        </div>
      </div>

      {/* Narrative Section */}
      <div className="mb-8">
        <label className="mb-2 flex items-center justify-between text-sm font-bold text-slate-200">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            4. What Happened? (Citizen Narrative)
          </span>
          <span className="text-xs font-normal text-slate-400">
            {form.narrative.trim().length} characters
          </span>
        </label>
        <div className="relative">
          <textarea
            value={form.narrative}
            onChange={(e) => handleChange({ narrative: e.target.value })}
            rows={5}
            placeholder="Describe the incident clearly. For example: 'I purchased an electronic item on invoice #4829 from a local merchant. Within 10 days, the unit suffered a power failure and the seller refused repair or replacement despite active manufacturer warranty...'"
            className={`w-full rounded-2xl border p-4 text-sm leading-relaxed transition-all focus:outline-none ${errorClass(
              !!fieldError("narrative")
            )}`}
          />
        </div>
        {fieldError("narrative") && <FieldError message={fieldError("narrative")!} />}
      </div>

      {/* Optional: Dispute Parties & Name */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="mb-3.5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <User className="h-4 w-4 text-emerald-400" />
            <span>5. Personal &amp; Opposite Party Details (Optional)</span>
          </label>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            Used for Personalized Notices &amp; PDF
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Your Full Name (Complainant / Applicant)
            </label>
            <input
              type="text"
              value={form.applicantName || ""}
              onChange={(e) => handleChange({ applicantName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Opposite Party / Merchant / Employer / Landlord
            </label>
            <input
              type="text"
              value={form.oppositePartyName || ""}
              onChange={(e) => handleChange({ oppositePartyName: e.target.value })}
              placeholder="e.g. XYZ Electronics Pvt. Ltd."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center justify-end border-t border-slate-800/80 pt-6">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition-all hover:bg-emerald-500 active:bg-emerald-700 cursor-pointer"
        >
          <span>Continue to Fact-Finding</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

function isUT(name: string): boolean {
  const UTS = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi (NCT)",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  return UTS.includes(name);
}
