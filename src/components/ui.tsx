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
    bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ring-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  amber: {
    bg: "bg-amber-500/10 text-amber-300 border border-amber-500/30 ring-amber-500/20",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  },
  indigo: {
    bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ring-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  violet: {
    bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ring-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  cyan: {
    bg: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 ring-cyan-500/20",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
  },
  slate: {
    bg: "bg-slate-800 text-slate-300 border border-slate-700 ring-slate-700/50",
    dot: "bg-slate-400",
  },
  red: {
    bg: "bg-red-500/10 text-red-400 border border-red-500/30 ring-red-500/20",
    dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]",
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
      className={`rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl transition-all sm:p-8 text-slate-100 ${
        hoverEffect ? "hover:border-emerald-500/50 hover:shadow-emerald-950/30" : ""
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
    "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 active:scale-[0.98]",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 shadow-sm active:scale-[0.98]",
  emerald:
    "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 active:scale-[0.98]",
  outline:
    "border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-[0.98]",
  ghost: "text-slate-400 hover:bg-slate-800 hover:text-white active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-950/50 active:scale-[0.98]",
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
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
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
    <div className="mb-8 border-b border-slate-800/80 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-950 ring-4 ring-emerald-500/20">
            {step}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
        </div>
        {badgeText && (
          <Badge variant="emerald" dot>
            {badgeText}
          </Badge>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:ml-11">
          {subtitle}
        </p>
      )}
    </div>
  );
}
