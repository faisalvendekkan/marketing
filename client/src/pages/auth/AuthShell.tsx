import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-600 p-12 text-white lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">Abilix AI Marketing Studio</span>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Run all your marketing<br />from one AI workspace.</h2>
          <p className="mt-4 max-w-md text-brand-100">Create content, schedule social posts, capture leads, optimize SEO and measure performance — all in one place.</p>
          <div className="mt-8 flex gap-6 text-sm text-brand-100">
            <div><p className="text-2xl font-bold text-white">8+</p>Channels</div>
            <div><p className="text-2xl font-bold text-white">20+</p>AI templates</div>
            <div><p className="text-2xl font-bold text-white">∞</p>Campaigns</div>
          </div>
        </div>
        <p className="relative text-xs text-brand-200">© {new Date().getFullYear()} Abilix. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
