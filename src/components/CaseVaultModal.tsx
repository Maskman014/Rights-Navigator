import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderArchive, Search, Trash2, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import { Badge, Button } from './ui';

export default function CaseVaultModal({ open, onClose, onLoadCase, onCasesUpdated }: any) {
  const [cases, setCases] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      const localData = localStorage.getItem('rights_navigator_vault');
      const parsed = localData ? JSON.parse(localData) : [];
      setCases(parsed);
      if (onCasesUpdated) onCasesUpdated(parsed.length);
    }
  }, [open]);

  const handleDelete = (id: string) => {
    const updated = cases.filter((c) => c.id !== id);
    setCases(updated);
    localStorage.setItem('rights_navigator_vault', JSON.stringify(updated));
    if (onCasesUpdated) onCasesUpdated(updated.length);
  };

  const filtered = cases.filter(c => c.id?.toLowerCase().includes(search.toLowerCase()) || c.domain?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
          <motion.div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-3"><FolderArchive /><h2>Case Vault ({cases.length})</h2></div>
              <button onClick={onClose}><X /></button>
            </div>
            <div className="p-4 bg-slate-50"><input type="text" placeholder="Search..." onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border p-2" /></div>
            <div className="overflow-y-auto p-6 space-y-3 max-h-[60vh]">
              {filtered.length === 0 ? <p className="text-center p-8">No Saved Cases</p> : filtered.map(c => (
                <div key={c.id} className="flex justify-between rounded-xl border p-4 shadow-sm items-center">
                  <div>
                    <div className="flex gap-2 mb-2"><Badge>{c.id}</Badge><Badge variant="emerald">{c.domain || 'General'}</Badge></div>
                    <div className="text-xs text-slate-500 flex gap-4"><span><MapPin className="inline w-3 h-3"/> {c.state || 'Central'}</span><span><Calendar className="inline w-3 h-3"/> {c.incidentDate || 'Recent'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    <Button size="sm" onClick={() => { onLoadCase(c); onClose(); }}>Load Dossier</Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
