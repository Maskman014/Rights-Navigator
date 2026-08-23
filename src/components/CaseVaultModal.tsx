import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FolderArchive,
  Search,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import type { FormState } from '../types';
import { Badge, Button } from './ui';

export interface SavedCase {
  id: string;
  createdAt: string;
  domain: string;
  state: string;
  district: string;
  incidentDate: string;
  status: 'supported' | 'partial' | 'unavailable';
  matchedStatutesCount: number;
  statutes: Array<{ title: string; statute: string; summary: string }>;
  formState: FormState;
  assessmentData: any;
  noticeDraft?: string;
}

interface CaseVaultModalProps {
  open: boolean;
  onClose: () => void;
  onLoadCase: (savedCase: SavedCase) => void;
  onCasesUpdated?: (count: number) => void;
}

export default function CaseVaultModal({
  open,
  onClose,
  onLoadCase,
  onCasesUpdated,
}: CaseVaultModalProps) {
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(Array.isArray(data) ? data : []);
        if (onCasesUpdated && Array.isArray(data)) {
          onCasesUpdated(data.length);
        }
      }
    } catch (e) {
      console.error('Error fetching cases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCases();
    }
  }, [open]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cases?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCases((prev) => {
          const next = prev.filter((c) => c.id !== id);
          if (onCasesUpdated) onCasesUpdated(next.length);
          return next;
        });
      }
    } catch (e) {
      console.error('Error deleting case:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.id.toLowerCase().includes(query) ||
      c.domain.toLowerCase().includes(query) ||
      c.state.toLowerCase().includes(query) ||
      c.district.toLowerCase().includes(query)
    );
  });

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-5 text-white">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md ring-2 ring-white/20">
                  <FolderArchive className="h-5.5 w-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Case Vault &amp; Database</h2>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-400/30 uppercase">
                      {cases.length} Saved Cases
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Access archived assessments, load previously evaluated dossiers, or export history.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cases by ID, domain, state, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="no-scrollbar overflow-y-auto p-6 space-y-3.5 max-h-[60vh]">
              {loading ? (
                <div className="py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-600 mb-2" />
                  <p className="text-xs font-medium">Loading saved cases from database...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <FolderArchive className="mx-auto mb-2.5 h-8 w-8 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800">No Case Dossiers Found</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {search
                      ? 'No cases matched your search query.'
                      : 'You have not saved any cases yet. Complete an assessment in Step 4 or 5 and click "Save to Vault" to archive it here.'}
                  </p>
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {c.id}
                        </span>
                        <Badge variant="emerald">{c.domain}</Badge>
                        <Badge
                          variant={
                            c.status === 'supported'
                              ? 'emerald'
                              : c.status === 'partial'
                              ? 'amber'
                              : 'red'
                          }
                          dot
                        >
                          {c.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {c.district ? `${c.district}, ` : ''}{c.state || 'Central'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {c.incidentDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {c.statutes && c.statutes.length > 0 && (
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                          Matched: {c.statutes.map((s) => s.title).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                        title="Delete case"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onLoadCase(c);
                          onClose();
                        }}
                      >
                        <span>Load Dossier</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5 text-xs text-slate-500">
              <span>Persistent JSON Database Active</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close Vault
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
