import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Aurora from '../components/Aurora';
import AuthModal from '../components/auth/AuthModal';
import FeaturesSection from '../components/landing/FeaturesSection';
import Footer from '../components/landing/Footer';
import { Hexagon, Sparkles } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LandingPage() {
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  const openLogin = () => setAuthModal({ open: true, mode: 'login' });
  const openRegister = () => setAuthModal({ open: true, mode: 'register' });
  const closeModal = () => setAuthModal({ open: false, mode: authModal.mode });

  return (
    <div className="relative min-h-screen bg-surface">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface-glass px-5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-sm shadow-accent/20">
                <Hexagon size={16} className="text-white" strokeWidth={2} />
              </div>
              <span className="font-display text-base font-semibold tracking-tight text-text-primary">
                Warhammer Portal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openLogin}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary cursor-pointer transition-colors hover:text-text-primary"
              >
                Sign In
              </button>
              <button
                onClick={openRegister}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Aurora Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Aurora
            colorStops={['#A29BFE', '#6C5CE7', '#DDD6FE']}
            blend={0.5}
            amplitude={0.8}
            speed={0.3}
          />
        </div>

        {/* Soft radial overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-surface/80 via-surface/50 to-surface" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft/60 px-3.5 py-1">
              <Sparkles size={12} className="text-accent" />
              <span className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                Your Collection Hub
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-5xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-6xl lg:text-[4.25rem]"
            >
              Catalog your
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                  miniature empire
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/10 rounded-full -z-0"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              The definitive platform to organize, track and showcase your
              Warhammer collections. From 40K to Age of Sigmar.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={openRegister}
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 cursor-pointer transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/25 active:scale-[0.97]"
              >
                Create Free Account
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                onClick={openLogin}
                className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface-primary px-7 py-3 text-sm font-medium text-text-primary cursor-pointer transition-all hover:border-text-tertiary hover:shadow-sm active:scale-[0.97]"
              >
                Sign In
                <svg className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="mt-14 flex items-center justify-center gap-8 sm:gap-14"
            >
              <Stat value="10+" label="Game Systems" />
              <div className="h-8 w-px bg-border" />
              <Stat value="100%" label="Track Progress" />
              <div className="h-8 w-px bg-border" />
              <Stat value="Free" label="To Start" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <FeaturesSection />

      {/* ── Footer ── */}
      <Footer />

      {/* ── Auth Modal ── */}
      <AnimatePresence>
        {authModal.open && (
          <AuthModal
            mode={authModal.mode}
            onClose={closeModal}
            onSwitchMode={(mode) => setAuthModal({ open: true, mode })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-xl font-bold text-text-primary">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-text-tertiary uppercase tracking-wide">{label}</div>
    </div>
  );
}

