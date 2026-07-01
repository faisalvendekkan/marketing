import { ResourcePage, FieldDef } from '@/components/common/ResourcePage';
import { Column } from '@/components/common/DataTable';
import { formatDate } from '@/lib/utils';

interface Proj { id: number; name: string; domain: string; location: string | null; language: string; created_at: string; }
const columns: Column<Proj>[] = [
  { header: 'Project', cell: (p) => <p className="font-medium">{p.name}</p> },
  { header: 'Domain', cell: (p) => <a href={`https://${p.domain}`} target="_blank" className="text-brand-600 hover:underline">{p.domain}</a> },
  { header: 'Location', cell: (p) => p.location || '—' },
  { header: 'Created', cell: (p) => formatDate(p.created_at) },
];
const fields: FieldDef[] = [
  { name: 'name', label: 'Project name' },
  { name: 'domain', label: 'Domain (example.com)' },
  { name: 'location', label: 'Target location' },
  { name: 'language', label: 'Language', type: 'select', options: [{ value: 'en', label: 'English' }, { value: 'ml', label: 'Malayalam' }] },
];
export default function SEO() {
  return <ResourcePage<Proj> title="SEO Projects" subtitle="Track domains, keywords and rankings" resource="seo-projects" columns={columns} fields={fields}
    toForm={(p) => ({ name: p.name, domain: p.domain, location: p.location ?? '', language: p.language })} />;
}
