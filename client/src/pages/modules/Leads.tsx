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
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import type { Lead } from '@/types';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const empty = { full_name: '', email: '', phone: '', company_name: '', value: '', status: 'new' };

export default function Leads() {
  const [page, setPage] = useState(1);
  const { query, create, update, remove } = useResource<Lead>('leads', { page });
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [delId, setDelId] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (l: Lead) => {
    setEditing(l);
    setForm({ full_name: l.full_name, email: l.email ?? '', phone: l.phone ?? '', company_name: l.company_name ?? '', value: String(l.value ?? ''), status: l.status });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      full_name: form.full_name, email: form.email || undefined, phone: form.phone || undefined,
      company_name: form.company_name || undefined, value: form.value ? Number(form.value) : 0, status: form.status,
    };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync(payload);
      toast('success', `Lead ${editing ? 'updated' : 'created'}`);
      setOpen(false);
    } catch (e) { toast('error', apiError(e)); }
  };

  const doDelete = async () => {
    if (!delId) return;
    try { await remove.mutateAsync(delId); toast('success', 'Lead deleted'); setDelId(null); }
    catch (e) { toast('error', apiError(e)); }
  };

  const columns: Column<Lead>[] = [
    { header: 'Name', cell: (l) => <div><p className="font-medium">{l.full_name}</p><p className="text-xs text-slate-400">{l.email}</p></div> },
    { header: 'Company', cell: (l) => l.company_name || '—' },
    { header: 'Phone', cell: (l) => l.phone || '—' },
    { header: 'Value', cell: (l) => formatCurrency(l.value) },
    { header: 'Status', cell: (l) => <Badge value={l.status} /> },
    { header: '', className: 'text-right', cell: (l) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => openEdit(l)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setDelId(l.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Leads" subtitle="Track and convert your sales pipeline"
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />New Lead</Button>} />
      <DataTable columns={columns} rows={query.data?.items} loading={query.isLoading} rowKey={(l) => l.id}
        emptyTitle="No leads yet" emptyAction={<Button onClick={openNew}><Plus className="h-4 w-4" />Add a lead</Button>} />
      {query.data && <Pagination page={query.data.page} totalPages={query.data.totalPages} onChange={setPage} />}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Lead' : 'New Lead'}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={create.isPending || update.isPending} onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </>}>
        <div className="space-y-4">
          <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Company" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={delId !== null} onClose={() => setDelId(null)} onConfirm={doDelete}
        title="Delete lead" message="This will permanently remove the lead." loading={remove.isPending} />
    </div>
  );
}
