import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Aurora from '../components/Aurora';
import EnvironmentBanner from '../components/EnvironmentBanner';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ───────── Animation Variants ───────── */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ───────── Main Component ───────── */
export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const isLogin = mode === 'login';

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      {/* Environment indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <EnvironmentBanner />
      </div>

      {/* Full-screen Aurora */}
      <div className="absolute inset-0 z-0 opacity-[0.12]">
        <Aurora
          colorStops={['#DDD6FE', '#A29BFE', '#E0E7FF']}
          blend={0.6}
          amplitude={0.6}
          speed={0.25}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-text-tertiary) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* ═══════ LEFT: Branding ═══════ */}
        <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
              Warhammer Portal
            </span>
          </motion.div>

          {/* Hero */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-[480px]"
          >
            <motion.p
              variants={fadeInUp}
              className="mb-5 text-[13px] font-medium uppercase tracking-[0.15em] text-accent"
            >
              Your collection awaits
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="text-[3.5rem] font-semibold leading-[1.04] tracking-[-0.035em] text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Catalog your
              <br />
              miniature{' '}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                empire.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-[420px]"
            >
              The definitive platform to organize, track and showcase your
              Warhammer collections. Built with precision for the community.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3">
              {[
                'Multi-system support — 40K, AoS, Middle-Earth',
                'Track painting progress in real time',
                'Share your collection with the community',
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-accent" />
                  <span className="text-[14px] text-text-secondary">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center gap-10"
          >
            <Stat value="10+" label="Game Systems" />
            <Stat value="∞" label="Collections" />
            <Stat value="Free" label="To Start" />
          </motion.div>
        </div>

        {/* ═══════ RIGHT: Auth ═══════ */}
        <div className="flex w-full lg:w-[48%] items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[400px]"
          >
            {/* Mobile logo */}
            <div className="lg:hidden mb-12 text-center">
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
                Warhammer Portal
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Your miniature collection hub
              </p>
            </div>

            {/* Card */}
            <div className="glass-card p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
              {/* Tab Switcher */}
              <div className="mb-8 flex rounded-xl bg-surface-secondary p-1">
                <TabButton active={isLogin} onClick={() => setMode('login')} label="Sign In" />
                <TabButton active={!isLogin} onClick={() => setMode('register')} label="Create Account" />
              </div>

              {/* Header */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode + '-header'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="mb-6"
                >
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">
                    {isLogin ? 'Welcome back' : 'Get started'}
                  </h2>
                  <p className="mt-1 text-[14px] text-text-secondary">
                    {isLogin
                      ? 'Sign in to manage your collections'
                      : 'Enter your email to create an account'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Forms — instant crossfade */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {isLogin ? <LoginForm /> : <EmailCheckForm onSwitchToLogin={() => setMode('login')} />}
                </motion.div>
              </AnimatePresence>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary select-none">
                  or
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {/* Switch */}
              <p className="text-center text-[13px] text-text-secondary">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => setMode(isLogin ? 'register' : 'login')}
                  className="font-semibold text-accent cursor-pointer transition-colors hover:text-accent-hover"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 text-center text-[11px] text-text-tertiary"
            >
              © {new Date().getFullYear()} Warhammer Portal · Built for the community
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Stat ───────── */
function Stat({ value, label }) {
  return (
    <div>
      <div className="text-lg font-semibold tracking-[-0.02em] text-text-primary">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary">{label}</div>
    </div>
  );
}

/* ───────── Tab Button ───────── */
function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 rounded-lg py-2.5 text-[13px] cursor-pointer transition-all duration-300 ease-out"
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-lg bg-surface-secondary shadow-[0_1px_3px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.04)]"
          transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
        />
      )}
      <motion.span
        className="relative z-10"
        animate={{
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          fontWeight: active ? 600 : 500,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {label}
      </motion.span>
    </button>
  );
}

/* ───────── Login Form ───────── */
function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        autoFocus
      />
      <InputField
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-tertiary cursor-pointer transition-colors duration-200 hover:text-text-secondary"
          >
            <motion.div
              key={showPassword ? 'hide' : 'show'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </motion.div>
          </button>
        }
      />
      <div className="pt-1.5">
        <SubmitButton loading={isLoading} label="Sign In" />
      </div>
    </form>
  );
}

/* ───────── Email Check Form (Create Account) ───────── */
function EmailCheckForm({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null); // null | 'available' | 'taken' | 'error'

  // Real-time email check with debounce
  useEffect(() => {
    const trimmed = email.trim();

    // Basic email format validation
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus(null);
      return;
    }

    setChecking(true);
    setStatus(null);

    const timeout = setTimeout(async () => {
      try {
        const res = await api.post('/auth/register/check-email/', { email: trimmed });
        setStatus(res.data.available ? 'available' : 'taken');
      } catch {
        // If endpoint fails, assume available (will be caught at registration)
        setStatus('available');
      }
      setChecking(false);
    }, 400);

    return () => {
      clearTimeout(timeout);
      setChecking(false);
    };
  }, [email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || status === 'taken' || checking) return;

    navigate(`/register?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <InputField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        {/* Real-time status indicator */}
        {email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {checking ? (
              <Loader2 size={14} className="animate-spin text-text-tertiary" />
            ) : status === 'available' ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10"
              >
                <Check size={11} className="text-accent" />
              </motion.div>
            ) : status === 'taken' ? (
              <span className="text-[11px] font-medium text-danger">In use</span>
            ) : null}
          </div>
        )}
      </div>
      {status === 'taken' && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-text-secondary"
        >
          This email is already registered.{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-accent cursor-pointer hover:text-accent-hover"
          >
            Sign in instead?
          </button>
        </motion.p>
      )}
      <div className="pt-1.5">
        <SubmitButton loading={checking} label="Continue" disabled={status !== 'available'} />
      </div>
    </form>
  );
}

/* ───────── Input Field ───────── */
function InputField({ suffix, ...props }) {
  return (
    <div className="group relative">
      <input
        {...props}
        className={`w-full rounded-xl border border-border bg-surface-secondary/50 px-4 py-3 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:border-accent/30 focus:bg-surface-secondary focus:ring-2 focus:ring-accent/10 ${
          suffix ? 'pr-10' : ''
        }`}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

/* ───────── Submit Button ───────── */
function SubmitButton({ loading, label, disabled = false }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent py-3 text-[13px] font-semibold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight size={13} className="opacity-60 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        </>
      )}
    </motion.button>
  );
}

