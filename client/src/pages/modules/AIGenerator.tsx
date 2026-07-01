import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';

interface Preset { value: string; label: string; placeholder: string; }

export function AIGenerator({ title, subtitle, presets, defaultFeature }: { title: string; subtitle: string; presets: Preset[]; defaultFeature: string }) {
  const toast = useToast();
  const [feature, setFeature] = useState(defaultFeature);
  const [language, setLanguage] = useState('en');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const active = presets.find((p) => p.value === feature);

  const run = async () => {
    if (!prompt.trim()) return toast('error', 'Please enter a description.');
    setLoading(true); setResult('');
    try {
      const res = await api.post('/ai/generate', { feature, prompt, language, maxTokens: 1500 });
      setResult(res.data.data.content);
    } catch (e) { toast('error', apiError(e)); } finally { setLoading(false); }
  };
  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Select label="Template" value={feature} onChange={(e) => setFeature(e.target.value)}>
            {presets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option><option value="ml">Malayalam</option>
          </Select>
          <Textarea label="Describe what you need" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={active?.placeholder} />
          <Button onClick={run} loading={loading} className="w-full"><Sparkles className="h-4 w-4" />Generate</Button>
        </Card>
        <Card className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Result</h3>
            {result && <button onClick={copy} className="btn-ghost px-2.5 py-1.5 text-xs">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>}
          </div>
          <div className="flex-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
            {loading ? 'Generating…' : result || <span className="text-slate-400">Output appears here. Requires an AI API key configured on the server.</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
