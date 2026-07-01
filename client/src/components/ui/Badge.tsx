import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  completed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  lost: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  qualified: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
};

export function Badge({ value }: { value: string }) {
  const cls = styles[value] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  return <span className={cn('badge capitalize', cls)}>{value.replace(/_/g, ' ')}</span>;
}
