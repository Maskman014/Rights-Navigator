import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface BadgeProps {
  children: ReactNode;
  variant?: "emerald" | "amber" | "indigo" | "slate" | "red" | "violet" | "cyan";
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, { bg: string; dot: string }> = {
  emerald: {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 border border-emerald-200/60",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  },
  amber: {
    bg: "bg-amber-50 text-amber-800 ring-amber-600/20 border border-amber-200/60",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  },
  indigo: {
    bg: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 border border-indigo-200/60",
    dot: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
  },
  violet: {
    bg: "bg-purple-50 text-purple-700 ring-purple-600/20 border border-purple-200/60",
    dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  },
  cyan: {
    bg: "bg-cyan-50 text-cyan-700 ring-cyan-600/20 border border-cyan-200/60",
    dot: "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]",
  },
  slate: {
    bg: "bg-slate-100 text-slate-700 ring-slate-400/20 border border-slate-200/80",
    dot: "bg-slate-400",
  },
  red: {
    bg: "bg-red-50 text-red-700 ring-red-600/20 border border-red-200/60",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  },
};

export function Badge({ children, variant = "slate", className = "", dot = false }: BadgeProps) {
  const currentVariant = variantClasses[variant] || variantClasses.slate;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all ${currentVariant.bg} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${currentVariant.dot}`} />}
      {children}
    </span>
  );
}

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", hoverEffect = false, ...rest }: CardProps) {
  return (
    <motion.div
      className={`glass-card rounded-3xl border border-slate-200/80 p-6 shadow-card transition-all sm:p-8 ${
        hoverEffect ? "hover:shadow-card-hover hover:border-indigo-300/80" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.98]",
  emerald:
    "bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/25 active:scale-[0.98]",
  outline:
    "border border-slate-300/80 bg-white/90 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg",
  md: "px-4 py-2.5 text-sm font-semibold rounded-xl",
  lg: "px-6 py-3 text-base font-bold rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface SectionTitleProps {
  step: number;
  title: string;
  subtitle?: string;
  badgeText?: string;
}

export function SectionTitle({ step, title, subtitle, badgeText }: SectionTitleProps) {
  return (
    <div className="mb-8 border-b border-slate-100 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-sm font-bold text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-50">
            {step}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
        </div>
        {badgeText && (
          <Badge variant="indigo" dot>
            {badgeText}
          </Badge>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:ml-11">
          {subtitle}
        </p>
      )}
    </div>
  );
}
