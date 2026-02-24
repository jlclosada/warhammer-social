import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Loader2, Image as ImageIcon, Clock, Trash2,
  ChevronDown, Search, X, Tag, Eye, Globe, Lock,
  Heart, MessageCircle, Bookmark, Send, User as UserIcon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  unpainted: 'bg-gray-400/10 text-gray-400',
  assembled: 'bg-blue-400/10 text-blue-400',
  primed: 'bg-amber-400/10 text-amber-400',
  wip: 'bg-orange-400/10 text-orange-400',
  painted: 'bg-emerald-400/10 text-emerald-400',
  based: 'bg-teal-400/10 text-teal-400',
  display_ready: 'bg-purple-400/10 text-purple-400',
};

const PAINTED_STATUSES = ['painted', 'based', 'display_ready'];

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMiniature, setViewMiniature] = useState(null);
  const [viewTab, setViewTab] = useState('gallery'); // 'gallery' | 'list'

  const fetchCollection = useCallback(() => {
    api.get(`/collections/${id}/`)
      .then((res) => setCollection(res.data))
      .catch(() => { toast.error('Collection not found'); navigate('/collections'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  const handleDeleteMiniature = async (miniId) => {
    if (!confirm('Delete this miniature?')) return;
    try {
      await api.delete(`/collections/${id}/miniatures/${miniId}/`);
      toast.success('Deleted');
      fetchCollection();
    } catch { toast.error('Failed'); }
  };

  const handleTogglePublic = async (mini) => {
    try {
      await api.patch(`/collections/${id}/miniatures/${mini.id}/`, {
        is_public: !mini.is_public,
      });
      toast.success(mini.is_public ? 'Set to private' : 'Published to Explore!');
      fetchCollection();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 size={24} className="animate-spin text-text-tertiary" /></div>;
  if (!collection) return null;

  // Separate painted with images (gallery candidates) vs others
  const galleryMinis = collection.miniatures?.filter(
    (m) => PAINTED_STATUSES.includes(m.paint_status) && m.images?.length > 0
  ) || [];
  const listMinis = collection.miniatures?.filter(
    (m) => !PAINTED_STATUSES.includes(m.paint_status) || !m.images?.length
  ) || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/collections')} className="flex items-center gap-1.5 text-[13px] text-text-tertiary cursor-pointer transition-colors hover:text-text-primary mb-4">
          <ArrowLeft size={14} /> Back to collections
        </button>

        {/* Banner */}
        {(collection.banner_image || collection.cover_image) && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-surface-secondary">
            <img src={collection.banner_image || collection.cover_image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">{collection.name}</h1>
            <p className="mt-1 text-[14px] text-text-secondary">{collection.game_system_name} · {collection.faction_name}</p>
            {collection.description && <p className="mt-2 text-[13px] text-text-tertiary max-w-lg">{collection.description}</p>}
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(108,92,231,0.25)] active:scale-[0.97]">
            <Plus size={15} /> Add Miniature
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-5 py-3 border-t border-b border-border">
          <Stat label="Miniatures" value={collection.miniature_count} />
          <Stat label="Total Points" value={collection.total_points} />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary">{collection.paint_progress}%</span>
            <span className="text-[11px] text-text-tertiary">painted</span>
            <div className="h-1.5 w-20 rounded-full bg-surface-secondary overflow-hidden ml-1">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${collection.paint_progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Gallery of painted miniatures */}
      {galleryMinis.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="font-display text-[16px] font-bold text-text-primary mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-accent" /> Gallery
            <span className="text-[11px] font-normal text-text-tertiary ml-1">{galleryMinis.length} painted</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryMinis.map((mini, i) => {
              const primaryImg = mini.images?.find((img) => img.is_primary) || mini.images?.[0];
              return (
                <motion.div
                  key={mini.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-surface-secondary"
                  onClick={() => setViewMiniature(mini)}
                >
                  <img src={primaryImg?.image} alt={mini.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                    <h4 className="text-[12px] font-bold text-white truncate">{mini.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${STATUS_COLORS[mini.paint_status]}`}>{mini.paint_status_display}</span>
                      {mini.is_public && <Globe size={10} className="text-accent-light" />}
                    </div>
                  </div>
                  {/* Public indicator */}
                  {mini.is_public && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent/80 backdrop-blur-sm">
                      <Globe size={9} className="text-white" />
                    </div>
                  )}
                  {mini.images?.length > 1 && (
                    <div className="absolute top-2 left-2 rounded-md bg-surface/70 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-text-primary">
                      {mini.images.length}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All miniatures list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display text-[16px] font-bold text-text-primary mb-4">
          All Miniatures
          <span className="text-[11px] font-normal text-text-tertiary ml-2">{collection.miniatures?.length || 0} entries</span>
        </h2>

        {(!collection.miniatures || collection.miniatures.length === 0) ? (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <ImageIcon size={24} className="text-accent" strokeWidth={1.3} />
            </div>
            <h3 className="font-display text-[15px] font-bold text-text-primary">No miniatures yet</h3>
            <p className="mt-1 text-[13px] text-text-secondary">Add miniatures from the {collection.faction_name} catalog.</p>
            <button onClick={() => setShowAddModal(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover active:scale-[0.97]">
              <Plus size={15} /> Add Miniature
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {collection.miniatures.map((mini, i) => (
                <motion.div
                  key={mini.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group glass-card flex items-center gap-4 p-4 transition-all duration-300 hover:border-accent/15"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-14 w-14 flex-shrink-0 rounded-lg bg-surface-secondary overflow-hidden cursor-pointer"
                    onClick={() => mini.images?.length > 0 && setViewMiniature(mini)}
                  >
                    {mini.images?.[0] ? (
                      <img src={mini.images[0].image} alt={mini.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-tertiary"><ImageIcon size={18} strokeWidth={1.2} /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-text-primary truncate cursor-pointer hover:text-accent transition-colors" onClick={() => setViewMiniature(mini)}>{mini.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[mini.paint_status] || STATUS_COLORS.unpainted}`}>{mini.paint_status_display}</span>
                      {mini.is_public && <Globe size={11} className="text-accent/60" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-text-tertiary">
                      <span>×{mini.quantity}</span>
                      {mini.points_cost > 0 && <span>{mini.points_cost} pts</span>}
                      {mini.painting_hours > 0 && <span className="flex items-center gap-1"><Clock size={10} />{mini.painting_hours}h</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setViewMiniature(mini)} className="rounded-lg p-2 text-text-tertiary cursor-pointer transition-all hover:bg-surface-secondary hover:text-text-primary" title="View">
                      <Eye size={14} />
                    </button>
                    {PAINTED_STATUSES.includes(mini.paint_status) && mini.images?.length > 0 && (
                      <button onClick={() => handleTogglePublic(mini)} className={`rounded-lg p-2 cursor-pointer transition-all hover:bg-surface-secondary ${mini.is_public ? 'text-accent' : 'text-text-tertiary hover:text-text-primary'}`} title={mini.is_public ? 'Make private' : 'Publish'}>
                        {mini.is_public ? <Globe size={14} /> : <Lock size={14} />}
                      </button>
                    )}
                    <button onClick={() => handleDeleteMiniature(mini.id)} className="rounded-lg p-2 text-text-tertiary cursor-pointer transition-all hover:bg-surface-secondary hover:text-danger" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Add Miniature Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddMiniatureModal collectionId={id} factionId={collection.faction} onClose={() => setShowAddModal(false)} onAdded={fetchCollection} />
        )}
      </AnimatePresence>

      {/* View Miniature Modal */}
      <AnimatePresence>
        {viewMiniature && (
          <ViewMiniatureModal miniature={viewMiniature} collectionId={id} onClose={() => setViewMiniature(null)} onUpdated={fetchCollection} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span className="text-[15px] font-semibold text-text-primary">{value}</span>
      <span className="ml-1.5 text-[11px] text-text-tertiary">{label}</span>
    </div>
  );
}


/* ━━━━━━━━━ View Miniature Modal ━━━━━━━━━ */
function ViewMiniatureModal({ miniature, collectionId, onClose, onUpdated }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = miniature.images || [];

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  const handleTogglePublic = async () => {
    try {
      await api.patch(`/collections/${collectionId}/miniatures/${miniature.id}/`, {
        is_public: !miniature.is_public,
      });
      toast.success(miniature.is_public ? 'Set to private' : 'Published!');
      onUpdated();
      onClose();
    } catch { toast.error('Failed'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden glass-card shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image viewer */}
        {images.length > 0 ? (
          <div className="relative aspect-[4/3] bg-surface-secondary flex-shrink-0">
            <img src={images[currentImageIndex]?.image} alt={miniature.name} className="h-full w-full object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/80"><ChevronLeft size={16} /></button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/80"><ChevronRight size={16} /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full cursor-pointer transition-all ${idx === currentImageIndex ? 'w-5 bg-accent' : 'w-1.5 bg-text-tertiary/50 hover:bg-text-tertiary'}`} />
                  ))}
                </div>
              </>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/80"><X size={14} /></button>
          </div>
        ) : (
          <div className="relative h-40 bg-surface-secondary flex items-center justify-center flex-shrink-0">
            <ImageIcon size={40} className="text-text-tertiary/30" />
            <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/80"><X size={14} /></button>
          </div>
        )}

        {/* Details */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">{miniature.name}</h2>
              {miniature.catalog_miniature_name && miniature.catalog_miniature_name !== miniature.name && (
                <p className="text-[11px] text-text-tertiary mt-0.5">from: {miniature.catalog_miniature_name}</p>
              )}
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLORS[miniature.paint_status]}`}>
              {miniature.paint_status_display}
            </span>
          </div>

          {miniature.description && <p className="text-[13px] text-text-secondary mb-4">{miniature.description}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <DetailStat label="Quantity" value={`×${miniature.quantity}`} />
            <DetailStat label="Points" value={miniature.points_cost} />
            <DetailStat label="Hours Painted" value={miniature.painting_hours > 0 ? `${miniature.painting_hours}h` : '—'} />
            <DetailStat label="Status" value={miniature.is_public ? 'Public' : 'Private'} />
          </div>

          {miniature.notes && (
            <div className="rounded-xl bg-surface-secondary/50 border border-border p-3 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-1">Notes</p>
              <p className="text-[12px] text-text-secondary whitespace-pre-wrap">{miniature.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            {PAINTED_STATUSES.includes(miniature.paint_status) && images.length > 0 && (
              <button onClick={handleTogglePublic}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold cursor-pointer transition-all duration-300 ${
                  miniature.is_public
                    ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20'
                    : 'bg-surface-secondary text-text-secondary border border-border hover:text-text-primary'
                }`}>
                {miniature.is_public ? <><Globe size={13} /> Published</> : <><Lock size={13} /> Publish to Explore</>}
              </button>
            )}
            <div className="flex-1" />
            <button onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-[12px] font-medium text-text-secondary cursor-pointer transition-all hover:bg-surface-secondary">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-secondary/50 border border-border p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-0.5">{label}</p>
      <p className="text-[14px] font-bold text-text-primary">{value}</p>
    </div>
  );
}


/* ━━━━━━━━━ Add Miniature Modal ━━━━━━━━━ */
function AddMiniatureModal({ collectionId, factionId, onClose, onAdded }) {
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', quantity: 1, paint_status: 'unpainted',
    points_cost: 0, painting_hours: 0, notes: '', is_public: false,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    api.get(`/collections/catalog/?faction=${factionId}`)
      .then((res) => { const d = res.data; setCatalog(Array.isArray(d) ? d : d.results || []); })
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setLoadingCatalog(false));
  }, [factionId]);

  const unitTypes = [...new Set(catalog.map((m) => m.unit_type).filter(Boolean))].sort();
  const filteredCatalog = catalog.filter((m) => {
    if (filterType && m.unit_type !== filterType) return false;
    if (catalogSearch) {
      const q = catalogSearch.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.tags?.some((t) => t.name.toLowerCase().includes(q));
    }
    return true;
  });

  const selectFromCatalog = (item) => {
    setSelectedCatalog(item);
    setForm((f) => ({ ...f, name: item.name, points_cost: item.default_points }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSubmitting(true);
    const fd = new FormData();
    if (selectedCatalog) fd.append('catalog_miniature', selectedCatalog.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach((img) => fd.append('images', img));
    try {
      await api.post(`/collections/${collectionId}/miniatures/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Miniature added!');
      onAdded(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.catalog_miniature?.[0] || 'Failed');
    }
    setSubmitting(false);
  };

  const ic = "w-full rounded-xl border border-border bg-surface-secondary/50 px-4 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/60 backdrop-blur-md cursor-pointer" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto glass-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary mb-1">Add Miniature</h2>
          <p className="text-[13px] text-text-secondary mb-5">Select from catalog or enter manually.</p>

          {/* Catalog browser */}
          {!selectedCatalog ? (
            <div className="mb-5">
              <p className="text-[12px] font-medium text-text-primary mb-3">Select from catalog</p>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type="text" placeholder="Search name or tag..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary/50 pl-8 pr-8 py-2 text-[12px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10" />
                {catalogSearch && <button onClick={() => setCatalogSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary cursor-pointer hover:text-text-secondary"><X size={12} /></button>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button onClick={() => setFilterType(null)} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${!filterType ? 'border-accent/40 bg-accent-soft text-accent' : 'border-border text-text-tertiary hover:text-text-secondary'}`}>All</button>
                {unitTypes.map((t) => (
                  <button key={t} onClick={() => setFilterType(t)} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${filterType === t ? 'border-accent/40 bg-accent-soft text-accent' : 'border-border text-text-tertiary hover:text-text-secondary'}`}>{t}</button>
                ))}
              </div>

              {loadingCatalog ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-text-tertiary" /></div>
              ) : filteredCatalog.length === 0 ? (
                <p className="text-center text-[12px] text-text-tertiary py-6">No results</p>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                  {filteredCatalog.map((item) => (
                    <button key={item.id} onClick={() => selectFromCatalog(item)}
                      className="w-full flex flex-col rounded-lg border border-border px-3 py-2.5 text-left cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:border-accent/15">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-text-primary">{item.name}</span>
                          {item.unit_type && <span className="text-[10px] text-text-tertiary uppercase">{item.unit_type}</span>}
                        </div>
                        {item.default_points > 0 && <span className="text-[11px] text-text-tertiary flex-shrink-0 ml-2">{item.default_points} pts</span>}
                      </div>
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 5).map((tag) => (
                            <span key={tag.id} className="inline-flex items-center gap-0.5 rounded-full bg-surface-secondary px-1.5 py-0.5 text-[9px] font-medium text-text-tertiary">
                              <Tag size={7} /> {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between rounded-lg bg-accent-soft px-3.5 py-2.5">
              <div>
                <span className="text-[13px] font-medium text-accent">{selectedCatalog.name}</span>
                {selectedCatalog.unit_type && <span className="ml-2 text-[10px] text-text-tertiary uppercase">{selectedCatalog.unit_type}</span>}
              </div>
              <button onClick={() => { setSelectedCatalog(null); setForm((f) => ({ ...f, name: '', points_cost: 0 })); }} className="text-[11px] text-accent cursor-pointer hover:text-accent-hover font-medium">Change</button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <input type="text" placeholder="Miniature name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={ic} />
            <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${ic} resize-none`} />

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1 block">Quantity</label>
                <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} className={ic} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1 block">Points</label>
                <input type="number" min={0} value={form.points_cost} onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })} className={ic} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1 block">Hours</label>
                <input type="number" min={0} step={0.5} value={form.painting_hours} onChange={(e) => setForm({ ...form, painting_hours: parseFloat(e.target.value) || 0 })} className={ic} />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1 block">Paint status</label>
              <div className="relative">
                <select value={form.paint_status} onChange={(e) => setForm({ ...form, paint_status: e.target.value })}
                  className={`${ic} pr-10 cursor-pointer appearance-none`}>
                  <option value="unpainted">Unpainted</option>
                  <option value="assembled">Assembled</option>
                  <option value="primed">Primed</option>
                  <option value="wip">Work in Progress</option>
                  <option value="painted">Painted</option>
                  <option value="based">Based</option>
                  <option value="display_ready">Display Ready</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-2 block">Photos</label>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden ring-1 ring-border group">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><X size={14} className="text-white" /></button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-text-tertiary transition-all hover:border-accent/30 hover:text-accent">
                  <Plus size={18} />
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${ic} resize-none`} />

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                disabled={!PAINTED_STATUSES.includes(form.paint_status)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer disabled:opacity-30" />
              <div>
                <span className="text-[13px] text-text-secondary">Share publicly in Explore</span>
                {!PAINTED_STATUSES.includes(form.paint_status) && <p className="text-[10px] text-text-tertiary">Only painted miniatures can be shared</p>}
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
            <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all hover:bg-surface-secondary hover:text-text-primary">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all hover:bg-accent-hover hover:shadow-[0_0_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add to Collection
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

