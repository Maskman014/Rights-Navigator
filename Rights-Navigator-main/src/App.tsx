import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale } from "lucide-react";
import type { FormState } from "./types";
import Header from "./components/Header";
import Stepper from "./components/Stepper";
import Step1Story from "./components/Step1Story";
import Step2Facts from "./components/Step2Facts";
import Step3Summary from "./components/Step3Summary";
import Step4Assessment from "./components/Step4Assessment";
import Step5Action from "./components/Step5Action";
import CaseVaultModal, { type SavedCase } from "./components/CaseVaultModal";
import Login from "./components/Login";

const INITIAL_FORM: FormState = {
  domain: null,
  state: "",
  district: "",
  datePrecision: "month",
  incidentYear: "",
  incidentMonth: "",
  incidentDay: "",
  narrative: "",
  confirmedFacts: [],
  confirmed: false,
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  applicantAddress: "",
  oppositePartyName: "",
  oppositePartyAddress: "",
  demandRelief: "",
};

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [maxStep, setMaxStep] = useState(1);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultCount, setVaultCount] = useState(0);
  const [guestMode, setGuestMode] = useState(false);

  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setGuestMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setGuestMode(false);
  };

  const fetchVaultCount = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/cases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setVaultCount(data.length);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error("Error checking cases vault count:", e);
    }
  };

  useEffect(() => {
    fetchVaultCount();
  }, [token]);

  const updateForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToStep = useCallback(
    (target: number) => {
      if (target >= 4 && !form.confirmed) return;
      setStep(target);
      setMaxStep((prev) => Math.max(prev, target));
    },
    [form.confirmed]
  );

  const toggleFact = useCallback((factId: string) => {
    setForm((prev) => ({
      ...prev,
      confirmedFacts: prev.confirmedFacts.includes(factId)
        ? prev.confirmedFacts.filter((id) => id !== factId)
        : [...prev.confirmedFacts, factId],
      confirmed: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    setForm((prev) => ({ ...prev, confirmed: true }));
    setStep(4);
    setMaxStep(4);
  }, []);

  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM);
    setStep(1);
    setMaxStep(1);
  }, []);

  const handleLoadCase = useCallback((savedCase: SavedCase) => {
    if (savedCase.formState) {
      setForm({ ...savedCase.formState, confirmed: true });
      setStep(5);
      setMaxStep(5);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0f1d] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. Real Courtroom Lady Justice Background Image Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity filter brightness-90 contrast-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000')`,
        }}
      />

      {/* 2. Dark Ambient Vignette & Radial Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#0a0f1d]/80 to-[#0a0f1d]" />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {(!token || !user) && !guestMode ? (
          /* Login Page View */
          <div className="flex min-h-screen items-center justify-center p-4">
            <Login onLogin={handleLogin} onSkip={() => setGuestMode(true)} />
          </div>
        ) : (
          /* Stepper App Pages */
          <>
            <Header onOpenVault={() => setVaultOpen(true)} vaultCount={vaultCount} />
            
            <div className="pt-4">
              <Stepper currentStep={step} maxStep={maxStep} onStepClick={goToStep} />
            </div>

            <main className="flex-1 px-4 py-6 sm:px-6 md:py-8">
              {/* Dark Glassmorphic Card Container: Eliminates white card entirely */}
              <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-slate-100 transition-all">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <Step1Story
                      key="step1"
                      form={form}
                      onChange={updateForm}
                      onNext={() => goToStep(2)}
                    />
                  )}
                  {step === 2 && (
                    <Step2Facts
                      key="step2"
                      form={form}
                      onChange={updateForm}
                      onToggleFact={toggleFact}
                      onBack={() => setStep(1)}
                      onNext={() => goToStep(3)}
                    />
                  )}
                  {step === 3 && (
                    <Step3Summary
                      key="step3"
                      form={form}
                      onBack={() => setStep(2)}
                      onConfirm={handleConfirm}
                    />
                  )}
                  {step === 4 && (
                    <Step4Assessment
                      key="step4"
                      form={form}
                      onBack={() => setStep(3)}
                      onNext={() => goToStep(5)}
                    />
                  )}
                  {step === 5 && (
                    <Step5Action
                      key="step5"
                      form={form}
                      onBack={() => setStep(4)}
                      onReset={handleReset}
                      onUpdateForm={updateForm}
                    />
                  )}
                </AnimatePresence>
              </div>
            </main>

            <CaseVaultModal
              open={vaultOpen}
              onClose={() => setVaultOpen(false)}
              onLoadCase={handleLoadCase}
              onCasesUpdated={setVaultCount}
            />

            <footer className="border-t border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md py-5 mt-auto">
              <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 px-4 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Rights Navigator is an educational &amp; navigational instrument and does not substitute formal legal counsel.
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Scale className="h-3.5 w-3.5 text-emerald-400" />
                  <span>India Legal Frameworks • 2026 Edition</span>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
