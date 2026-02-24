import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Game System', 'Faction', 'Details'];

const CATEGORY_LABELS = {
  imperium: 'Imperium', chaos: 'Chaos', xenos: 'Xenos',
  order: 'Order', destruction: 'Destruction', death: 'Death',
  good: 'Good', evil: 'Evil', neutral: 'Neutral',
};

const CATEGORY_COLORS = {
  imperium: 'border-blue-400/30 bg-blue-400/10 text-blue-400',
  chaos: 'border-red-400/30 bg-red-400/10 text-red-400',
  xenos: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
  order: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  destruction: 'border-orange-400/30 bg-orange-400/10 text-orange-400',
  death: 'border-purple-400/30 bg-purple-400/10 text-purple-400',
  good: 'border-sky-400/30 bg-sky-400/10 text-sky-400',
  evil: 'border-rose-400/30 bg-rose-400/10 text-rose-400',
  neutral: 'border-gray-400/30 bg-gray-400/10 text-gray-400',
};

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function NewCollectionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);

  // Data
  const [gameSystems, setGameSystems] = useState([]);
  const [factions, setFactions] = useState([]);
  const [loadingGs, setLoadingGs] = useState(true);
  const [loadingFactions, setLoadingFactions] = useState(false);

  // Selections
  const [selectedGs, setSelectedGs] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_public: true });

  // Load game systems
  useEffect(() => {
    api.get('/collections/game-systems/')
      .then((res) => {
        const data = res.data;
        setGameSystems(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => toast.error('Failed to load game systems'))
      .finally(() => setLoadingGs(false));
  }, []);

  // Load factions when game system changes
  useEffect(() => {
    if (!selectedGs) return;
    setLoadingFactions(true);
    setFactions([]);
    setSelectedCategory(null);
    setSelectedFaction(null);
    api.get(`/collections/factions/?game_system=${selectedGs.id}`)
      .then((res) => {
        const data = res.data;
        setFactions(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => toast.error('Failed to load factions'))
      .finally(() => setLoadingFactions(false));
  }, [selectedGs]);

  // Auto-set collection name
  useEffect(() => {
    if (selectedFaction && !form.name) {
      setForm((f) => ({ ...f, name: `My ${selectedFaction.name}` }));
    }
  }, [selectedFaction, form.name]);

  // Derived
  const categories = [...new Set(factions.map((f) => f.category))].sort();
  const filteredFactions = selectedCategory
    ? factions.filter((f) => f.category === selectedCategory)
    : factions;

  const canAdvance =
    (step === 0 && selectedGs) ||
    (step === 1 && selectedFaction) ||
    (step === 2 && form.name.trim());

  const next = () => { if (canAdvance) setStep((s) => Math.min(s + 1, 2)); };
  const prev = () => {
    if (step === 1) { setSelectedFaction(null); setSelectedCategory(null); }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleCreate = async () => {
    if (!selectedGs || !selectedFaction || !form.name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/collections/', {
        name: form.name.trim(),
        description: form.description,
        game_system: selectedGs.id,
        faction: selectedFaction.id,
        is_public: form.is_public,
      });
      toast.success('Collection created!');
      navigate(`/collections/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create collection';
      toast.error(msg);
    }
    setCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/collections')}
          className="flex items-center gap-1.5 text-[13px] text-text-tertiary cursor-pointer transition-colors hover:text-text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to collections
        </button>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">
          New Collection
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {STEPS[step]} — Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 rounded-full flex-1 ${i <= step ? 'bg-accent' : 'bg-border'}`}
            animate={{ opacity: i <= step ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Breadcrumb */}
      {(selectedGs || selectedFaction) && (
        <div className="flex items-center gap-2 mb-6 text-[12px] text-text-tertiary">
          {selectedGs && <span className="text-text-secondary font-medium">{selectedGs.name}</span>}
          {selectedFaction && (
            <>
              <span>→</span>
              <span className="text-text-secondary font-medium">{selectedFaction.name}</span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="glass-card p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...pageAnim}>
            {step === 0 && (
              <StepGameSystem
                gameSystems={gameSystems}
                loading={loadingGs}
                selected={selectedGs}
                onSelect={(gs) => { setSelectedGs(gs); setStep(1); }}
              />
            )}
            {step === 1 && (
              <StepFaction
                factions={filteredFactions}
                categories={categories}
                loading={loadingFactions}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selected={selectedFaction}
                onSelect={(f) => { setSelectedFaction(f); setStep(2); }}
              />
            )}
            {step === 2 && (
              <StepDetails form={form} setForm={setForm} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        {step > 0 && (
          <button
            onClick={prev}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-300 ease-out hover:bg-surface-secondary hover:text-text-primary"
          >
            <ArrowLeft size={13} /> Back
          </button>
        )}
        <div className="flex-1" />
        {step < 2 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Continue <ArrowRight size={13} className="opacity-60" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={creating || !form.name.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Create Collection
          </button>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━ Step 0: Game System ━━━━━━ */
function StepGameSystem({ gameSystems, loading, selected, onSelect }) {
  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-text-tertiary" /></div>;
  }
  return (
    <div>
      <p className="text-[13px] font-medium text-text-primary mb-4">
        Choose a game system for your collection
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {gameSystems.map((gs) => (
          <motion.button
            key={gs.id}
            onClick={() => onSelect(gs)}
            className={`flex flex-col items-start rounded-xl border p-4 text-left cursor-pointer transition-all duration-300 ease-out ${
              selected?.id === gs.id
                ? 'border-accent/40 bg-accent-soft shadow-[0_0_0_1px_rgba(108,92,231,0.1)]'
                : 'border-border bg-surface-secondary/30 hover:border-border hover:bg-surface-secondary'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <span className={`text-[14px] font-semibold ${selected?.id === gs.id ? 'text-accent' : 'text-text-primary'}`}>
              {gs.name}
            </span>
            <span className="text-[11px] text-text-tertiary mt-1 line-clamp-2">
              {gs.description}
            </span>
            {gs.faction_count > 0 && (
              <span className="text-[10px] text-text-tertiary mt-2">
                {gs.faction_count} factions
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━ Step 1: Faction ━━━━━━ */
function StepFaction({ factions, categories, loading, selectedCategory, onSelectCategory, selected, onSelect }) {
  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-text-tertiary" /></div>;
  }
  return (
    <div>
      <p className="text-[13px] font-medium text-text-primary mb-4">
        Choose a faction
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => onSelectCategory(null)}
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all duration-200 ${
            !selectedCategory
              ? 'border-accent/40 bg-accent-soft text-accent'
              : 'border-border text-text-tertiary hover:text-text-secondary'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all duration-200 ${
              selectedCategory === cat
                ? CATEGORY_COLORS[cat] || 'border-accent/40 bg-accent-soft text-accent'
                : 'border-border text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Faction grid */}
      <div className="grid gap-2 sm:grid-cols-2 max-h-[400px] overflow-y-auto pr-1">
        {factions.map((f) => (
          <motion.button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left cursor-pointer transition-all duration-300 ease-out ${
              selected?.id === f.id
                ? 'border-accent/40 bg-accent-soft shadow-[0_0_0_1px_rgba(108,92,231,0.1)]'
                : 'border-border bg-surface-secondary/30 hover:border-border hover:bg-surface-secondary'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-1 min-w-0">
              <span className={`text-[13px] font-semibold block ${selected?.id === f.id ? 'text-accent' : 'text-text-primary'}`}>
                {f.name}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${CATEGORY_COLORS[f.category]?.split(' ').pop() || 'text-text-tertiary'}`}>
                {CATEGORY_LABELS[f.category] || f.category}
              </span>
            </div>
            {selected?.id === f.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-accent"
              >
                <Check size={11} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━ Step 2: Details ━━━━━━ */
function StepDetails({ form, setForm }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] font-medium text-text-primary mb-2">
        Name your collection
      </p>

      <div>
        <input
          type="text"
          placeholder="Collection name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoFocus
          className="w-full rounded-xl border border-border bg-surface-secondary/50 px-4 py-3 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:border-accent/30 focus:bg-surface-secondary focus:ring-2 focus:ring-accent/10"
        />
      </div>

      <div>
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface-secondary/50 px-4 py-3 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:border-accent/30 focus:bg-surface-secondary focus:ring-2 focus:ring-accent/10"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_public}
          onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
        />
        <span className="text-[13px] text-text-secondary">
          Make this collection public
        </span>
      </label>
    </div>
  );
}
