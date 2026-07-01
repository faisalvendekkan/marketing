import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useToast } from '@/context/ToastContext';
import { apiError } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Campaign } from '@/types';

const STATUSES = ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];
const empty = { name: '', objective: '', status: 'draft', budget: '', description: '' };

export default function Campaigns() {
  const [page, setPage] = useState(1);
  const { query, create, update, remove } = useResource<Campaign>('campaigns', { page });
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [delId, setDelId] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ name: c.name, objective: c.objective ?? '', status: c.status, budget: String(c.budget ?? ''), description: c.description ?? '' });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      name: form.name, objective: form.objective || undefined, status: form.status,
      budget: form.budget ? Number(form.budget) : 0, description: form.description || undefined,
    };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync(payload);
      toast('success', `Campaign ${editing ? 'updated' : 'created'}`);
      setOpen(false);
    } catch (e) { toast('error', apiError(e)); }
  };

  const doDelete = async () => {
    if (!delId) return;
    try { await remove.mutateAsync(delId); toast('success', 'Campaign deleted'); setDelId(null); }
    catch (e) { toast('error', apiError(e)); }
  };

  const columns: Column<Campaign>[] = [
    { header: 'Name', cell: (c) => <div><p className="font-medium">{c.name}</p><p className="text-xs text-slate-400">{c.objective}</p></div> },
    { header: 'Status', cell: (c) => <Badge value={c.status} /> },
    { header: 'Budget', cell: (c) => formatCurrency(c.budget) },
    { header: 'Spent', cell: (c) => formatCurrency(c.spent) },
    { header: 'Start', cell: (c) => formatDate(c.start_date) },
    { header: '', className: 'text-right', cell: (c) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setDelId(c.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Plan, launch and track marketing campaigns"
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />New Campaign</Button>} />
      <DataTable columns={columns} rows={query.data?.items} loading={query.isLoading}
        rowKey={(c) => c.id} emptyTitle="No campaigns yet"
        emptyAction={<Button onClick={openNew}><Plus className="h-4 w-4" />Create your first campaign</Button>} />
      {query.data && <Pagination page={query.data.page} totalPages={query.data.totalPages} onChange={setPage} />}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Campaign' : 'New Campaign'}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={create.isPending || update.isPending} onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </>}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Objective" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </Select>
            <Input label="Budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog open={delId !== null} onClose={() => setDelId(null)} onConfirm={doDelete}
        title="Delete campaign" message="This will permanently remove the campaign." loading={remove.isPending} />
    </div>
  );
}
