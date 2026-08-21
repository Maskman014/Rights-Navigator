import { useState, useEffect } from "react";
import { Compass, ShieldCheck, Scale, FolderArchive } from "lucide-react";
import { Badge } from "./ui";
import ArchitectureModal from "./ArchitectureModal";

interface HeaderProps {
  onOpenVault?: () => void;
  vaultCount?: number;
}

export default function Header({ onOpenVault, vaultCount = 0 }: HeaderProps) {
  const [archOpen, setArchOpen] = useState(false);

  useEffect(() => {
    // Clear any legacy harsh theme overrides
    document.documentElement.classList.remove("theme-bw", "dark");
    localStorage.removeItem("theme");
  }, []);

  return (
    <>
      <header className="relative border-b border-indigo-950/40 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        {/* Ambient background lighting */}
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/30 ring-2 ring-white/20">
              <Scale className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  Rights Navigator
                </h1>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-300 uppercase ring-1 ring-inset ring-indigo-400/30">
                  India Law Edition
                </span>
              </div>
              <p className="text-xs text-slate-300 sm:text-sm font-medium">
                Grounded Legal Navigation &amp; Deterministic Statutory Matcher
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenVault && (
              <button
                onClick={onOpenVault}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-600/30 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-indigo-600/50 hover:border-indigo-400/50 active:scale-95 shadow-sm"
              >
                <FolderArchive className="h-4 w-4 text-indigo-300" />
                <span>Case Vault</span>
                {vaultCount > 0 && (
                  <span className="rounded-full bg-indigo-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {vaultCount}
                  </span>
                )}
              </button>
            )}

            {onOpenVault && (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-600/30 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-red-600/50 hover:border-red-400/50 active:scale-95 shadow-sm"
              >
                <span>Sign Out</span>
              </button>
            )}

            <Badge variant="amber" className="bg-amber-950/40 text-amber-300 border-amber-500/30 ring-amber-500/20" dot>
              Informational Guidance Only
            </Badge>

            <button
              onClick={() => setArchOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30 hover:text-white active:scale-95"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Architecture &amp; Trust</span>
            </button>
          </div>
        </div>
      </header>
      <ArchitectureModal open={archOpen} onClose={() => setArchOpen(false)} />
    </>
  );
}
