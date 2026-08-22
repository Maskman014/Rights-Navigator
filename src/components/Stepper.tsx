import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur-xl">
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : isCurrent
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950 ring-4 ring-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700/60"
                    } ${isAccessible ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"}`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      stepNum
                    )}
                    {isCurrent && (
                      <motion.span
                        layoutId="step-glow"
                        className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/30 blur-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>

                  <span
                    className={`hidden text-xs sm:block ${
                      isCurrent
                        ? "font-bold text-emerald-400"
                        : isComplete
                        ? "font-medium text-slate-200"
                        : "font-medium text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {idx < STEP_LABELS.length - 1 && (
                  <div className="mx-2 h-1 flex-1 rounded-full bg-slate-800 sm:mx-4">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
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
