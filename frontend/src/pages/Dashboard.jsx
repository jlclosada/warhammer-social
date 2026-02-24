import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Loader2, Swords, Paintbrush, TrendingUp, Layers, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/collections/')
      .then((res) => {
        const data = res.data;
        setCollections(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const totalMinis = collections.reduce((s, c) => s + (c.miniature_count || 0), 0);
  const totalPoints = collections.reduce((s, c) => s + (c.total_points || 0), 0);
  const avgPainted = collections.length
    ? Math.round(collections.reduce((s, c) => s + (c.paint_progress || 0), 0) / collections.length)
    : 0;

  const stats = [
    { icon: Layers, label: 'Collections', value: collections.length, color: 'from-accent/20 to-accent-light/10' },
    { icon: Swords, label: 'Miniatures', value: totalMinis, color: 'from-emerald-500/20 to-emerald-400/10' },
    { icon: TrendingUp, label: 'Total Points', value: totalPoints.toLocaleString(), color: 'from-amber-500/20 to-amber-400/10' },
    { icon: Paintbrush, label: 'Painted', value: `${avgPainted}%`, color: 'from-rose-500/20 to-rose-400/10' },
  ];

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent mb-2">
          Command Center
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] gradient-text">
          {user?.first_name || user?.username}'s Arsenal
        </h1>
        <p className="mt-2 text-[14px] text-text-secondary max-w-lg">
          Manage your collections, track your painting progress, and showcase your work.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10"
      >
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="stat-glow glass-card p-4 group cursor-default"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
              <Icon size={17} className="text-text-primary" strokeWidth={1.6} />
            </div>
            <p className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">{value}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Collections */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[17px] font-bold tracking-[-0.01em] text-text-primary">
            Your Collections
          </h2>
          <Link
            to="/collections"
            className="text-[12px] font-semibold text-accent cursor-pointer transition-all duration-200 hover:text-accent-light"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={22} className="animate-spin text-text-tertiary" />
          </div>
        ) : collections.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <FolderOpen size={28} strokeWidth={1.3} className="text-accent" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">No collections yet</h3>
            <p className="mt-2 max-w-sm text-center text-[13px] text-text-secondary leading-relaxed">
              Create your first collection to start cataloging your miniatures.
            </p>
            <button
              onClick={() => navigate('/collections/new')}
              className="mt-7 flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(108,92,231,0.3)] active:scale-[0.97]"
            >
              <Plus size={16} />
              Create First Collection
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <Link
                  to={`/collections/${c.id}`}
                  className="group glass-card block overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent/20 hover:shadow-[0_0_30px_rgba(108,92,231,0.06)]"
                >
                  {/* Cover / Banner */}
                  <div className="relative h-36 bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden">
                    {c.banner_image || c.cover_image ? (
                      <img
                        src={c.banner_image || c.cover_image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-primary/50 backdrop-blur-sm">
                          <ImageIcon size={24} className="text-text-tertiary" strokeWidth={1.2} />
                        </div>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

                    {/* Faction badge */}
                    <div className="absolute top-3 right-3">
                      <span className="rounded-md bg-surface/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                        {c.faction_category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display text-[15px] font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-text-tertiary mt-0.5 truncate">
                      {c.game_system_name} · {c.faction_name}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Swords size={11} className="text-text-tertiary" />
                        <span className="font-semibold text-text-primary">{c.miniature_count}</span>
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        <span className="font-semibold text-text-primary">{c.total_points}</span> pts
                      </span>
                      <div className="flex-1" />
                      {/* Progress ring */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative h-5 w-5">
                          <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-tertiary" />
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent" strokeDasharray={`${(c.paint_progress || 0) * 0.502} 50.2`} />
                          </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-text-tertiary">{c.paint_progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* New collection card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + collections.length * 0.04 }}
            >
              <button
                onClick={() => navigate('/collections/new')}
                className="flex h-full min-h-[200px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.03]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-3">
                  <Plus size={20} className="text-accent" />
                </div>
                <span className="text-[13px] font-semibold text-text-secondary">New Collection</span>
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

