import { useState } from 'react';
import { ShieldAlert, LogIn, UserPlus, Scale, ShieldCheck, FileText, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onLogin: (token: string, user: { id: string; username: string }) => void;
  onSkip?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
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
    // Removed solid bg-slate-50. Made text light for dark background.
    <div className="relative min-h-screen w-full text-slate-100">
      
      {/* Header Bar - Updated to dark glassmorphism */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Scale size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Rights Navigator
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAuth(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => openAuth(true)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & About Section */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-sm backdrop-blur-sm">
            <ShieldCheck size={14} className="text-emerald-400" /> Empowering Citizens with Verified Rights
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Understand Your Legal Stand. <br />
            <span className="text-emerald-500">Take Action with Confidence.</span>
          </h1>
          <p className="mt-6 text-base text-slate-300 sm:text-lg leading-relaxed font-normal">
            Rights Navigator bridges the gap between complex statutory codes and everyday civil disputes.
            Evaluate consumer claims, workplace rights, and tenant protections through zero-hallucination,
            deterministic legal matching.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={() => openAuth(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/50 transition-all hover:bg-emerald-500"
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Feature Cards - Updated to semi-transparent dark mode */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md transition-all hover:border-slate-600">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Legal Sources</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Matches fact patterns against explicitly verified statutory records across Consumer, Workplace, and Tenant domains.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md transition-all hover:border-slate-600">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Scale size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Engine</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Rules-based assessment guarantees that legal rights and procedural requirements are accurately evaluated without artificial hallucinations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md transition-all hover:border-slate-600">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Personal Case Vault</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Create an account or sign in to save your structured assessments and access procedural relief steps at any time.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal View - Updated to Dark Mode */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800"
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isRegistering ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {isRegistering
                    ? 'Sign up to access your personal case vault'
                    : 'Sign in to access your saved cases'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className={`rounded-lg p-3 text-sm font-medium ${error.includes('successful') ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-900/20"
                >
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {loading ? 'Please wait...' : isRegistering ? 'Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
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
