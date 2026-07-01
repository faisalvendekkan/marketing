import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';

interface WC { id: number; name: string; message: string | null; status: string; sent_count: number; delivered_count: number; }
const columns: Column<WC>[] = [
  { header: 'Campaign', cell: (c) => <div><p className="font-medium">{c.name}</p><p className="line-clamp-1 text-xs text-slate-400">{c.message}</p></div> },
  { header: 'Status', cell: (c) => <Badge value={c.status} /> },
  { header: 'Sent', cell: (c) => c.sent_count },
  { header: 'Delivered', cell: (c) => c.delivered_count },
];
const fields: FieldDef[] = [
  { name: 'name', label: 'Campaign name' },
  { name: 'message', label: 'Message', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft','scheduled','sending','sent','paused'].map((v) => ({ value: v, label: v })) },
];
export default function WhatsApp() {
  return <ResourcePage<WC> title="WhatsApp Marketing" subtitle="Broadcast messages and templates" resource="whatsapp-campaigns" columns={columns} fields={fields}
    toForm={(c) => ({ name: c.name, message: c.message ?? '', status: c.status })} />;
}
