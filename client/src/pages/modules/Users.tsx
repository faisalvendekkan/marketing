import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Shield } from 'lucide-react';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDateTime } from '@/lib/utils';
import type { Paginated } from '@/types';

interface Row { id: number; first_name: string; last_name: string | null; email: string; status: string; role_name: string; role_slug: string; last_login_at: string | null; }
interface Role { id: number; name: string; slug: string; user_count: number; }

export default function Users() {
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', roleId: 3 });

  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get<{ data: Paginated<Row> }>('/admin/users')).data.data });
  const roles = useQuery({ queryKey: ['admin-roles'], queryFn: async () => (await api.get<{ data: Role[] }>('/admin/roles')).data.data });

  const create = useMutation({
    mutationFn: async () => api.post('/admin/users', { ...form, roleId: Number(form.roleId) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setOpen(false); toast('success', 'User created'); setForm({ firstName: '', lastName: '', email: '', password: '', roleId: 3 }); },
    onError: (e) => toast('error', apiError(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setDelId(null); toast('success', 'User deleted'); },
    onError: (e) => toast('error', apiError(e)),
  });

  const columns: Column<Row>[] = [
    { header: 'Name', cell: (u) => <div><p className="font-medium">{u.first_name} {u.last_name}</p><p className="text-xs text-slate-400">{u.email}</p></div> },
    { header: 'Role', cell: (u) => <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"><Shield className="h-3 w-3" />{u.role_name}</span> },
    { header: 'Status', cell: (u) => <span className="capitalize text-sm">{u.status}</span> },
    { header: 'Last login', cell: (u) => formatDateTime(u.last_login_at) },
    { header: '', className: 'text-right', cell: (u) => (
      <button onClick={() => setDelId(u.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
    ) },
  ];

  return (
    <div>
      <PageHeader title="User Management" subtitle="Invite team members and assign roles"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add User</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {roles.data?.slice(0, 5).map((r) => (
          <div key={r.id} className="card p-4"><p className="text-2xl font-bold">{r.user_count}</p><p className="text-xs text-slate-500">{r.name}</p></div>
        ))}
      </div>
      <DataTable columns={columns} rows={users.data?.items} loading={users.isLoading} rowKey={(u) => u.id} emptyTitle="No users yet" />

      <Modal open={open} onClose={() => setOpen(false)} title="Add User"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Create</Button></>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Temp password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}>
            {roles.data?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </div>
      </Modal>
      <ConfirmDialog open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => delId && del.mutate(delId)}
        title="Delete user" message="This will permanently remove the user account." loading={del.isPending} />
    </div>
  );
}
