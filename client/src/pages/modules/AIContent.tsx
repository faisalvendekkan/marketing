import { useState } from 'react';
import { Sparkles, Copy, Check, Save } from 'lucide-react';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea, Input } from '@/components/ui/Input';

const FEATURES = [
  { v: 'blog', l: 'Blog Article' }, { v: 'facebook_post', l: 'Facebook Post' },
  { v: 'instagram_caption', l: 'Instagram Caption' }, { v: 'linkedin', l: 'LinkedIn Post' },
  { v: 'twitter', l: 'Twitter / X' }, { v: 'threads', l: 'Threads' },
  { v: 'google_business_post', l: 'Google Business Post' }, { v: 'product_description', l: 'Product Description' },
  { v: 'email', l: 'Email' }, { v: 'newsletter', l: 'Newsletter' },
  { v: 'landing_page', l: 'Landing Page' }, { v: 'website_content', l: 'Website Content' },
  { v: 'ad_copy', l: 'Ad Copy' }, { v: 'headline', l: 'Headlines' }, { v: 'cta', l: 'CTAs' },
  { v: 'taglines', l: 'Taglines' }, { v: 'meta_title', l: 'Meta Title' },
  { v: 'meta_description', l: 'Meta Description' }, { v: 'seo_faqs', l: 'SEO FAQs' },
];
const TONES = ['professional', 'friendly', 'casual', 'persuasive', 'inspirational', 'witty', 'formal'];
const ACTIONS = [
  { v: 'generate', l: 'Generate' }, { v: 'rewrite', l: 'Rewrite' }, { v: 'expand', l: 'Expand' },
  { v: 'summarize', l: 'Summarize' }, { v: 'translate', l: 'Translate' },
];

export default function AIContent() {
  const toast = useToast();
  const [feature, setFeature] = useState('instagram_caption');
  const [action, setAction] = useState('generate');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('en');
  const [prompt, setPrompt] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return toast('error', 'Please describe what you need.');
    setLoading(true); setResult('');
    try {
      const res = await api.post('/ai/generate', { feature, action, tone, language, prompt, brandVoice: brandVoice || undefined });
      setResult(res.data.data.content);
    } catch (e) { toast('error', apiError(e)); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const saveToLibrary = async () => {
    try {
      await api.post('/content', { title: `${FEATURES.find((f) => f.v === feature)?.l} — ${new Date().toLocaleDateString()}`, body: result, content_type: feature, language });
      toast('success', 'Saved to content library');
    } catch (e) { toast('error', apiError(e)); }
  };

  return (
    <div>
      <PageHeader title="AI Content Creator" subtitle="Generate on-brand marketing copy in English & Malayalam" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Content type" value={feature} onChange={(e) => setFeature(e.target.value)}>
              {FEATURES.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
            </Select>
            <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
              {ACTIONS.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </Select>
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="ml">Malayalam</option>
            </Select>
          </div>
          <Textarea label="What do you want to create?" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A caption announcing our summer sale, 30% off all products, ends Sunday" />
          <Input label="Brand voice (optional)" value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Confident, modern, growth-focused" />
          <Button onClick={generate} loading={loading} className="w-full"><Sparkles className="h-4 w-4" />Generate</Button>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Result</h3>
            {result && (
              <div className="flex gap-1">
                <button onClick={copy} className="btn-ghost px-2.5 py-1.5 text-xs">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                <button onClick={saveToLibrary} className="btn-ghost px-2.5 py-1.5 text-xs"><Save className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="flex-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
            {loading ? 'Generating…' : result || <span className="text-slate-400">Your generated content will appear here. Requires an AI API key configured in Settings.</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
