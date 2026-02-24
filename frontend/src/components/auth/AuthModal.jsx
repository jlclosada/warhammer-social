import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const panel = {
  hidden: { opacity: 0, scale: 0.96, y: 12, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 32, stiffness: 420 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    filter: 'blur(8px)',
    transition: { duration: 0.15 },
  },
};

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const isLogin = mode === 'login';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-text-primary/10 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-2xl shadow-text-primary/8"
        variants={panel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-text-tertiary cursor-pointer transition-colors hover:bg-surface-secondary hover:text-text-secondary"
        >
          <X size={16} />
        </button>

        <div className="px-8 pb-8 pt-10">
          {/* Header */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.25 }}
            className="mb-7 text-center"
          >
            <h2 className="font-display text-[22px] font-bold tracking-tight text-text-primary">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              {isLogin
                ? 'Sign in to manage your collections'
                : 'Start cataloging your miniatures'}
            </p>
          </motion.div>

          {/* Form */}
          {isLogin ? (
            <LoginForm onClose={onClose} />
          ) : (
            <RegisterForm onClose={onClose} />
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Switch mode */}
          <p className="text-center text-[13px] text-text-secondary">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => onSwitchMode(isLogin ? 'register' : 'login')}
              className="font-semibold text-accent cursor-pointer transition-colors hover:text-accent-hover"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────── Login Form ───────── */
function LoginForm({ onClose }) {
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        autoFocus
      />

      <InputField
        icon={Lock}
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
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </motion.div>
          </button>
        }
      />

      <div className="pt-1">
        <SubmitButton loading={isLoading} label="Sign In" />
      </div>
    </form>
  );
}

/* ───────── Register Form ───────── */
function RegisterForm({ onClose }) {
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome aboard.');
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <InputField
          icon={User}
          type="text"
          placeholder="First name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          autoFocus
        />
        <InputField
          type="text"
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
      </div>

      <InputField
        icon={User}
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
      />

      <InputField
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <InputField
        icon={Lock}
        type={showPassword ? 'text' : 'password'}
        placeholder="Password (min. 8 characters)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={8}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-tertiary cursor-pointer transition-colors duration-200 hover:text-text-secondary"
          >
            <motion.div
              key={showPassword ? 'hide2' : 'show2'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </motion.div>
          </button>
        }
      />

      <InputField
        icon={Lock}
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirm password"
        value={form.password_confirm}
        onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
        required
        minLength={8}
      />

      <div className="pt-1">
        <SubmitButton loading={isLoading} label="Create Account" />
      </div>
    </form>
  );
}

/* ───────── Input ───────── */
function InputField({ icon: Icon, suffix, ...props }) {
  return (
    <div className="group relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors duration-200 group-focus-within:text-accent">
          <Icon size={15} strokeWidth={2} />
        </div>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-border bg-surface-secondary/50 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:border-accent-light focus:bg-surface-primary focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.04)] ${
          Icon ? 'pl-10' : 'pl-3.5'
        } ${suffix ? 'pr-10' : 'pr-3.5'}`}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

/* ───────── Submit Button ───────── */
function SubmitButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/20 cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(108,92,231,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight size={14} className="opacity-60 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        </>
      )}
    </motion.button>
  );
}
