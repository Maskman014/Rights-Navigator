import { useState } from 'react';
import { ShieldAlert, LogIn, UserPlus, Scale, ShieldCheck, FileText, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onLogin: (token: string, user: { id: string; username: string }) => void;
  onSkip?: () => void;
}

export default function Login({ onLogin, onSkip }: LoginProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openAuth = (registerMode: boolean) => {
    setIsRegistering(registerMode);
    setError('');
    setShowAuthModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const action = isRegistering ? 'register' : 'login';
      const res = await fetch(`/api/auth?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isRegistering) {
        setIsRegistering(false);
        setError('Registration successful! Please sign in.');
      } else {
        onLogin(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Scale size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Rights Navigator
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAuth(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => openAuth(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & About Section */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={14} /> Empowering Citizens with Verified Rights
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Understand Your Legal Stand. <br />
            <span className="text-indigo-600">Take Action with Confidence.</span>
          </h1>
          <p className="mt-6 text-base text-slate-600 sm:text-lg leading-relaxed">
            Rights Navigator bridges the gap between complex statutory codes and everyday civil disputes.
            Evaluate consumer claims, workplace rights, and tenant protections through zero-hallucination,
            deterministic legal matching.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openAuth(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Continue as Guest
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Legal Sources</h3>
            <p className="mt-2 text-sm text-slate-600">
              Matches fact patterns against explicitly verified statutory records across Consumer, Workplace, and Tenant domains.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scale size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Deterministic Engine</h3>
            <p className="mt-2 text-sm text-slate-600">
              Rules-based assessment guarantees that legal rights and procedural requirements are accurately evaluated without artificial hallucinations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personal Case Vault</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create an account or sign in to save your structured assessments and access procedural relief steps at any time.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal View */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200"
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isRegistering ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isRegistering
                    ? 'Sign up to access your personal case vault'
                    : 'Sign in to access your saved cases'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className={`rounded-lg p-3 text-sm ${error.includes('successful') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {loading ? 'Please wait...' : isRegistering ? 'Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {isRegistering ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
