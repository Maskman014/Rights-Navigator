import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  Link2,
  ScrollText,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Badge } from "./ui";

interface ArchitectureModalProps {
  open: boolean;
  onClose: () => void;
}

const pipeline = [
  {
    icon: User,
    title: "Citizen Intake Layer",
    desc: "Citizen provides dispute domain, jurisdiction, timeline, and narrative in natural language.",
    tag: "Intake",
    variant: "slate" as const,
  },
  {
    icon: Search,
    title: "Deterministic Fact Engine",
    desc: "Extracts and binds structured evidentiary facts required for statutory locus standi.",
    tag: "Rule Engine",
    variant: "indigo" as const,
  },
  {
    icon: Users,
    title: "Client-Side Matcher",
    desc: "Fast preview hint of possible statutes for user feedback. Strictly non-authoritative.",
    tag: "UX Hint",
    variant: "amber" as const,
  },
  {
    icon: ShieldCheck,
    title: "Server Security Boundary",
    desc: "The authoritative matcher runs isolated on the server. Evaluates temporal bounds and jurisdiction.",
    tag: "Authoritative",
    variant: "emerald" as const,
  },
  {
    icon: Sparkles,
    title: "Gemini Explanation Layer",
    desc: "Drafts plain-language explanations strictly constrained to verified statutory facts.",
    tag: "AI Translation",
    variant: "violet" as const,
  },
  {
    icon: Link2,
    title: "Citation Sanitizer",
    desc: "Validates and sanitizes every citation against an official IndiaCode allowlist.",
    tag: "Sanitization",
    variant: "cyan" as const,
  },
  {
    icon: ScrollText,
    title: "Immutable Audit Logger",
    desc: "Generates cryptographic audit IDs tracking server evaluations and AI overrides.",
    tag: "Audit Trail",
    variant: "slate" as const,
  },
];

export default function ArchitectureModal({ open, onClose }: ArchitectureModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">System Architecture &amp; Trust Model</h2>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                    Security Boundary Active
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  How Rights Navigator processes claims through deterministic legal verification
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pipeline list */}
            <div className="no-scrollbar overflow-y-auto p-6 space-y-3">
              <div className="space-y-2.5">
                {pipeline.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.title}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              0{idx + 1}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">
                              {stage.title}
                            </h3>
                            <Badge variant={stage.variant} dot>
                              {stage.tag}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {stage.desc}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* Trust Boundary Callout */}
              <div className="mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-white p-4.5 text-xs sm:text-sm text-indigo-950 shadow-sm">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <div>
                    <h4 className="font-bold text-indigo-950">
                      Authoritative Boundary Rule
                    </h4>
                    <p className="mt-1 leading-relaxed text-indigo-900 text-xs">
                      AI (Gemini) strictly translates verified server-evaluated statutes into plain language. It cannot invent citations, alter match status, or bypass temporal jurisdiction rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
