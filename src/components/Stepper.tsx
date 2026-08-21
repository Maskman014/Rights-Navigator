import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

interface StepperProps {
  currentStep: number;
  maxStep: number;
  onStepClick: (step: number) => void;
}

const STEP_LABELS = [
  "Story & Location",
  "Fact-Finding",
  "Summary",
  "Assessment",
  "Action Studio",
];

export default function Stepper({ currentStep, maxStep, onStepClick }: StepperProps) {
  return (
    <nav className="mx-auto max-w-5xl px-4 py-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isComplete = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isAccessible = stepNum <= maxStep;

            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    disabled={!isAccessible}
                    onClick={() => isAccessible && onStepClick(stepNum)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isComplete
                        ? "bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                        : isCurrent
                        ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-100"
                        : "bg-slate-100 text-slate-400"
                    } ${isAccessible ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-60"}`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      stepNum
                    )}
                    {isCurrent && (
                      <motion.span
                        layoutId="step-glow"
                        className="absolute inset-0 -z-10 rounded-2xl bg-indigo-500/20 blur-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>

                  <span
                    className={`hidden text-xs font-semibold sm:block ${
                      isCurrent
                        ? "font-bold text-indigo-700"
                        : isComplete
                        ? "text-emerald-700 font-medium"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {idx < STEP_LABELS.length - 1 && (
                  <div className="mx-2 h-1.5 flex-1 rounded-full bg-slate-100 sm:mx-4">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600"
                      initial={{ width: "0%" }}
                      animate={{ width: stepNum < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
