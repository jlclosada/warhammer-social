import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, User as UserIcon, UserPlus, UserCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UserSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/users/search/?q=${encodeURIComponent(query)}`);
        setResults(res.data || []);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFollow = async (userId, index) => {
    try {
      const res = await api.post(`/collections/social/follow/${userId}/`);
      setResults((prev) =>
        prev.map((u, i) => (i === index ? { ...u, is_following: res.data.following } : u))
      );
      toast.success(res.data.following ? 'Following!' : 'Unfollowed');
    } catch { toast.error('Failed'); }
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  // ESC key handler
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-surface-hover hover:text-text-primary"
      >
        <Search size={16} strokeWidth={1.8} />
        Search users
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4"
          >
            <motion.div
              className="absolute inset-0 bg-surface/60 backdrop-blur-md cursor-pointer"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative z-10 w-full max-w-md glass-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search size={16} className="text-text-tertiary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by username or name..."
                  className="flex-1 bg-transparent text-[14px] text-text-primary placeholder-text-tertiary outline-none cursor-text"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-text-tertiary cursor-pointer hover:text-text-secondary">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={18} className="animate-spin text-text-tertiary" />
                  </div>
                ) : query.length < 2 ? (
                  <div className="py-10 text-center">
                    <p className="text-[12px] text-text-tertiary">Type at least 2 characters to search</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-[13px] text-text-tertiary">No users found for "{query}"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:bg-surface-secondary/50"
                      >
                        {/* Avatar + name — clickable to navigate */}
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => { handleClose(); navigate(`/profile/${user.username}`); }}
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 ring-1 ring-accent/10 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <UserIcon size={16} className="text-accent-light" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-text-primary truncate hover:text-accent transition-colors">
                              {user.username}
                            </p>
                            <p className="text-[11px] text-text-tertiary truncate">
                              {user.first_name} {user.last_name}
                              {user.bio ? ` · ${user.bio}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Follow button */}
                        <button
                          onClick={() => handleFollow(user.id, i)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all duration-300 ${
                            user.is_following
                              ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20'
                              : 'bg-accent text-white hover:bg-accent-hover'
                          }`}
                        >
                          {user.is_following ? (
                            <><UserCheck size={12} /> Following</>
                          ) : (
                            <><UserPlus size={12} /> Follow</>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border flex justify-end">
                <button onClick={handleClose} className="text-[12px] text-text-tertiary cursor-pointer transition-colors hover:text-text-secondary">
                  Close <span className="text-[10px] ml-1 opacity-50">ESC</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

