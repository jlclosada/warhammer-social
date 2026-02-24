import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Loader2, Tag, Edit3, Trash2, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CatalogPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFaction, setFilterFaction] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [factions, setFactions] = useState([]);
  const [tags, setTags] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    api.get('/collections/factions/').then((res) => {
      const data = res.data;
      setFactions(Array.isArray(data) ? data : data.results || []);
    });
    api.get('/collections/tags/').then((res) => {
      const data = res.data;
      setTags(Array.isArray(data) ? data : data.results || []);
    });
  }, []);

  const fetchCatalog = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterFaction) params.set('faction', filterFaction);
    if (filterTag) params.set('tag', filterTag);
    const url = `/collections/catalog/${params.toString() ? `?${params}` : ''}`;
    api.get(url)
      .then((res) => {
        const data = res.data;
        setItems(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setLoading(false));
  }, [search, filterFaction, filterTag]);

  useEffect(() => {
    const t = setTimeout(fetchCatalog, 300);
    return () => clearTimeout(t);
  }, [fetchCatalog]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this catalog entry?')) return;
    try {
      await api.delete(`/collections/catalog/${id}/`);
      toast.success('Deleted');
      fetchCatalog();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const refreshAll = () => {
    fetchCatalog();
    api.get('/collections/tags/').then((res) => {
      const data = res.data;
      setTags(Array.isArray(data) ? data : data.results || []);
    });
  };

  const clearFilters = () => { setSearch(''); setFilterFaction(''); setFilterTag(''); };
  const hasFilters = search || filterFaction || filterTag;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-1">Master Database</p>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">Catalog</h1>
          <p className="mt-1 text-[13px] text-text-secondary">{items.length} miniatures registered</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditItem(null); setShowAddModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(108,92,231,0.25)] active:scale-[0.97]"
          >
            <Plus size={15} /> Add Entry
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text" placeholder="Search by name, tag, faction..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/50 pl-9 pr-4 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary cursor-pointer hover:text-text-secondary"><X size={13} /></button>}
          </div>
          <div className="relative">
            <select value={filterFaction} onChange={(e) => setFilterFaction(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-surface-secondary/50 pl-3 pr-8 py-2.5 text-[13px] text-text-primary outline-none cursor-pointer transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10">
              <option value="">All Factions</option>
              {factions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          </div>
          {tags.length > 0 && (
            <div className="relative">
              <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
                className="appearance-none rounded-xl border border-border bg-surface-secondary/50 pl-3 pr-8 py-2.5 text-[13px] text-text-primary outline-none cursor-pointer transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10">
                <option value="">All Tags</option>
                {tags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>
          )}
          {hasFilters && <button onClick={clearFilters} className="rounded-xl border border-border px-3 py-2 text-[11px] font-medium text-text-tertiary cursor-pointer hover:text-text-secondary transition-all">Clear</button>}
        </div>
      </motion.div>

      {/* Grid of cards */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={24} className="animate-spin text-accent/50" /></div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col items-center justify-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <ImageIcon size={24} className="text-accent" strokeWidth={1.3} />
          </div>
          <h3 className="font-display text-base font-bold text-text-primary">{hasFilters ? 'No results found' : 'Catalog is empty'}</h3>
          <p className="mt-1.5 text-[13px] text-text-secondary">{hasFilters ? 'Try adjusting your filters.' : 'Add your first miniature to the master catalog.'}</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              >
                <div
                  className="group glass-card overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent/15 hover:shadow-[0_0_20px_rgba(108,92,231,0.04)]"
                  onClick={() => setViewItem(item)}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-3xl font-bold text-text-tertiary/30">{item.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    {item.unit_type && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="rounded-md bg-surface/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-secondary">{item.unit_type}</span>
                      </div>
                    )}
                    {item.default_points > 0 && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-md bg-accent/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-white">{item.default_points} pts</span>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={(e) => { e.stopPropagation(); setEditItem(item); setShowAddModal(true); }} className="rounded-lg bg-surface/80 backdrop-blur-sm p-1.5 text-text-secondary cursor-pointer transition-all hover:bg-accent/80 hover:text-white"><Edit3 size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="rounded-lg bg-surface/80 backdrop-blur-sm p-1.5 text-text-secondary cursor-pointer transition-all hover:bg-danger/80 hover:text-white"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3.5">
                    <h3 className="text-[13px] font-bold text-text-primary truncate group-hover:text-accent transition-colors">{item.name}</h3>
                    <p className="text-[10px] text-text-tertiary mt-0.5 truncate">{item.faction_name} · {item.game_system_name}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span key={tag.id}
                            className="rounded-md bg-accent/8 px-1.5 py-0.5 text-[8px] font-semibold text-accent/70 cursor-pointer transition-all hover:bg-accent/15 hover:text-accent"
                            onClick={(e) => { e.stopPropagation(); setFilterTag(tag.slug); setSearch(''); }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {item.tags.length > 4 && <span className="text-[8px] text-text-tertiary px-1">+{item.tags.length - 4}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewItem && (
          <CatalogViewModal item={viewItem} onClose={() => setViewItem(null)} />
        )}
      </AnimatePresence>

      {/* Admin: Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && isAdmin && (
          <CatalogFormModal item={editItem} factions={factions} onClose={() => { setShowAddModal(false); setEditItem(null); }} onSaved={refreshAll} />
        )}
      </AnimatePresence>
    </div>
  );
}


/* ====== Catalog View Modal (all users) ====== */
function CatalogViewModal({ item, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/70 backdrop-blur-xl cursor-pointer" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-hidden glass-card shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {item.image ? (
          <div className="relative h-56 bg-surface-secondary flex-shrink-0">
            <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
            <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer hover:bg-surface/80"><X size={14} /></button>
          </div>
        ) : (
          <div className="relative h-40 bg-gradient-to-br from-surface-secondary to-surface-tertiary flex items-center justify-center flex-shrink-0">
            <span className="font-display text-5xl font-bold text-text-tertiary/20">{item.name.slice(0, 2).toUpperCase()}</span>
            <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer hover:bg-surface/80"><X size={14} /></button>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-display text-xl font-bold text-text-primary">{item.name}</h2>
            {item.default_points > 0 && (
              <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-[12px] font-bold text-accent flex-shrink-0 ml-3">{item.default_points} pts</span>
            )}
          </div>
          {item.name_es && item.name_es !== item.name && (
            <p className="text-[12px] text-text-tertiary italic mb-2">{item.name_es}</p>
          )}
          <p className="text-[13px] text-text-secondary mb-4">{item.faction_name} · {item.game_system_name}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {item.unit_type && (
              <div className="rounded-lg bg-surface-secondary/50 border border-border p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-0.5">Unit Type</p>
                <p className="text-[14px] font-bold text-text-primary">{item.unit_type}</p>
              </div>
            )}
            <div className="rounded-lg bg-surface-secondary/50 border border-border p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-0.5">Points</p>
              <p className="text-[14px] font-bold text-text-primary">{item.default_points || '—'}</p>
            </div>
          </div>

          {item.description && (
            <div className="rounded-xl bg-surface-secondary/50 border border-border p-3 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-1">Description</p>
              <p className="text-[12px] text-text-secondary whitespace-pre-wrap leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                    <Tag size={9} /> {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <button onClick={onClose} className="w-full rounded-xl border border-border py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all hover:bg-surface-secondary hover:text-text-primary">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ====== Catalog Form Modal (admin only) ====== */
function CatalogFormModal({ item, factions, onClose, onSaved }) {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    faction: item?.faction || '', name: item?.name || '', name_es: item?.name_es || '',
    unit_type: item?.unit_type || '', default_points: item?.default_points || 0,
    description: item?.description || '', is_active: item?.is_active ?? true,
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState(item?.tags?.map((t) => t.name) || []);
  const [image, setImage] = useState(null);

  const addTag = (n) => { const t = n.trim(); if (t && !selectedTags.includes(t)) setSelectedTags((p) => [...p, t]); setTagInput(''); };
  const removeTag = (n) => setSelectedTags((p) => p.filter((t) => t !== n));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.faction) { toast.error('Name and faction are required'); return; }
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      selectedTags.forEach((t) => fd.append('tags', t));
      if (image) fd.append('image', image);

      if (isEdit) {
        await api.patch(`/collections/catalog/${item.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Updated!');
      } else {
        await api.post('/collections/catalog/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Created!');
      }
      onSaved(); onClose();
    } catch (err) {
      const detail = err.response?.data;
      toast.error(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed');
    }
    setSubmitting(false);
  };

  const ic = "w-full rounded-xl border border-border bg-surface-secondary/50 px-4 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10";
  const lc = "text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/60 backdrop-blur-md cursor-pointer" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto glass-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary mb-0.5">{isEdit ? 'Edit Entry' : 'Add to Catalog'}</h2>
          <p className="text-[12px] text-text-secondary mb-6">{isEdit ? 'Update this miniature.' : 'Register a new miniature in the master catalog.'}</p>

          <div className="space-y-4">
            <div>
              <label className={lc}>Faction *</label>
              <div className="relative">
                <select value={form.faction} onChange={(e) => setForm({ ...form, faction: e.target.value })} className={`${ic} pr-10 cursor-pointer appearance-none`}>
                  <option value="">Select faction</option>
                  {factions.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.game_system_name})</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
            </div>
            <div><label className={lc}>Name (English) *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahriman" className={ic} /></div>
            <div><label className={lc}>Name (Spanish)</label><input type="text" value={form.name_es} onChange={(e) => setForm({ ...form, name_es: e.target.value })} placeholder="e.g. Ahriman" className={ic} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Unit Type</label><input type="text" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} placeholder="HQ, Troops..." className={ic} /></div>
              <div><label className={lc}>Points</label><input type="number" min={0} value={form.default_points} onChange={(e) => setForm({ ...form, default_points: parseInt(e.target.value) || 0 })} className={ic} /></div>
            </div>
            <div><label className={lc}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional..." className={`${ic} resize-none`} /></div>
            <div>
              <label className={lc}>Image</label>
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 cursor-pointer hover:border-accent/30 transition-all duration-300">
                <Plus size={14} className="text-text-tertiary" />
                <span className="text-[12px] text-text-tertiary">{image ? image.name : (item?.image ? 'Change image' : 'Upload image')}</span>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            <div>
              <label className={lc}>Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                    {t} <button type="button" onClick={() => removeTag(t)} className="cursor-pointer hover:text-danger transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } if (e.key === ',' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); } }}
                  placeholder="Type tag + Enter..." className={`flex-1 ${ic} !px-3 !py-2 !text-[12px]`} />
                {tagInput.trim() && <button type="button" onClick={() => addTag(tagInput)} className="rounded-lg bg-accent/10 px-3 text-[11px] font-semibold text-accent cursor-pointer hover:bg-accent/20 transition-all">Add</button>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-7 pt-5 border-t border-border">
            <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-surface-secondary hover:text-text-primary">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.faction}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? 'Save' : 'Add Entry'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

