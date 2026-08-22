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
      ? "border-red-300 ring-2 ring-red-100 bg-red-50/30 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50"
    >
      {/* Title Header */}
      <div className="mb-8 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <span 
            style={{ backgroundColor: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" }} 
            className="rounded-full border px-3 py-1 text-xs font-bold"
          >
            Step 1 of 5
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
          Dispute Category &amp; Location
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Specify the dispute category, jurisdiction, and incident timeline to load relevant statutes.
        </p>
      </div>

      {/* Domain Cards */}
      <div className="mb-8">
        <label className="mb-3 flex items-center justify-between text-sm font-bold text-slate-800">
          <span>1. Select Dispute Domain</span>
          <span className="text-xs font-normal text-slate-500">Required</span>
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
                style={{
                  backgroundColor: active ? "#ecfdf5" : "#ffffff",
                  borderColor: active ? "#059669" : "#e2e8f0",
                  borderWidth: active ? "2px" : "1px",
                  boxShadow: active ? "0 4px 14px 0 rgba(5, 150, 105, 0.15)" : "none",
                }}
                className="group relative flex flex-col items-start rounded-2xl p-4 text-left transition-all duration-200 hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="flex w-full items-center justify-between mb-2.5">
                  <div
                    style={{
                      backgroundColor: active ? "#059669" : "#f1f5f9",
                      color: active ? "#ffffff" : "#475569",
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {active && (
                    <CheckCircle2 className="h-5 w-5" style={{ color: "#059669" }} />
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900">{details.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{details.subtitle}</p>

                <div className="mt-3">
                  <span
                    style={{
                      backgroundColor: active ? "#059669" : "#f1f5f9",
                      color: active ? "#ffffff" : "#475569",
                    }}
                    className="rounded-md px-2 py-0.5 text-[10px] font-bold"
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
        <label className="mb-3 block text-sm font-bold text-slate-800">
          2. Jurisdiction &amp; Location
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              State / Union Territory
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={form.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 transition-all focus:outline-none ${errorClass(
                  !!fieldError("state")
                )}`}
              >
                <option value="">Select State / UT</option>
                <optgroup label="States">
                  {STATES.filter((s) => !isUT(s)).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories">
                  {STATES.filter((s) => isUT(s)).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {fieldError("state") && <FieldError message={fieldError("state")!} />}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              District
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={form.district}
                onChange={(e) => handleChange({ district: e.target.value })}
                disabled={!form.state}
                className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 transition-all focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 ${errorClass(
                  !!fieldError("district")
                )}`}
              >
                <option value="">
                  {form.state ? "Select district" : "Select State first"}
                </option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {fieldError("district") && <FieldError message={fieldError("district")!} />}
          </div>
        </div>
      </div>

      {/* Incident Date Picker */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800">
            3. Incident Timeline
          </label>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handlePrecisionChange("month")}
              style={{
                backgroundColor: form.datePrecision === "month" ? "#ffffff" : "transparent",
                color: form.datePrecision === "month" ? "#047857" : "#64748b",
              }}
              className="rounded-lg px-3 py-1 text-xs font-bold transition-all shadow-sm"
            >
              Month Precision
            </button>
            <button
              type="button"
              onClick={() => handlePrecisionChange("day")}
              style={{
                backgroundColor: form.datePrecision === "day" ? "#ffffff" : "transparent",
                color: form.datePrecision === "day" ? "#047857" : "#64748b",
              }}
              className="rounded-lg px-3 py-1 text-xs font-bold transition-all shadow-sm"
            >
              Exact Day
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Year */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={form.incidentYear}
              onChange={(e) => handleChange({ incidentYear: e.target.value })}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 transition-all focus:outline-none ${errorClass(
                !!fieldError("incidentYear")
              )}`}
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Month */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={form.incidentMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 transition-all focus:outline-none ${errorClass(
                !!fieldError("incidentMonth")
              )}`}
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Day */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={form.incidentDay}
              onChange={(e) => handleChange({ incidentDay: e.target.value })}
              disabled={form.datePrecision !== "day"}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 transition-all focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 ${errorClass(
                !!fieldError("incidentDay")
              )}`}
            >
              <option value="">Day</option>
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Date formatted tag */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {form.incidentYear && form.incidentMonth && (
            <span
              style={{ backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold"
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#10b981" }} />
              {form.datePrecision === "day" && form.incidentDay
                ? `${form.incidentYear}-${String(MONTH_INDEX[form.incidentMonth] + 1).padStart(2, "0")}-${form.incidentDay}`
                : `${form.incidentYear}-${String(MONTH_INDEX[form.incidentMonth] + 1).padStart(2, "0")} (Full month interval)`}
            </span>
          )}
          {dayOutOfRange && form.datePrecision === "day" && (
            <span className="text-xs font-semibold text-red-600">
              Invalid day for selected month.
            </span>
          )}
        </div>
      </div>

      {/* Narrative Section */}
      <div className="mb-8">
        <label className="mb-2 flex items-center justify-between text-sm font-bold text-slate-800">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: "#059669" }} />
            4. What Happened? (Citizen Narrative)
          </span>
          <span className="text-xs font-normal text-slate-500">
            {form.narrative.trim().length} characters
          </span>
        </label>
        <div className="relative">
          <textarea
            value={form.narrative}
            onChange={(e) => handleChange({ narrative: e.target.value })}
            rows={5}
            placeholder="Describe the incident clearly. For example: 'I purchased an electronic item on invoice #4829 from a local merchant. Within 10 days, the unit suffered a power failure and the seller refused repair or replacement despite active manufacturer warranty...'"
            className={`w-full rounded-2xl border p-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none ${errorClass(
              !!fieldError("narrative")
            )}`}
          />
        </div>
        {fieldError("narrative") && <FieldError message={fieldError("narrative")!} />}
      </div>

      {/* Optional: Dispute Parties & Name */}
      <div 
        style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
        className="mb-8 rounded-2xl border p-5"
      >
        <div className="mb-3.5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <User className="h-4 w-4" style={{ color: "#059669" }} />
            <span>5. Personal &amp; Opposite Party Details (Optional)</span>
          </label>
          <span 
            style={{ backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" }}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
          >
            Used for Personalized Notices &amp; PDF
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Your Full Name (Complainant / Applicant)
            </label>
            <input
              type="text"
              value={form.applicantName || ""}
              onChange={(e) => handleChange({ applicantName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Opposite Party / Merchant / Employer / Landlord
            </label>
            <input
              type="text"
              value={form.oppositePartyName || ""}
              onChange={(e) => handleChange({ oppositePartyName: e.target.value })}
              placeholder="e.g. XYZ Electronics Pvt. Ltd."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center justify-end border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={handleNext}
          style={{ backgroundColor: "#059669" }}
          className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer"
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
      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600"
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
