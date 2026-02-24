import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Lock, Loader2, CheckCircle, Star,
  Paintbrush, FolderOpen, Users, Compass, Clock,
  Heart, MessageCircle, UserPlus, Globe, Target, Swords,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'painting', label: 'Painting' },
  { id: 'collecting', label: 'Collecting' },
  { id: 'social', label: 'Social' },
  { id: 'explorer', label: 'Explorer' },
];

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

const RARITY_STYLES = {
  common:    { border: 'border-zinc-500/20', bg: 'bg-zinc-500/5', text: 'text-zinc-400', glow: '', label: 'Common' },
  uncommon:  { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400', glow: '', label: 'Uncommon' },
  rare:      { border: 'border-blue-500/20', bg: 'bg-blue-500/5', text: 'text-blue-400', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.1)]', label: 'Rare' },
  epic:      { border: 'border-purple-500/20', bg: 'bg-purple-500/5', text: 'text-purple-400', glow: 'shadow-[0_0_16px_rgba(168,85,247,0.15)]', label: 'Epic' },
  legendary: { border: 'border-amber-500/25', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]', label: 'Legendary' },
};

const ICON_MAP = {
  'paintbrush': Paintbrush,
  'clock': Clock,
  'star': Star,
  'folder': FolderOpen,
  'swords': Swords,
  'target': Target,
  'globe': Globe,
  'heart': Heart,
  'message-circle': MessageCircle,
  'users': Users,
  'user-plus': UserPlus,
  'compass': Compass,
  'check-circle': CheckCircle,
  'trophy': Trophy,
};

export default function AchievementsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.get('/collections/social/achievements/')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load achievements'))
      .finally(() => setLoading(false));
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await api.post('/collections/social/achievements/check/');
      const newly = res.data.newly_unlocked || [];
      if (newly.length > 0) {
        newly.forEach((a) => toast.success(`🏆 ${a.name} unlocked!`));
        const fresh = await api.get('/collections/social/achievements/');
        setData(fresh.data);
      } else {
        toast('No new achievements yet', { icon: '🔍' });
      }
    } catch (e) {
      toast.error('Failed');
    }
    setChecking(false);
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 size={24} className="animate-spin text-accent/50" /></div>;
  }
  if (!data) return null;

  const achievements = data.achievements || [];
  const filtered = tab === 'all' ? achievements : achievements.filter((a) => a.category === tab);
  const sorted = [...filtered].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
  });

  const progressPct = data.total_count > 0 ? Math.round((data.unlocked_count / data.total_count) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-1">Progress</p>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">Achievements</h1>
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(108,92,231,0.25)] active:scale-[0.97] disabled:opacity-50"
          >
            {checking ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
            Check Progress
          </button>
        </div>
      </motion.div>

      {/* Stats card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 mb-6">
        <div className="flex items-center gap-6">
          {/* Progress ring */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="4" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-accent)" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[18px] font-bold text-text-primary">{progressPct}%</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-2xl font-bold text-text-primary">{data.unlocked_count}</span>
              <span className="text-[13px] text-text-tertiary">/ {data.total_count} unlocked</span>
            </div>
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={13} className="text-amber-400" fill="currentColor" />
              <span className="text-[14px] font-bold text-amber-400">{data.total_points}</span>
              <span className="text-[12px] text-text-tertiary">points earned</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface-secondary/50 border border-border">
        {CATEGORY_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 rounded-lg py-2 text-[12px] font-semibold cursor-pointer transition-all duration-300 ${
              tab === id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === id && (
              <motion.div
                layoutId="ach-tab"
                className="absolute inset-0 rounded-lg bg-surface-primary border border-border shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((ach, i) => (
            <AchievementCard key={ach.id} ach={ach} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}


function AchievementCard({ ach, index }) {
  const rarity = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
  const IconComp = ICON_MAP[ach.icon] || Trophy;
  const unlocked = ach.unlocked;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        unlocked
          ? `${rarity.border} ${rarity.bg} ${rarity.glow}`
          : 'border-border bg-surface-secondary/30 opacity-60'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
            unlocked ? `${rarity.bg} ${rarity.text}` : 'bg-surface-secondary text-text-tertiary'
          }`}>
            {unlocked ? <IconComp size={20} strokeWidth={1.5} /> : <Lock size={16} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-[13px] font-bold truncate ${unlocked ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {ach.name}
              </h3>
              <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${rarity.text} ${rarity.bg}`}>
                {rarity.label}
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${unlocked ? 'text-text-secondary' : 'text-text-tertiary'}`}>
              {ach.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star size={10} className={unlocked ? 'text-amber-400' : 'text-text-tertiary'} fill="currentColor" />
                <span className={`text-[10px] font-bold ${unlocked ? 'text-amber-400' : 'text-text-tertiary'}`}>{ach.points} pts</span>
              </div>
              {unlocked && ach.unlocked_at && (
                <span className="text-[9px] text-text-tertiary">
                  Unlocked {new Date(ach.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Check */}
          {unlocked && (
            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${rarity.bg}`}>
              <CheckCircle size={14} className={rarity.text} />
            </div>
          )}
        </div>
      </div>

      {/* Shine effect for unlocked */}
      {unlocked && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -inset-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent rotate-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      )}
    </motion.div>
  );
}

