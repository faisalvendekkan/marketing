import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';

interface A { id: number; name: string; trigger_type: string; status: string; }
const columns: Column<A>[] = [
  { header: 'Workflow', cell: (a) => <p className="font-medium">{a.name}</p> },
  { header: 'Trigger', cell: (a) => <span className="capitalize">{a.trigger_type.replace(/_/g,' ')}</span> },
  { header: 'Status', cell: (a) => <Badge value={a.status} /> },
];
const fields: FieldDef[] = [
  { name: 'name', label: 'Workflow name' },
  { name: 'trigger_type', label: 'Trigger', type: 'select', options: [
    { value: 'lead_capture', label: 'Lead capture' }, { value: 'email_open', label: 'Email opened' },
    { value: 'form_submit', label: 'Form submitted' }, { value: 'schedule', label: 'Scheduled time' },
    { value: 'campaign_launch', label: 'Campaign launch' },
  ] },
  { name: 'status', label: 'Status', type: 'select', options: ['draft','active','paused'].map((v) => ({ value: v, label: v })) },
];
export default function Automation() {
  return <ResourcePage<A> title="Marketing Automation" subtitle="Trigger-based workflows for leads and campaigns" resource="automations" columns={columns} fields={fields}
    toForm={(a) => ({ name: a.name, trigger_type: a.trigger_type, status: a.status })} />;
}
