import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Loader2, Swords, Paintbrush, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const CATEGORY_COLORS = {
  imperium: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  chaos: 'bg-red-400/10 text-red-400 border-red-400/20',
  xenos: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  order: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  destruction: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  death: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  good: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  evil: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  neutral: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
};

export default function CollectionsPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-accent/50" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-1">Your Armies</p>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">
            Collections
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>
        <button
          onClick={() => navigate('/collections/new')}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(108,92,231,0.25)] active:scale-[0.97]"
        >
          <Plus size={15} />
          New Collection
        </button>
      </motion.div>

      {collections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center justify-center py-20"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <FolderOpen size={28} strokeWidth={1.3} className="text-accent" />
          </div>
          <h3 className="font-display text-lg font-bold text-text-primary">No collections yet</h3>
          <p className="mt-2 max-w-sm text-center text-[13px] text-text-secondary leading-relaxed">
            Create your first collection and start cataloging your miniatures.
          </p>
          <button
            onClick={() => navigate('/collections/new')}
            className="mt-7 flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(108,92,231,0.3)] active:scale-[0.97]"
          >
            <Plus size={16} />
            Create First Collection
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {collections.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link
                  to={`/collections/${c.id}`}
                  className="group glass-card block overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent/20 hover:shadow-[0_0_30px_rgba(108,92,231,0.06)]"
                >
                  {/* Cover / Banner Image */}
                  <div className="relative h-40 bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden">
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

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${CATEGORY_COLORS[c.faction_category] || CATEGORY_COLORS.neutral}`}>
                        {c.faction_category}
                      </span>
                    </div>

                    {/* Paint progress pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-surface/70 backdrop-blur-sm px-2 py-0.5">
                      <Paintbrush size={10} className="text-accent" />
                      <span className="text-[10px] font-bold text-text-primary">{c.paint_progress || 0}%</span>
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

                    {c.description && (
                      <p className="text-[11px] text-text-secondary mt-2 line-clamp-1">{c.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                      <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <Swords size={11} className="text-text-tertiary" />
                        <span className="font-semibold text-text-primary">{c.miniature_count}</span> minis
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        <span className="font-semibold text-text-primary">{c.total_points?.toLocaleString()}</span> pts
                      </span>
                      <div className="flex-1" />
                      {/* Progress ring */}
                      <div className="relative h-6 w-6">
                        <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-tertiary" />
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent" strokeDasharray={`${(c.paint_progress || 0) * 0.628} 62.8`} />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* New collection card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: collections.length * 0.04 }}
          >
            <button
              onClick={() => navigate('/collections/new')}
              className="flex h-full min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.03]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-3">
                <Plus size={20} className="text-accent" />
              </div>
              <span className="text-[13px] font-semibold text-text-secondary">New Collection</span>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

