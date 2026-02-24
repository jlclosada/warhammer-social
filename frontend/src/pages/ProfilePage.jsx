import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, User as UserIcon, UserPlus, UserCheck, Users,
  Image as ImageIcon, FolderOpen, Paintbrush, Swords,
  Heart, MessageCircle, Bookmark,
  ChevronLeft, ChevronRight, X, Calendar, Trophy, Star, Lock, CheckCircle,
  Edit3, Camera, Save as SaveIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const PROFILE_TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'collections', label: 'Collections' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
];

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const { user: currentUser } = useAuthStore();
  const username = paramUsername || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [viewPost, setViewPost] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await api.get(`/collections/social/profile/${username}/`);
      setProfile(res.data);
    } catch (e) {
      toast.error('Profile not found');
    }
    setLoading(false);
  }, [username]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Fetch achievements when tab switches
  useEffect(() => {
    if (tab === 'achievements' && !achievements) {
      api.get('/collections/social/achievements/')
        .then((res) => setAchievements(res.data))
        .catch(() => {});
    }
  }, [tab, achievements]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const res = await api.post(`/collections/social/follow/${profile.id}/`);
      setProfile((p) => ({
        ...p,
        is_following: res.data.following,
        follower_count: res.data.following ? p.follower_count + 1 : p.follower_count - 1,
      }));
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 size={24} className="animate-spin text-accent/50" /></div>;
  }
  if (!profile) return null;

  const isSelf = profile.is_self;
  const posts = profile.posts || [];
  const collections = profile.collections || [];
  const followers = profile.followers || [];
  const followingList = profile.following_list || [];
  const joinDate = profile.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden mb-8"
      >
        {/* Banner gradient */}
        <div className="h-28 bg-gradient-to-br from-accent/20 via-accent-light/10 to-surface-secondary relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.15),transparent_60%)]" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          {/* Avatar */}
          <div className="flex items-end gap-5 mb-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/20 ring-4 ring-surface-card overflow-hidden flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon size={36} className="text-accent-light" />
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-text-primary">
                {profile.username}
              </h1>
              <p className="text-[13px] text-text-secondary">
                {profile.first_name} {profile.last_name}
              </p>
            </div>

            {!isSelf && (
              <button
                onClick={handleFollow}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold cursor-pointer transition-all duration-300 ${
                  profile.is_following
                    ? 'bg-surface-secondary text-text-secondary border border-border hover:text-red-400 hover:border-red-400/20'
                    : 'bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(108,92,231,0.25)]'
                } active:scale-[0.97]`}
              >
                {profile.is_following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
              </button>
            )}
            {isSelf && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-text-secondary cursor-pointer transition-all duration-300 hover:bg-surface-secondary hover:text-text-primary active:scale-[0.97]"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-[13px] text-text-secondary leading-relaxed mb-4 max-w-lg">{profile.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-6">
            <button onClick={() => setTab('posts')} className="text-center cursor-pointer group">
              <p className="text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors">{profile.post_count || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Posts</p>
            </button>
            <button onClick={() => setTab('collections')} className="text-center cursor-pointer group">
              <p className="text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors">{profile.collection_count || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Collections</p>
            </button>
            <button onClick={() => setTab('followers')} className="text-center cursor-pointer group">
              <p className="text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors">{profile.follower_count || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Followers</p>
            </button>
            <button onClick={() => setTab('following')} className="text-center cursor-pointer group">
              <p className="text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors">{profile.following_count || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Following</p>
            </button>
            <div className="flex-1" />
            {joinDate && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <Calendar size={11} /> Joined {joinDate}
              </div>
            )}
          </div>

          {/* Self stats */}
          {isSelf && profile.total_miniatures != null && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <Swords size={12} className="text-text-tertiary" />
                <span className="font-semibold text-text-primary">{profile.total_miniatures}</span> miniatures
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <Paintbrush size={12} className="text-text-tertiary" />
                <span className="font-semibold text-text-primary">{profile.total_painted}</span> painted
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface-secondary/50 border border-border">
        {PROFILE_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 rounded-lg py-2 text-[12px] font-semibold cursor-pointer transition-all duration-300 ${
              tab === id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === id && (
              <motion.div
                layoutId="profile-tab"
                className="absolute inset-0 rounded-lg bg-surface-primary border border-border shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'posts' && (
          <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {posts.length === 0 ? (
              <EmptyState icon={ImageIcon} title="No posts yet" desc={isSelf ? 'Publish your painted miniatures to share them here.' : 'This user has no public posts.'} />
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {posts.map((post, i) => {
                  const img = post.images?.find((im) => im.is_primary) || post.images?.[0];
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-surface-secondary"
                      onClick={() => setViewPost(post)}
                    >
                      {img ? (
                        <img src={img.image} alt={post.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><ImageIcon size={20} className="text-text-tertiary/30" /></div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold">
                          <Heart size={14} fill="white" /> {post.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold">
                          <MessageCircle size={14} fill="white" /> {post.comment_count || 0}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'collections' && (
          <motion.div key="collections" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {collections.length === 0 ? (
              <EmptyState icon={FolderOpen} title="No collections" desc={isSelf ? 'Create your first collection to get started.' : 'This user has no public collections.'} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {collections.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={isSelf ? `/collections/${c.id}` : '#'}
                      className="group glass-card block overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent/20"
                    >
                      <div className="relative h-32 bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden">
                        {c.banner_image || c.cover_image ? (
                          <img src={c.banner_image || c.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ImageIcon size={20} className="text-text-tertiary/30" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-[14px] font-bold text-text-primary truncate group-hover:text-accent transition-colors">{c.name}</h3>
                        <p className="text-[11px] text-text-tertiary mt-0.5">{c.game_system_name} · {c.faction_name}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
                          <span><span className="font-semibold text-text-primary">{c.miniature_count}</span> minis</span>
                          <span><span className="font-semibold text-text-primary">{c.paint_progress || 0}%</span> painted</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!achievements ? (
              <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-accent/50" /></div>
            ) : (
              <ProfileAchievements data={achievements} />
            )}
          </motion.div>
        )}

        {tab === 'followers' && (
          <motion.div key="followers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {followers.length === 0 ? (
              <EmptyState icon={Users} title="No followers yet" desc="Followers will appear here." />
            ) : (
              <UserList users={followers} />
            )}
          </motion.div>
        )}

        {tab === 'following' && (
          <motion.div key="following" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {followingList.length === 0 ? (
              <EmptyState icon={Users} title="Not following anyone" desc={isSelf ? 'Search for users to follow.' : 'This user isn\'t following anyone.'} />
            ) : (
              <UserList users={followingList} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post detail modal */}
      <AnimatePresence>
        {viewPost && (
          <PostDetailModal post={viewPost} onClose={() => setViewPost(null)} />
        )}
      </AnimatePresence>

      {/* Edit profile modal */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditProfile(false)}
            onSaved={(updated) => {
              setProfile((p) => ({ ...p, ...updated }));
              setShowEditProfile(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
        <Icon size={24} className="text-accent" strokeWidth={1.3} />
      </div>
      <h3 className="font-display text-[15px] font-bold text-text-primary">{title}</h3>
      <p className="mt-1.5 text-[13px] text-text-secondary text-center max-w-sm">{desc}</p>
    </div>
  );
}


function UserList({ users }) {
  return (
    <div className="space-y-1">
      {users.map((u, i) => (
        <motion.div
          key={u.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.02 }}
        >
          <Link
            to={`/profile/${u.username}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-surface-secondary/50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 ring-1 ring-accent/10 overflow-hidden">
              {u.avatar ? (
                <img src={u.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon size={16} className="text-accent-light" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary hover:text-accent transition-colors">{u.username}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}


/* ━━━━━━━━━ Profile Achievements ━━━━━━━━━ */
const RARITY_STYLES = {
  common:    { border: 'border-zinc-500/20', bg: 'bg-zinc-500/5', text: 'text-zinc-400', label: 'Common' },
  uncommon:  { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400', label: 'Uncommon' },
  rare:      { border: 'border-blue-500/20', bg: 'bg-blue-500/5', text: 'text-blue-400', label: 'Rare' },
  epic:      { border: 'border-purple-500/20', bg: 'bg-purple-500/5', text: 'text-purple-400', label: 'Epic' },
  legendary: { border: 'border-amber-500/25', bg: 'bg-amber-500/5', text: 'text-amber-400', label: 'Legendary' },
};

function ProfileAchievements({ data }) {
  const achs = data.achievements || [];
  const unlocked = achs.filter((a) => a.unlocked);
  const locked = achs.filter((a) => !a.unlocked);

  return (
    <div>
      {/* Summary */}
      <div className="glass-card p-5 mb-5 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-amber-400" fill="currentColor" />
          <span className="font-display text-lg font-bold text-amber-400">{data.total_points}</span>
          <span className="text-[12px] text-text-tertiary">points</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="text-[13px] text-text-secondary">
          <span className="font-bold text-text-primary">{data.unlocked_count}</span> / {data.total_count} unlocked
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-3">Unlocked</p>
          <div className="grid gap-2 sm:grid-cols-2 mb-6">
            {unlocked.map((ach, i) => {
              const r = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
              return (
                <motion.div key={ach.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${r.border} ${r.bg}`}>
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${r.bg} ${r.text}`}>
                    <Trophy size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-bold text-text-primary truncate">{ach.name}</p>
                      <span className={`rounded px-1 py-px text-[7px] font-bold uppercase ${r.text} ${r.bg}`}>{r.label}</span>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate">{ach.description}</p>
                  </div>
                  <CheckCircle size={14} className={r.text} />
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-3">Locked</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {locked.map((ach, i) => (
              <div key={ach.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary/20 p-3 opacity-50">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-text-tertiary">
                  <Lock size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-text-tertiary truncate">{ach.name}</p>
                  <p className="text-[10px] text-text-tertiary truncate">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {achs.length === 0 && (
        <EmptyState icon={Trophy} title="No achievements" desc="Achievements will appear here as you progress." />
      )}
    </div>
  );
}


/* ━━━━━━━━━ Edit Profile Modal ━━━━━━━━━ */
function EditProfileModal({ profile, onClose, onSaved }) {
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({
    username: profile.username || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await api.patch('/auth/me/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Update the auth store with new user data
      setUser(res.data);
      toast.success('Profile updated!');
      onSaved({
        username: res.data.username,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        bio: res.data.bio,
        avatar: res.data.avatar,
      });
    } catch (err) {
      const detail = err.response?.data;
      toast.error(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed to update');
    }
    setSaving(false);
  };

  const ic = "w-full rounded-xl border border-border bg-surface-secondary/50 px-4 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 focus:border-accent/30 focus:ring-2 focus:ring-accent/10";
  const lc = "text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/70 backdrop-blur-xl cursor-pointer" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-md glass-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">Edit Profile</h2>
              <p className="text-[12px] text-text-secondary mt-0.5">Customize your public profile</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-tertiary cursor-pointer hover:text-text-primary hover:bg-surface-secondary transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <label className="relative group cursor-pointer">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/20 ring-4 ring-surface-card overflow-hidden transition-all group-hover:ring-accent/20">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={36} className="text-accent-light" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Camera size={20} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className={lc}>Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={ic} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>First Name</label>
                <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" className={ic} />
              </div>
              <div>
                <label className={lc}>Last Name</label>
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" className={ic} />
              </div>
            </div>
            <div>
              <label className={lc}>Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell the community about yourself..." maxLength={500} className={`${ic} resize-none`} />
              <p className="text-[10px] text-text-tertiary mt-1 text-right">{form.bio.length}/500</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
            <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-surface-secondary hover:text-text-primary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !form.username.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-bold text-white cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <SaveIcon size={14} />}
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ━━━━━━━━━ Post Detail Modal ━━━━━━━━━ */
function PostDetailModal({ post, onClose }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(post.is_saved);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const images = post.images || [];
  const nextImage = () => setCurrentImage((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + images.length) % images.length);

  const handleLike = async () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
    try {
      const res = await api.post(`/collections/social/like/${post.id}/`);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {
      setLiked(post.is_liked);
      setLikeCount(post.like_count || 0);
    }
  };

  const handleSave = async () => {
    setSaved((p) => !p);
    try {
      const res = await api.post(`/collections/social/save/${post.id}/`);
      setSaved(res.data.saved);
    } catch { setSaved(post.is_saved); }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/collections/social/comments/${post.id}/`);
      setComments(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch { /* */ }
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await api.post(`/collections/social/comments/${post.id}/`, { text: commentText.trim() });
      setCommentText('');
      loadComments();
    } catch { toast.error('Failed'); }
    setCommenting(false);
  };

  useEffect(() => { loadComments(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-surface/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden glass-card shadow-2xl flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image side */}
        {images.length > 0 && (
          <div className="relative bg-surface-secondary lg:w-[55%] flex-shrink-0">
            <div className="aspect-square lg:h-full">
              <img src={images[currentImage]?.image} alt={post.name} className="h-full w-full object-contain" />
            </div>
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer hover:bg-surface/80"><ChevronLeft size={14} /></button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm text-text-primary cursor-pointer hover:bg-surface/80"><ChevronRight size={14} /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImage ? 'w-4 bg-accent' : 'w-1.5 bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Info side */}
        <div className="flex flex-col flex-1 min-w-0 max-h-[90vh] lg:max-h-none">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 ring-1 ring-accent/10 overflow-hidden">
              {post.owner_avatar ? <img src={post.owner_avatar} alt="" className="h-full w-full object-cover" /> : <UserIcon size={12} className="text-accent-light" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${post.owner_username}`} className="text-[13px] font-semibold text-text-primary hover:text-accent transition-colors">{post.owner_username}</Link>
              <p className="text-[10px] text-text-tertiary">{post.faction_name} · {post.game_system_name}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-tertiary cursor-pointer hover:text-text-primary"><X size={16} /></button>
          </div>

          {/* Comments area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Post caption */}
            <div className="mb-4">
              <p className="text-[13px]">
                <span className="font-bold text-text-primary">{post.owner_username}</span>{' '}
                <span className="text-text-secondary">{post.name}</span>
              </p>
              {post.description && <p className="text-[12px] text-text-secondary mt-1">{post.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary">
                <span>{post.paint_status_display}</span>
                {post.points_cost > 0 && <span>{post.points_cost} pts</span>}
                {post.painting_hours > 0 && <span>{post.painting_hours}h</span>}
              </div>
            </div>

            {/* Comments */}
            {loadingComments ? (
              <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-text-tertiary" /></div>
            ) : comments.length === 0 ? (
              <p className="text-[12px] text-text-tertiary text-center py-6">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <ProfileCommentItem key={c.id} comment={c} onUpdate={(updated) => setComments((prev) => prev.map((x) => x.id === updated.id ? updated : x))} />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border px-5 py-3 flex-shrink-0">
            <div className="flex items-center gap-4 mb-2">
              <button onClick={handleLike} className={`cursor-pointer transition-all duration-200 active:scale-75 ${liked ? 'text-red-400' : 'text-text-tertiary hover:text-text-secondary'}`}>
                <Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
              <button className="text-text-tertiary cursor-pointer hover:text-text-secondary" onClick={() => document.getElementById('post-comment-input')?.focus()}>
                <MessageCircle size={22} strokeWidth={1.5} />
              </button>
              <div className="flex-1" />
              <button onClick={handleSave} className={`cursor-pointer transition-all duration-200 active:scale-75 ${saved ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}>
                <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            </div>
            {likeCount > 0 && <p className="text-[12px] font-bold text-text-primary mb-2">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>}

            {/* Comment input */}
            <div className="flex items-center gap-2">
              <input id="post-comment-input" type="text" placeholder="Add a comment..." value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text" />
              <button onClick={submitComment} disabled={commenting || !commentText.trim()}
                className="text-[13px] font-semibold text-accent cursor-pointer transition-all hover:text-accent-light disabled:opacity-30 disabled:cursor-not-allowed">
                {commenting ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ━━━━━━━━━ Comment with Like (Profile) ━━━━━━━━━ */
function ProfileCommentItem({ comment, onUpdate }) {
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);

  const handleLike = async () => {
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!prev);
    setLikeCount(prev ? prevCount - 1 : prevCount + 1);
    try {
      const res = await api.post(`/collections/social/comment-like/${comment.id}/`);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
      onUpdate({ ...comment, is_liked: res.data.liked, like_count: res.data.count });
    } catch {
      setLiked(prev);
      setLikeCount(prevCount);
    }
  };

  return (
    <div className="flex gap-2.5 group/comment">
      <Link to={`/profile/${comment.username}`} className="flex-shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-secondary ring-1 ring-border overflow-hidden cursor-pointer">
          {comment.avatar ? <img src={comment.avatar} alt="" className="h-full w-full object-cover" /> : <UserIcon size={11} className="text-text-tertiary" />}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-relaxed">
          <Link to={`/profile/${comment.username}`} className="font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer">{comment.username}</Link>{' '}
          <span className="text-text-secondary">{comment.text}</span>
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[9px] text-text-tertiary">{formatTimeAgo(comment.created_at)}</span>
          {likeCount > 0 && <span className="text-[9px] font-semibold text-text-tertiary">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
          <button onClick={handleLike} className={`text-[9px] font-semibold cursor-pointer transition-colors ${liked ? 'text-red-400' : 'text-text-tertiary hover:text-text-secondary'}`}>
            {liked ? 'Unlike' : 'Like'}
          </button>
        </div>
      </div>
      <button onClick={handleLike} className={`flex-shrink-0 mt-1 opacity-0 group-hover/comment:opacity-100 transition-all cursor-pointer ${liked ? 'text-red-400 opacity-100' : 'text-text-tertiary hover:text-red-400'}`}>
        <Heart size={12} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.5} />
      </button>
    </div>
  );
}


function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

