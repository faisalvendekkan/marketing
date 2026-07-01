import { useState, ReactNode } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useToast } from '@/context/ToastContext';
import { apiError } from '@/lib/api';
import { PageHeader } from './PageHeader';
import { DataTable, Column } from './DataTable';
import { Pagination } from './Pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'email' | 'url';
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface Props<T> {
  title: string;
  subtitle: string;
  resource: string;
  columns: Column<T>[];
  fields: FieldDef[];
  toPayload?: (form: Record<string, string>) => Record<string, unknown>;
  toForm?: (row: T) => Record<string, string>;
  headerExtra?: ReactNode;
  canWrite?: boolean;
}

export function ResourcePage<T extends { id: number }>({ title, subtitle, resource, columns, fields, toPayload, toForm, headerExtra, canWrite = true }: Props<T>) {
  const [page, setPage] = useState(1);
  const { query, create, update, remove } = useResource<T>(resource, { page });
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const emptyForm = () => Object.fromEntries(fields.map((f) => [f.name, f.type === 'select' ? (f.options?.[0]?.value ?? '') : '']));
  const [form, setForm] = useState<Record<string, string>>(emptyForm());

  const openNew = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (row: T) => { setEditing(row); setForm(toForm ? toForm(row) : emptyForm()); setOpen(true); };

  const save = async () => {
    const payload = toPayload ? toPayload(form) : Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync(payload);
      toast('success', `${title} ${editing ? 'updated' : 'created'}`);
      setOpen(false);
    } catch (e) { toast('error', apiError(e)); }
  };
  const doDelete = async () => {
    if (!delId) return;
    try { await remove.mutateAsync(delId); toast('success', 'Deleted'); setDelId(null); }
    catch (e) { toast('error', apiError(e)); }
  };

  const actionCol: Column<T> = {
    header: '', className: 'text-right', cell: (row) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setDelId(row.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    ),
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}
        action={canWrite ? <div className="flex gap-2">{headerExtra}<Button onClick={openNew}><Plus className="h-4 w-4" />New</Button></div> : headerExtra} />
      <DataTable columns={canWrite ? [...columns, actionCol] : columns} rows={query.data?.items} loading={query.isLoading}
        rowKey={(r) => r.id} emptyTitle={`No ${title.toLowerCase()} yet`}
        emptyAction={canWrite ? <Button onClick={openNew}><Plus className="h-4 w-4" />Create</Button> : undefined} />
      {query.data && <Pagination page={query.data.page} totalPages={query.data.totalPages} onChange={setPage} />}

      <Modal open={open} onClose={() => setOpen(false)} title={`${editing ? 'Edit' : 'New'} ${title}`}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending || update.isPending} onClick={save}>{editing ? 'Save' : 'Create'}</Button></>}>
        <div className="space-y-3">
          {fields.map((f) => {
            const val = form[f.name] ?? '';
            const on = (v: string) => setForm({ ...form, [f.name]: v });
            if (f.type === 'textarea') return <Textarea key={f.name} label={f.label} value={val} onChange={(e) => on(e.target.value)} />;
            if (f.type === 'select') return <Select key={f.name} label={f.label} value={val} onChange={(e) => on(e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>;
            return <Input key={f.name} label={f.label} type={f.type ?? 'text'} value={val} onChange={(e) => on(e.target.value)} />;
          })}
        </div>
      </Modal>
      <ConfirmDialog open={delId !== null} onClose={() => setDelId(null)} onConfirm={doDelete} title="Delete" message="This action cannot be undone." loading={remove.isPending} />
    </div>
  );
}
