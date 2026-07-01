import { useState } from 'react';
import { FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';

type Dataset = 'leads' | 'campaigns' | 'posts';

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const toast = useToast();
  const [dataset, setDataset] = useState<Dataset>('leads');
  const [loading, setLoading] = useState(false);

  const fetchRows = async (): Promise<Record<string, unknown>[]> => {
    const res = await api.get(`/${dataset}`, { params: { pageSize: 100 } });
    return res.data.data.items;
  };

  const exportCsv = async () => {
    setLoading(true);
    try {
      const rows = await fetchRows();
      if (rows.length === 0) return toast('info', 'No data to export');
      download(toCsv(rows), `${dataset}-report.csv`, 'text/csv');
      toast('success', 'CSV exported');
    } catch (e) { toast('error', apiError(e)); } finally { setLoading(false); }
  };

  const exportJson = async () => {
    setLoading(true);
    try {
      const rows = await fetchRows();
      download(JSON.stringify(rows, null, 2), `${dataset}-report.json`, 'application/json');
      toast('success', 'Data exported');
    } catch (e) { toast('error', apiError(e)); } finally { setLoading(false); }
  };

  const print = async () => {
    setLoading(true);
    try {
      const rows = await fetchRows();
      const headers = rows[0] ? Object.keys(rows[0]) : [];
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<html><head><title>${dataset} report</title>
        <style>body{font-family:Inter,sans-serif;padding:24px}h1{text-transform:capitalize}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}th{background:#f8fafc}</style>
        </head><body><h1>${dataset} report</h1><p>${new Date().toLocaleString()}</p>
        <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>
        </body></html>`);
      w.document.close(); w.print();
    } catch (e) { toast('error', apiError(e)); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Export your data as CSV, JSON or printable PDF" />
      <Card className="max-w-xl">
        <CardHeader title="Generate a report" subtitle="Choose a dataset and format" />
        <div className="space-y-4">
          <Select label="Dataset" value={dataset} onChange={(e) => setDataset(e.target.value as Dataset)}>
            <option value="leads">Leads</option>
            <option value="campaigns">Campaigns</option>
            <option value="posts">Social Posts</option>
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportCsv} loading={loading}><FileDown className="h-4 w-4" />Export CSV</Button>
            <Button variant="ghost" onClick={exportJson} loading={loading}><FileSpreadsheet className="h-4 w-4" />Export JSON</Button>
            <Button variant="ghost" onClick={print} loading={loading}><Printer className="h-4 w-4" />Print / PDF</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
