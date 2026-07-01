import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';

interface EC { id: number; name: string; subject: string; status: string; sent_count: number; open_count: number; }
const columns: Column<EC>[] = [
  { header: 'Campaign', cell: (c) => <div><p className="font-medium">{c.name}</p><p className="text-xs text-slate-400">{c.subject}</p></div> },
  { header: 'Status', cell: (c) => <Badge value={c.status} /> },
  { header: 'Sent', cell: (c) => c.sent_count },
  { header: 'Opens', cell: (c) => c.open_count },
];
const fields: FieldDef[] = [
  { name: 'name', label: 'Campaign name' },
  { name: 'subject', label: 'Subject line' },
  { name: 'from_name', label: 'From name' },
  { name: 'from_email', label: 'From email', type: 'email' },
  { name: 'html_body', label: 'Body', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft','scheduled','sending','sent','paused'].map((v) => ({ value: v, label: v })) },
];
export default function Email() {
  return <ResourcePage<EC> title="Email Marketing" subtitle="Build, schedule and measure email campaigns" resource="email-campaigns" columns={columns} fields={fields}
    toForm={(c) => ({ name: c.name, subject: c.subject, from_name: '', from_email: '', html_body: '', status: c.status })} />;
}
