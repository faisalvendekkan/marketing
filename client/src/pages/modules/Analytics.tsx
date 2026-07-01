import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/common/EmptyState';

interface AnalyticsData {
  timeseries: { date: string; traffic: number; conversions: number }[];
  funnel: { status: string; count: number }[];
  sources: { source: string; count: number }[];
}

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await api.get<{ data: AnalyticsData }>('/analytics')).data.data,
  });
  if (isLoading || !data) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Traffic, conversions and lead performance" />
      <div className="space-y-6">
        <Card>
          <CardHeader title="Traffic & Conversions" subtitle="Last 30 days" />
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data.timeseries} margin={{ left: -18 }}>
              <defs>
                <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Area type="monotone" dataKey="traffic" stroke="#6366f1" fill="url(#a1)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#a2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Lead Sources" />
            {data.sources.length === 0 ? <EmptyState title="No data yet" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.sources} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                  <XAxis dataKey="source" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card>
            <CardHeader title="Lead Funnel" />
            <div className="space-y-3 py-2">
              {data.funnel.map((f) => {
                const max = Math.max(...data.funnel.map((x) => x.count), 1);
                return (
                  <div key={f.status}>
                    <div className="mb-1 flex justify-between text-sm capitalize"><span>{f.status}</span><span className="font-semibold">{f.count}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${(f.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
