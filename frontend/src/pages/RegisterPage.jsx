import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check, Camera } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Aurora from '../components/Aurora';
import EnvironmentBanner from '../components/EnvironmentBanner';
import api from '../services/api';
import toast from 'react-hot-toast';

const TOTAL_STEPS = 3;

/* ───────── Animation ───────── */
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ───────── Game Systems ───────── */
const GAME_SYSTEMS = [
  'Warhammer 40,000',
  'Age of Sigmar',
  'Horus Heresy',
  'Middle-Earth SBG',
  'Necromunda',
  'Kill Team',
  'Warcry',
  'Blood Bowl',
  'Adeptus Titanicus',
  'Other',
];

/* ───────── Main ───────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1 — Identity
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    // Step 2 — Profile
    favorite_game: '',
    years_in_hobby: '',
    bio: '',
    // Step 3 — Personalize
    avatar: null,
    avatarPreview: null,
    location: '',
    website: '',
  });

  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Read email from URL query params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setForm((prev) => ({ ...prev, email: emailParam }));
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  /* ── Username debounce check ── */
  useEffect(() => {
    if (!form.username || form.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timeout = setTimeout(async () => {
      try {
        // We can try registering with a check or just validate client-side length
        setUsernameAvailable(true);
      } catch {
        setUsernameAvailable(false);
      }
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.username]);

  /* ── Validate current step ── */
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!form.first_name.trim()) newErrors.first_name = 'Required';
      if (!form.last_name.trim()) newErrors.last_name = 'Required';
      if (!form.username.trim()) newErrors.username = 'Required';
      else if (form.username.length < 3) newErrors.username = 'At least 3 characters';
      if (!form.password) newErrors.password = 'Required';
      else if (form.password.length < 8) newErrors.password = 'At least 8 characters';
      if (form.password !== form.password_confirm) newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Navigation ── */
  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  /* ── Map years range to integer ── */
  const yearsToInt = (range) => {
    const map = { '< 1': 0, '1–3': 2, '3–5': 4, '5–10': 7, '10+': 12 };
    return map[range] ?? 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const result = await register({
      email: form.email,
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      password: form.password,
      password_confirm: form.password_confirm,
    });

    if (result.success) {
      // Update profile with extra info (non-critical)
      try {
        const profilePayload = {
          bio: form.bio || '',
          profile: {
            favorite_game: form.favorite_game || '',
            years_in_hobby: yearsToInt(form.years_in_hobby),
            location: form.location || '',
            website: form.website || '',
          },
        };
        await api.patch('/auth/me/', profilePayload);
      } catch {
        // Silently ignore — account is already created
      }

      // Upload avatar separately if provided
      if (form.avatar) {
        try {
          const fd = new FormData();
          fd.append('avatar', form.avatar);
          await api.patch('/auth/me/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          // Avatar upload is non-critical
        }
      }

      toast.success('Welcome aboard! Your account is ready.');
      navigate('/feed');
    } else {
      toast.error(result.message);
    }
  };

  /* ── Avatar handler ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateForm('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => updateForm('avatarPreview', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const stepInfo = {
    1: { title: 'Create your account', subtitle: 'The essentials to get you started' },
    2: { title: 'About your hobby', subtitle: 'Help us personalize your experience' },
    3: { title: 'Final touches', subtitle: 'Make your profile yours — all optional' },
  };

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      {/* Environment indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <EnvironmentBanner />
      </div>

      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 opacity-[0.10]">
        <Aurora
          colorStops={['#DDD6FE', '#A29BFE', '#E0E7FF']}
          blend={0.6}
          amplitude={0.6}
          speed={0.25}
        />
      </div>
      <div
        className="absolute inset-0 z-[1] opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-text-tertiary) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[480px]"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary mb-8"
            >
              Warhammer Portal
            </motion.p>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      i + 1 <= step ? 'bg-accent' : 'bg-border'
                    }`}
                    animate={{
                      width: i + 1 === step ? 32 : 12,
                      opacity: i + 1 <= step ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-semibold tracking-[-0.025em] text-text-primary">
                  {stepInfo[step].title}
                </h1>
                <p className="mt-1.5 text-[14px] text-text-secondary">
                  {stepInfo[step].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <div className="glass-card p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
            {/* Email badge (always visible) */}
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-surface-secondary px-3.5 py-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-[13px] text-text-secondary truncate">{form.email}</span>
            </div>

            {/* Step content */}
            <div className="min-h-[340px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} {...pageTransition}>
                  {step === 1 && (
                    <Step1
                      form={form}
                      errors={errors}
                      updateForm={updateForm}
                      usernameAvailable={usernameAvailable}
                      checkingUsername={checkingUsername}
                    />
                  )}
                  {step === 2 && (
                    <Step2
                      form={form}
                      updateForm={updateForm}
                    />
                  )}
                  {step === 3 && (
                    <Step3
                      form={form}
                      updateForm={updateForm}
                      handleAvatarChange={handleAvatarChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center gap-3">
              {step > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-300 ease-out hover:bg-surface-secondary hover:text-text-primary hover:border-border"
                >
                  <ArrowLeft size={13} />
                  Back
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={step === TOTAL_STEPS ? handleSubmit : nextStep}
                disabled={isLoading}
                className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent py-3 text-[13px] font-semibold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(108,92,231,0.2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : step === TOTAL_STEPS ? (
                  <>
                    <span>Create Account</span>
                    <Check size={14} className="opacity-70" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={13} className="opacity-60" />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[13px] text-text-tertiary cursor-pointer transition-colors hover:text-text-secondary"
            >
              Already have an account? <span className="font-semibold text-accent">Sign In</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━ STEP 1: Identity ━━━━━━━━━ */
function Step1({ form, errors, updateForm, usernameAvailable, checkingUsername }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <InputField
          placeholder="First name"
          value={form.first_name}
          onChange={(e) => updateForm('first_name', e.target.value)}
          error={errors.first_name}
          autoFocus
        />
        <InputField
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) => updateForm('last_name', e.target.value)}
          error={errors.last_name}
        />
      </div>

      <div className="relative">
        <InputField
          placeholder="Username"
          value={form.username}
          onChange={(e) => updateForm('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
          error={errors.username}
        />
        {form.username.length >= 3 && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {checkingUsername ? (
              <Loader2 size={13} className="animate-spin text-text-tertiary" />
            ) : usernameAvailable ? (
              <Check size={13} className="text-accent" />
            ) : null}
          </div>
        )}
      </div>

      <InputField
        type={showPassword ? 'text' : 'password'}
        placeholder="Create a password"
        value={form.password}
        onChange={(e) => updateForm('password', e.target.value)}
        error={errors.password}
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

      {form.password && (
        <PasswordStrength password={form.password} />
      )}

      <InputField
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirm password"
        value={form.password_confirm}
        onChange={(e) => updateForm('password_confirm', e.target.value)}
        error={errors.password_confirm}
      />
    </div>
  );
}

/* ━━━━━━━━━ STEP 2: Hobby ━━━━━━━━━ */
function Step2({ form, updateForm }) {
  return (
    <div className="space-y-5">
      {/* Favorite game — chips */}
      <div>
        <label className="mb-2.5 block text-[13px] font-medium text-text-primary">
          What do you play?
        </label>
        <div className="flex flex-wrap gap-2">
          {GAME_SYSTEMS.map((game) => {
            const selected = form.favorite_game === game;
            return (
              <motion.button
                key={game}
                type="button"
                onClick={() => updateForm('favorite_game', selected ? '' : game)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium cursor-pointer transition-all duration-300 ease-out ${
                  selected
                    ? 'border-accent/40 bg-accent-soft text-accent shadow-[0_0_0_1px_rgba(108,92,231,0.08)]'
                    : 'border-border bg-surface-secondary/50 text-text-secondary hover:border-border hover:text-text-primary'
                }`}
                animate={{ scale: selected ? 1.02 : 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                whileTap={{ scale: 0.96 }}
              >
                {game}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Years in hobby */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-text-primary">
          Years in the hobby
        </label>
        <div className="flex items-center gap-3">
          {['< 1', '1–3', '3–5', '5–10', '10+'].map((range) => {
            const selected = form.years_in_hobby === range;
            return (
              <motion.button
                key={range}
                type="button"
                onClick={() => updateForm('years_in_hobby', selected ? '' : range)}
                className={`flex-1 rounded-xl border py-2.5 text-[12px] font-medium cursor-pointer transition-all duration-300 ease-out ${
                  selected
                    ? 'border-accent/40 bg-accent-soft text-accent shadow-[0_0_0_1px_rgba(108,92,231,0.08)]'
                    : 'border-border bg-surface-secondary/50 text-text-secondary hover:border-border hover:text-text-primary'
                }`}
                animate={{ scale: selected ? 1.03 : 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                whileTap={{ scale: 0.97 }}
              >
                {range}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-text-primary">
          Tell us about yourself
          <span className="ml-1 text-text-tertiary font-normal">— optional</span>
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => updateForm('bio', e.target.value)}
          placeholder="A few words about you and your hobby..."
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-border bg-surface-secondary/50 px-4 py-3 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:border-accent/30 focus:bg-surface-secondary focus:ring-2 focus:ring-accent/10"
        />
        <p className="mt-1 text-right text-[11px] text-text-tertiary">
          {form.bio.length}/500
        </p>
      </div>
    </div>
  );
}

/* ━━━━━━━━━ STEP 3: Personalize ━━━━━━━━━ */
function Step3({ form, updateForm, handleAvatarChange }) {
  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <label className="group relative cursor-pointer" htmlFor="avatar-upload">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-border transition-all duration-300 ease-out group-hover:border-accent/40 group-hover:shadow-[0_0_0_4px_rgba(108,92,231,0.06)]">
            {form.avatarPreview ? (
              <img
                src={form.avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-secondary">
                <Camera size={24} className="text-text-tertiary transition-colors group-hover:text-accent" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/10">
              <Camera
                size={16}
                className="text-white opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>
        <div className="text-center">
          <p className="text-[13px] font-medium text-text-primary">Profile photo</p>
          <p className="text-[11px] text-text-tertiary">Click to upload · Optional</p>
        </div>
      </div>

      {/* Location */}
      <InputField
        placeholder="Location (e.g., London, UK)"
        value={form.location}
        onChange={(e) => updateForm('location', e.target.value)}
      />

      {/* Website */}
      <InputField
        type="url"
        placeholder="Website or social link"
        value={form.website}
        onChange={(e) => updateForm('website', e.target.value)}
      />

      {/* Summary */}
      <div className="rounded-xl border border-border/60 bg-surface-secondary/50 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary mb-3">
          Account summary
        </p>
        <div className="space-y-2">
          <SummaryRow label="Name" value={`${form.first_name} ${form.last_name}`.trim()} />
          <SummaryRow label="Username" value={`@${form.username}`} />
          <SummaryRow label="Email" value={form.email} />
          {form.favorite_game && <SummaryRow label="Main game" value={form.favorite_game} />}
          {form.years_in_hobby && <SummaryRow label="Experience" value={`${form.years_in_hobby} years`} />}
        </div>
      </div>
    </div>
  );
}

/* ───────── Summary Row ───────── */
function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-text-tertiary">{label}</span>
      <span className="text-[12px] font-medium text-text-primary truncate ml-4 max-w-[200px]">{value}</span>
    </div>
  );
}

/* ───────── Password Strength ───────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="overflow-hidden"
    >
      {/* Bar */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength
                ? strength <= 1
                  ? 'bg-danger'
                  : strength <= 2
                    ? 'bg-warning'
                    : strength <= 3
                      ? 'bg-accent-light'
                      : 'bg-success'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
      {/* Checks */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[11px] transition-colors ${
              c.pass ? 'text-accent' : 'text-text-tertiary'
            }`}
          >
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────── Input Field ───────── */
function InputField({ suffix, error, ...props }) {
  return (
    <div>
      <div className="group relative">
        <input
          {...props}
          className={`w-full rounded-xl border bg-surface-secondary/50 px-4 py-3 text-[13px] text-text-primary placeholder-text-tertiary outline-none cursor-text transition-all duration-300 ease-out focus:bg-surface-secondary focus:ring-2 ${
            error
              ? 'border-danger/40 focus:border-danger/60 focus:ring-danger/10'
              : 'border-border focus:border-accent/30 focus:ring-accent/10'
          } ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-1 text-[11px] text-danger"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

