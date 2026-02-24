import { Hexagon } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent shadow-sm shadow-accent/20">
            <Hexagon size={12} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display text-sm font-medium text-text-secondary">
            Warhammer Portal
          </span>
        </div>

        <p className="text-xs text-text-tertiary">
          {year} Warhammer Portal. Built for the community.
        </p>

        <div className="flex items-center gap-5">
          <a href="#" className="text-xs text-text-tertiary cursor-pointer transition-colors hover:text-accent">Privacy</a>
          <a href="#" className="text-xs text-text-tertiary cursor-pointer transition-colors hover:text-accent">Terms</a>
          <a href="#" className="text-xs text-text-tertiary cursor-pointer transition-colors hover:text-accent">Contact</a>
        </div>
      </div>
    </footer>
  );
}

