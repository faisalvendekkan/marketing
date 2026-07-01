import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';
import { formatDate } from '@/lib/utils';

interface Task { id: number; title: string; description: string | null; priority: string; status: string; due_date: string | null; }
const columns: Column<Task>[] = [
  { header: 'Task', cell: (t) => <div><p className="font-medium">{t.title}</p><p className="line-clamp-1 text-xs text-slate-400">{t.description}</p></div> },
  { header: 'Priority', cell: (t) => <span className="capitalize">{t.priority}</span> },
  { header: 'Status', cell: (t) => <Badge value={t.status} /> },
  { header: 'Due', cell: (t) => formatDate(t.due_date) },
];
const fields: FieldDef[] = [
  { name: 'title', label: 'Title' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','urgent'].map((v) => ({ value: v, label: v })) },
  { name: 'status', label: 'Status', type: 'select', options: ['todo','in_progress','review','done'].map((v) => ({ value: v, label: v.replace(/_/g,' ') })) },
  { name: 'due_date', label: 'Due date', type: 'text' },
];
export default function Tasks() {
  return <ResourcePage<Task> title="Tasks" subtitle="Plan and track your team's work" resource="tasks" columns={columns} fields={fields}
    toForm={(t) => ({ title: t.title, description: t.description ?? '', priority: t.priority, status: t.status, due_date: t.due_date?.slice(0,10) ?? '' })} />;
}
