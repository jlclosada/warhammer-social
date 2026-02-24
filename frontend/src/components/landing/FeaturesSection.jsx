import { motion } from 'framer-motion';
import { Archive, Palette, BarChart3, Globe, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: Archive,
    title: 'Multi-System Collections',
    description:
      'Organize miniatures across Warhammer 40K, Age of Sigmar, Middle-Earth, and more.',
  },
  {
    icon: Palette,
    title: 'Paint Status Tracking',
    description:
      'Track each miniature from sprue to display-ready. Monitor your painting backlog.',
  },
  {
    icon: BarChart3,
    title: 'Collection Analytics',
    description:
      'Insights into your collection size, painting progress, and faction breakdowns.',
  },
  {
    icon: Globe,
    title: 'Share & Showcase',
    description:
      'Make collections public and share your painted armies with the community.',
  },
  {
    icon: Lock,
    title: 'Private by Default',
    description:
      'Your data is yours. Collections stay private until you choose to share them.',
  },
  {
    icon: Zap,
    title: 'Premium Features',
    description:
      'Unlimited collections, high-res galleries, advanced analytics, and priority support.',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FeaturesSection() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">
            Features
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Built by hobbyists, for hobbyists. A complete toolkit to manage
            every aspect of your collection.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group rounded-2xl border border-border bg-surface-primary p-6 transition-all duration-300 hover:border-accent-light/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-4 inline-flex rounded-xl bg-accent-soft p-2.5 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                <f.icon size={18} strokeWidth={1.8} />
              </div>
              <h3 className="mb-1.5 font-display text-[15px] font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

