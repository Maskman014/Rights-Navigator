import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, Sparkles } from "lucide-react";
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

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const fetchVaultCount = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/cases", {
        headers: { Authorization: `Bearer ${token}` }
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

  const goToStep = useCallback((target: number) => {
    if (target >= 4 && !form.confirmed) return;
    setStep(target);
    setMaxStep((prev) => Math.max(prev, target));
  }, [form.confirmed]);

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

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-gradient-to-tr from-indigo-300/25 via-blue-200/20 to-teal-200/20 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[450px] w-[600px] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <Header onOpenVault={() => setVaultOpen(true)} vaultCount={vaultCount} />
      <Stepper currentStep={step} maxStep={maxStep} onStepClick={goToStep} />

      <main className="flex-1 px-4 pb-16">
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
      </main>

      <CaseVaultModal
        open={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onLoadCase={handleLoadCase}
        onCasesUpdated={setVaultCount}
      />

      <footer className="border-t border-slate-200/80 bg-white/80 py-5 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 px-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Rights Navigator is an educational &amp; navigational instrument and does not substitute formal legal counsel.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Scale className="h-3.5 w-3.5 text-indigo-500" />
            <span>India Legal Frameworks • 2026 Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
