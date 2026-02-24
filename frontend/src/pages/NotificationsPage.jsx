import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Heart, MessageCircle, UserPlus, Trophy, Milestone,
  Check, CheckCheck, Loader2, User as UserIcon, Image as ImageIcon,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  like:        { icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  comment:     { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  follow:      { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  milestone:   { icon: Milestone, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true);
    try {
      const res = await api.get(`/collections/social/notifications/?page=${p}`);
      const data = res.data;
      const items = Array.isArray(data) ? data : data.results || [];
      if (p === 1) {
        setNotifications(items);
      } else {
        setNotifications((prev) => [...prev, ...items]);
      }
      setHasMore(!!data.next);
    } catch (e) {
      toast.error('Failed to load notifications');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(1); }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.post('/collections/social/notifications/read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-1">Activity</p>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-[13px] text-text-secondary">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[12px] font-medium text-text-secondary cursor-pointer transition-all hover:bg-surface-secondary hover:text-text-primary"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={24} className="animate-spin text-accent/50" /></div>
      ) : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col items-center justify-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <Bell size={24} className="text-accent" strokeWidth={1.3} />
          </div>
          <h3 className="font-display text-base font-bold text-text-primary">No notifications yet</h3>
          <p className="mt-1.5 text-[13px] text-text-secondary">When someone interacts with your content, you'll see it here.</p>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {notifications.map((notif, i) => (
              <NotificationItem key={notif.id} notif={notif} index={i} />
            ))}
          </AnimatePresence>
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => { const next = page + 1; setPage(next); fetchNotifications(next); }}
                className="rounded-xl border border-border px-5 py-2 text-[12px] font-medium text-text-secondary cursor-pointer hover:bg-surface-secondary transition-all"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notif, index }) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notif.notification_type] || TYPE_CONFIG.like;
  const Icon = cfg.icon;

  const handleClick = () => {
    if (notif.notification_type === 'follow' && notif.actor_username) {
      navigate(`/profile/${notif.actor_username}`);
    } else if ((notif.notification_type === 'like' || notif.notification_type === 'comment') && notif.actor_username) {
      // Navigate to the post owner's profile (the current user) to see the post
      // The miniature is on the current user's profile posts
      navigate(`/profile/${notif.actor_username}`);
    } else if (notif.notification_type === 'achievement') {
      navigate('/achievements');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={handleClick}
      className={`group flex items-start gap-3.5 rounded-xl px-4 py-3.5 transition-all duration-300 cursor-pointer ${
        notif.is_read
          ? 'hover:bg-surface-secondary/50'
          : 'bg-accent/[0.03] border border-accent/10 hover:bg-accent/[0.06]'
      }`}
    >
      {/* Icon */}
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        <Icon size={18} className={cfg.color} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-relaxed text-text-primary">
          {notif.actor_username && (
            <Link to={`/profile/${notif.actor_username}`} className="font-bold hover:text-accent transition-colors cursor-pointer">
              {notif.actor_username}
            </Link>
          )}
          {' '}
          <span className="text-text-secondary">{getMessageText(notif)}</span>
        </p>
        {notif.notification_type === 'achievement' && notif.achievement_name && (
          <div className={`inline-flex items-center gap-1.5 mt-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${getRarityClasses(notif.achievement_rarity)}`}>
            <Trophy size={11} />
            {notif.achievement_name}
          </div>
        )}
        <p className="text-[10px] text-text-tertiary mt-1">{formatTimeAgo(notif.created_at)}</p>
      </div>

      {/* Miniature thumbnail */}
      {notif.miniature_image && (
        <div className="flex h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-surface-secondary">
          <img src={notif.miniature_image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Unread dot */}
      {!notif.is_read && (
        <div className="flex-shrink-0 mt-1.5">
          <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent-glow)]" />
        </div>
      )}
    </motion.div>
  );
}

function getMessageText(notif) {
  if (notif.notification_type === 'like' && notif.miniature_name) {
    return `liked your miniature "${notif.miniature_name}"`;
  }
  if (notif.notification_type === 'comment' && notif.miniature_name) {
    return `commented on "${notif.miniature_name}"`;
  }
  if (notif.notification_type === 'follow') {
    return 'started following you';
  }
  if (notif.notification_type === 'achievement') {
    return notif.message || 'Achievement unlocked!';
  }
  return notif.message || '';
}

function getRarityClasses(rarity) {
  const map = {
    common:    'bg-zinc-500/10 text-zinc-400',
    uncommon:  'bg-emerald-500/10 text-emerald-400',
    rare:      'bg-blue-500/10 text-blue-400',
    epic:      'bg-purple-500/10 text-purple-400',
    legendary: 'bg-amber-500/10 text-amber-400',
  };
  return map[rarity] || map.common;
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

