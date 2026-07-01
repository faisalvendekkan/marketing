import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';

interface GBP { id: number; post_type: string; title: string | null; body: string | null; status: string; }
const columns: Column<GBP>[] = [
  { header: 'Title', cell: (p) => <div><p className="font-medium">{p.title || 'Update'}</p><p className="line-clamp-1 text-xs text-slate-400">{p.body}</p></div> },
  { header: 'Type', cell: (p) => <span className="capitalize">{p.post_type}</span> },
  { header: 'Status', cell: (p) => <Badge value={p.status} /> },
];
const fields: FieldDef[] = [
  { name: 'post_type', label: 'Post type', type: 'select', options: ['update','offer','event','product'].map((v) => ({ value: v, label: v })) },
  { name: 'title', label: 'Title' },
  { name: 'body', label: 'Content', type: 'textarea' },
  { name: 'cta_url', label: 'CTA link', type: 'url' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft','scheduled','published'].map((v) => ({ value: v, label: v })) },
];
export default function GoogleBusiness() {
  return <ResourcePage<GBP> title="Google Business Profile" subtitle="Publish updates, offers and events" resource="google-business" columns={columns} fields={fields}
    toForm={(p) => ({ post_type: p.post_type, title: p.title ?? '', body: p.body ?? '', cta_url: '', status: p.status })} />;
}
