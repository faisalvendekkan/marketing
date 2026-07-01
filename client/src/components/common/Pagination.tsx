import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-ghost px-2.5 py-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="btn-ghost px-2.5 py-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
