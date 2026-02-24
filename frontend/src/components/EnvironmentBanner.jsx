import { motion } from 'framer-motion';
import env from '../config/environment';

/**
 * EnvironmentBanner — Persistent banner for non-production environments.
 * Hidden in prod. Shows DEV (green) or QA (amber) badge at the top of the page.
 */
export default function EnvironmentBanner() {
  // Never show in production
  if (env.isProd) return null;

  const styles = env.isDev
    ? {
        bg: 'bg-emerald-500/8',
        border: 'border-emerald-500/15',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_6px_rgba(16,185,129,0.25)]',
        label: '🛠 Development',
        sub: 'Test data — Not production',
      }
    : {
        bg: 'bg-amber-500/8',
        border: 'border-amber-500/15',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        glow: 'shadow-[0_0_6px_rgba(245,158,11,0.25)]',
        label: '🔍 QA / Staging',
        sub: 'Quality assurance — Pre-production',
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative z-50 flex items-center justify-center gap-3 border-b px-4 py-1.5 ${styles.bg} ${styles.border}`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.dot}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${styles.dot} ${styles.glow}`} />
      </span>

      {/* Label */}
      <span className={`text-[11px] font-bold uppercase tracking-[0.08em] ${styles.text}`}>
        {styles.label}
      </span>

      <span className="text-[10px] text-text-tertiary hidden sm:inline">
        {styles.sub}
      </span>

      {/* Version badge */}
      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${styles.text} ${styles.bg} border ${styles.border}`}>
        v{env.version}
      </span>
    </motion.div>
  );
}

