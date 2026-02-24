import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Send, Loader2,
  User as UserIcon, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
];

export default function FeedPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    try {
      const endpoint = tab === 'following' ? '/collections/feed/following/' : '/collections/feed/for-you/';
      const res = await api.get(`${endpoint}?page=${pageNum}`);
      const data = res.data;
      const results = data.results || data || [];
      if (append) {
        setPosts((prev) => [...prev, ...results]);
      } else {
        setPosts(results);
      }
      setHasMore(!!data.next);
    } catch {
      if (pageNum === 1) setPosts([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false);
  }, [fetchFeed]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => {
            const next = p + 1;
            fetchFeed(next, true);
            return next;
          });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchFeed]);

  const updatePost = (id, updater) => {
    if (id === null) {
      // Apply updater to ALL posts (e.g. follow state for same owner)
      setPosts((prev) => prev.map((p) => updater(p)));
    } else {
      setPosts((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
    }
  };

  return (
    <div className="max-w-[540px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] gradient-text mb-1">
          Explore
        </h1>
        <p className="text-[13px] text-text-secondary">
          Discover amazing miniatures from the community.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-surface-secondary/50 border border-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 rounded-lg py-2 text-[13px] font-semibold cursor-pointer transition-all duration-300 ${
              tab === id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === id && (
              <motion.div
                layoutId="feed-tab"
                className="absolute inset-0 rounded-lg bg-surface-primary border border-border shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-accent/50" />
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
            <Sparkles size={28} className="text-accent" strokeWidth={1.3} />
          </div>
          <h3 className="font-display text-lg font-bold text-text-primary">
            {tab === 'following' ? 'No posts from people you follow' : 'No public miniatures yet'}
          </h3>
          <p className="mt-2 text-[13px] text-text-secondary text-center max-w-sm leading-relaxed">
            {tab === 'following'
              ? 'Search for hobbyists and follow them to see their work here.'
              : 'Be the first to share your painted miniatures with the community!'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <FeedCard post={post} updatePost={updatePost} currentUser={user} />
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-text-tertiary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ━━━━━━━━━ Feed Card ━━━━━━━━━ */
function FeedCard({ post, updatePost, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFollowing, setIsFollowing] = useState(post.is_following || false);
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(post.is_saved);

  // Sync follow state when post prop changes (e.g. from another card's follow action)
  useEffect(() => {
    setIsFollowing(post.is_following || false);
  }, [post.is_following]);

  const images = post.images || [];
  const isMine = currentUser?.username === post.owner_username;

  const handleLike = async () => {
    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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
    setSaved((prev) => !prev);
    try {
      const res = await api.post(`/collections/social/save/${post.id}/`);
      setSaved(res.data.saved);
    } catch {
      setSaved(post.is_saved);
    }
  };

  const handleDoubleTapLike = () => {
    if (!liked) handleLike();
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/collections/social/comments/${post.id}/`);
      setComments(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch { /* ignore */ }
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await api.post(`/collections/social/comments/${post.id}/`, { text: commentText.trim() });
      setCommentText('');
      loadComments();
      updatePost(post.id, (p) => ({ ...p, comment_count: (p.comment_count || 0) + 1 }));
    } catch { toast.error('Failed'); }
    setCommenting(false);
  };

  const handleFollow = async () => {
    const prev = isFollowing;
    setIsFollowing(!prev);
    try {
      const res = await api.post(`/collections/social/follow/${post.owner_id}/`);
      const nowFollowing = res.data.following;
      setIsFollowing(nowFollowing);
      // Update all posts from the same owner in the feed
      updatePost(null, (p) => {
        if (p.owner_id === post.owner_id) {
          return { ...p, is_following: nowFollowing };
        }
        return p;
      });
    } catch (e) {
      setIsFollowing(prev);
      toast.error('Failed to follow');
    }
  };

  const nextImage = () => setCurrentImage((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 ring-[1.5px] ring-accent/15 overflow-hidden">
          {post.owner_avatar ? (
            <img src={post.owner_avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon size={14} className="text-accent-light" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.owner_username}`} className="text-[13px] font-semibold text-text-primary truncate cursor-pointer hover:text-accent transition-colors block">
            {post.owner_username}
          </Link>
          <p className="text-[10px] text-text-tertiary">
            {post.faction_name} · {post.game_system_name}
          </p>
        </div>
        {!isMine && (
          <button
            onClick={handleFollow}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all duration-300 ${
              isFollowing
                ? 'bg-surface-secondary text-text-secondary border border-border hover:text-red-400 hover:border-red-400/20'
                : 'bg-accent/10 text-accent hover:bg-accent/20'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Image carousel */}
      {images.length > 0 && (
        <div className="relative bg-surface-secondary" onDoubleClick={handleDoubleTapLike}>
          <div className="aspect-square overflow-hidden">
            <img
              src={images[currentImage]?.image}
              alt={post.name}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/50 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/70 opacity-0 hover:opacity-100 active:opacity-100"
                style={{ opacity: undefined }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/50 backdrop-blur-sm text-text-primary cursor-pointer transition-all hover:bg-surface/70">
                <ChevronRight size={14} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImage ? 'w-4 bg-accent' : 'w-1.5 bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-75 ${liked ? 'text-red-400' : 'text-text-tertiary hover:text-text-secondary'}`}>
            <Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
          <button onClick={toggleComments}
            className="flex items-center gap-1.5 text-text-tertiary cursor-pointer transition-all duration-200 hover:text-text-secondary active:scale-90">
            <MessageCircle size={22} strokeWidth={1.5} />
          </button>
          <div className="flex-1" />
          <button onClick={handleSave}
            className={`cursor-pointer transition-all duration-200 active:scale-75 ${saved ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}>
            <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <p className="text-[12px] font-bold text-text-primary mt-2">{likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}</p>
        )}

        {/* Info */}
        <div className="mt-2 pb-3">
          <p className="text-[13px] leading-relaxed">
            <span className="font-bold text-text-primary">{post.owner_username}</span>{' '}
            <span className="text-text-secondary">{post.name}</span>
          </p>
          {post.description && (
            <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">{post.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-tertiary">
            <span>{post.paint_status_display}</span>
            {post.points_cost > 0 && <span>{post.points_cost} pts</span>}
            {post.painting_hours > 0 && <span>{post.painting_hours}h</span>}
            {post.quantity > 1 && <span>×{post.quantity}</span>}
          </div>

          {/* View comments link */}
          {(post.comment_count || 0) > 0 && !showComments && (
            <button onClick={toggleComments} className="text-[12px] text-text-tertiary mt-2 cursor-pointer hover:text-text-secondary transition-colors">
              View all {post.comment_count} comments
            </button>
          )}

          {/* Time */}
          <p className="text-[10px] text-text-tertiary mt-2 uppercase tracking-wider">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="pt-3 pb-4">
                {loadingComments ? (
                  <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-text-tertiary" /></div>
                ) : comments.length === 0 ? (
                  <p className="text-[12px] text-text-tertiary text-center py-3">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-3 pr-1">
                    {comments.map((c) => (
                      <CommentItem key={c.id} comment={c} onUpdate={(updated) => {
                        setComments((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                      }} />
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Add a comment..." value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    className="flex-1 rounded-lg border border-border bg-surface-secondary/50 px-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-200 focus:border-accent/30 focus:ring-1 focus:ring-accent/10" />
                  <button onClick={submitComment} disabled={commenting || !commentText.trim()}
                    className="rounded-lg bg-accent/10 p-2 text-accent cursor-pointer transition-all hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed">
                    {commenting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


/* ━━━━━━━━━ Comment Item with Like ━━━━━━━━━ */
function CommentItem({ comment, onUpdate }) {
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
          <button
            onClick={handleLike}
            className={`text-[9px] font-semibold cursor-pointer transition-colors ${liked ? 'text-red-400' : 'text-text-tertiary hover:text-text-secondary'}`}
          >
            {liked ? 'Unlike' : 'Like'}
          </button>
        </div>
      </div>
      <button
        onClick={handleLike}
        className={`flex-shrink-0 mt-1 opacity-0 group-hover/comment:opacity-100 transition-all cursor-pointer ${liked ? 'text-red-400 opacity-100' : 'text-text-tertiary hover:text-red-400'}`}
      >
        <Heart size={12} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.5} />
      </button>
    </div>
  );
}


/* ── Time formatting ── */
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

