import { ReactNode } from 'react';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ columns, rows, loading, emptyTitle = 'Nothing here yet', emptyAction, rowKey }: Props<T>) {
  if (loading) return <PageLoader />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} action={emptyAction} />;
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              {columns.map((c, i) => <th key={i} className={`px-4 py-3 ${c.className ?? ''}`}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                {columns.map((c, i) => <td key={i} className={`px-4 py-3 ${c.className ?? ''}`}>{c.cell(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
