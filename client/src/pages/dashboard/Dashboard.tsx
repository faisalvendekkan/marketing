import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Megaphone, CalendarClock, Target, TrendingUp, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import type { DashboardData } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const FUNNEL_COLORS = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#10b981', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<{ data: DashboardData }>('/dashboard')).data.data,
  });

  if (isLoading || !data) return <PageLoader />;
  const { stats } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good to see you, {user?.firstName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here’s what’s happening across your marketing today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Campaigns" value={formatNumber(stats.campaigns.active)} icon={Megaphone} delta={`${stats.campaigns.total} total`} accent="brand" />
        <StatCard title="Pipeline Value" value={formatCurrency(stats.leads.pipelineValue)} icon={TrendingUp} delta={`${stats.leads.total} leads`} accent="emerald" />
        <StatCard title="Scheduled Posts" value={formatNumber(stats.posts.scheduled)} icon={CalendarClock} delta={`${stats.posts.total} total`} accent="sky" />
        <StatCard title="Open Tasks" value={formatNumber(stats.tasks.open)} icon={Target} delta={`${stats.tasks.total} total`} accent="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Marketing Performance" subtitle="Traffic & conversions — last 30 days" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.timeseries} margin={{ left: -18, right: 8 }}>
              <defs>
                <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.12)' }} />
              <Area type="monotone" dataKey="traffic" stroke="#6366f1" fill="url(#t)" strokeWidth={2} name="Traffic" />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#c)" strokeWidth={2} name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Lead Funnel" subtitle="By stage" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.funnel} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.funnel.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {data.funnel.map((f, i) => (
              <span key={f.status} className="inline-flex items-center gap-1.5 capitalize text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }} />
                {f.status} ({f.count})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Lead Sources" subtitle="Where leads come from" />
          {data.sources.length === 0 ? <EmptyState title="No leads yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.sources} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Campaign Overview" subtitle="Budget usage" />
          <div className="space-y-3">
            {data.campaigns.length === 0 && <EmptyState title="No campaigns yet" />}
            {data.campaigns.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{c.name}</span>
                  <Badge value={c.status} />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, c.budget_used)}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{formatCurrency(c.spent)} of {formatCurrency(c.budget)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest actions" />
          <div className="space-y-3">
            {data.activity.length === 0 && <EmptyState title="No activity yet" />}
            {data.activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                <div className="flex-1">
                  <p className="text-sm">{a.description || a.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-400">{a.user_name?.trim() || 'System'} · {formatDateTime(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming posts + AI suggestions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Upcoming Posts" subtitle="Next in your calendar" />
          {data.upcoming.length === 0 ? <EmptyState title="Nothing scheduled" description="Create a post to see it here." /> : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.upcoming.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p.title || 'Untitled post'}</p>
                    <p className="text-xs capitalize text-slate-400">{p.platform.replace(/_/g, ' ')} · {formatDateTime(p.scheduled_at)}</p>
                  </div>
                  <Badge value={p.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5" /><h3 className="font-semibold">AI Suggestions</h3></div>
          <ul className="mt-3 space-y-2.5 text-sm text-brand-50">
            <li>• Post 3–5× per week on Instagram to sustain reach.</li>
            <li>• {stats.leads.total > 0 ? `Follow up on ${stats.leads.total} leads in your pipeline.` : 'Add a lead-capture form to start collecting leads.'}</li>
            <li>• Generate a blog article to boost organic SEO traffic.</li>
            <li>• Review campaigns using over 80% of budget.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
