import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Badge } from '@/components/ui/Badge';
import { Column } from '@/components/common/DataTable';
import { formatDateTime } from '@/lib/utils';
import type { Post } from '@/types';

const PLATFORMS = ['facebook','instagram','linkedin','x','threads','pinterest','google_business','youtube'];
const STATUSES = ['draft','pending_approval','approved','scheduled','published','failed'];

const columns: Column<Post>[] = [
  { header: 'Title', cell: (p) => <div><p className="font-medium">{p.title || 'Untitled'}</p><p className="line-clamp-1 text-xs text-slate-400">{p.body}</p></div> },
  { header: 'Platform', cell: (p) => <span className="capitalize">{p.platform.replace(/_/g,' ')}</span> },
  { header: 'Status', cell: (p) => <Badge value={p.status} /> },
  { header: 'Created', cell: (p) => formatDateTime(p.created_at) },
];

const fields: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'platform', label: 'Platform', type: 'select', options: PLATFORMS.map((p) => ({ value: p, label: p })) },
  { name: 'body', label: 'Content', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s, label: s.replace(/_/g,' ') })) },
];

export default function SocialPosts() {
  return <ResourcePage<Post> title="Content Calendar" subtitle="Draft, schedule and approve social posts"
    resource="posts" columns={columns} fields={fields}
    toForm={(p) => ({ title: p.title ?? '', platform: p.platform, body: p.body ?? '', status: p.status })} />;
}
