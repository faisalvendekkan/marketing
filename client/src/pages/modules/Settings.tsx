import { useEffect, useState } from 'react';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Settings() {
  const toast = useToast();
  const [company, setCompany] = useState<Record<string, string>>({});
  const [brand, setBrand] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    Promise.all([api.get('/settings/company'), api.get('/settings/brand-kit')])
      .then(([c, b]) => {
        const cd = c.data.data ?? {};
        setCompany({ name: cd.name ?? '', website: cd.website ?? '', industry: cd.industry ?? '', phone: cd.phone ?? '', email: cd.email ?? '', city: cd.city ?? '', country: cd.country ?? '', timezone: cd.timezone ?? 'UTC' });
        const bd = b.data.data ?? {};
        setBrand({ primaryColor: bd.primary_color ?? '#6366F1', secondaryColor: bd.secondary_color ?? '#0EA5E9', accentColor: bd.accent_color ?? '#F59E0B', brandVoice: bd.brand_voice ?? '', tagline: bd.tagline ?? '' });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const saveCompany = async () => {
    setSaving('company');
    try { await api.put('/settings/company', company); toast('success', 'Company saved'); }
    catch (e) { toast('error', apiError(e)); } finally { setSaving(''); }
  };
  const saveBrand = async () => {
    setSaving('brand');
    try { await api.put('/settings/brand-kit', brand); toast('success', 'Brand kit saved'); }
    catch (e) { toast('error', apiError(e)); } finally { setSaving(''); }
  };

  if (loading) return null;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company profile, brand kit and integrations" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Company Information" />
          <div className="space-y-3">
            <Input label="Company name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Website" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
              <Input label="Industry" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
              <Input label="Email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
              <Input label="Country" value={company.country} onChange={(e) => setCompany({ ...company, country: e.target.value })} />
            </div>
          </div>
          <div className="mt-4"><Button onClick={saveCompany} loading={saving === 'company'}>Save company</Button></div>
        </Card>

        <Card>
          <CardHeader title="Brand Kit" subtitle="Colors and voice used across AI content" />
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((k) => (
                <div key={k}>
                  <label className="label capitalize">{k.replace('Color', '')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand[k]} onChange={(e) => setBrand({ ...brand, [k]: e.target.value })} className="h-10 w-12 rounded-lg border border-slate-300 dark:border-slate-700" />
                    <input value={brand[k]} onChange={(e) => setBrand({ ...brand, [k]: e.target.value })} className="input" />
                  </div>
                </div>
              ))}
            </div>
            <Input label="Tagline" value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
            <Textarea label="Brand voice" value={brand.brandVoice} onChange={(e) => setBrand({ ...brand, brandVoice: e.target.value })} />
          </div>
          <div className="mt-4"><Button onClick={saveBrand} loading={saving === 'brand'}>Save brand kit</Button></div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Integrations" subtitle="Configure via environment variables on your server" />
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {['OpenAI API (OPENAI_API_KEY)', 'Google OAuth (GOOGLE_CLIENT_ID)', 'SMTP Email (SMTP_HOST)', 'Meta / Facebook (META_APP_ID)', 'WhatsApp (WHATSAPP_TOKEN)', 'Anthropic (ANTHROPIC_API_KEY)'].map((s) => (
            <div key={s} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="font-medium">{s.split(' (')[0]}</p>
              <p className="text-xs text-slate-400">{s.match(/\(([^)]+)\)/)?.[1]}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
