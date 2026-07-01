import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { execute } from '../config/db';

export interface GenerateOptions {
  feature: string;          // e.g. 'blog', 'instagram_caption', 'meta_description'
  prompt: string;           // user's topic / input
  tone?: string;            // e.g. 'professional', 'friendly'
  language?: string;        // 'en' | 'ml'
  brandVoice?: string;
  action?: 'generate' | 'rewrite' | 'expand' | 'summarize' | 'translate';
  maxTokens?: number;
}

export interface GenerateResult {
  content: string;
  model: string;
  provider: string;
  tokensUsed?: number;
}

const LANG_NAMES: Record<string, string> = { en: 'English', ml: 'Malayalam' };

const FEATURE_GUIDE: Record<string, string> = {
  blog: 'Write a well-structured blog article with a title, intro, subheadings and conclusion.',
  facebook_post: 'Write an engaging Facebook post with a hook and a call to action. Keep it concise.',
  instagram_caption: 'Write an Instagram caption with relevant emojis and 5-10 hashtags.',
  linkedin: 'Write a professional LinkedIn post with a strong opening line and clear insight.',
  twitter: 'Write a punchy tweet under 280 characters.',
  threads: 'Write a casual, conversational Threads post.',
  google_business_post: 'Write a short Google Business Profile update with a call to action.',
  product_description: 'Write a persuasive product description highlighting benefits and features.',
  email: 'Write a marketing email with a subject line, greeting, body and sign-off.',
  newsletter: 'Write a newsletter section with a headline and engaging body copy.',
  landing_page: 'Write landing page copy: headline, subheadline, benefits, and CTA.',
  website_content: 'Write clear, benefit-driven website section copy.',
  ad_copy: 'Write high-converting ad copy with a headline and body.',
  headline: 'Write 5 attention-grabbing headline options.',
  cta: 'Write 5 short, compelling call-to-action phrases.',
  taglines: 'Write 5 memorable brand tagline options.',
  meta_title: 'Write an SEO meta title under 60 characters.',
  meta_description: 'Write an SEO meta description under 155 characters.',
  seo_faqs: 'Write 5 SEO-friendly FAQs with concise answers.',
  video_script: 'Write a video script with scene directions and voiceover.',
  reels_script: 'Write a short-form Reels/Shorts script with a strong hook.',
};

function buildSystemPrompt(o: GenerateOptions): string {
  const lang = LANG_NAMES[o.language ?? 'en'] ?? 'English';
  const guide = FEATURE_GUIDE[o.feature] ?? 'Produce high-quality marketing copy for the given request.';
  const parts = [
    'You are an expert marketing copywriter for the Abilix AI Marketing Studio.',
    guide,
    `Write in ${lang}.`,
  ];
  if (o.tone) parts.push(`Use a ${o.tone} tone.`);
  if (o.brandVoice) parts.push(`Match this brand voice: ${o.brandVoice}`);
  if (o.action && o.action !== 'generate') {
    const map: Record<string, string> = {
      rewrite: 'Rewrite the provided text to improve clarity and impact.',
      expand: 'Expand the provided text with more detail and depth.',
      summarize: 'Summarize the provided text concisely.',
      translate: `Translate the provided text into ${lang}.`,
    };
    parts.push(map[o.action]);
  }
  parts.push('Return only the requested content without preamble.');
  return parts.join(' ');
}

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }

async function callOpenAI(messages: ChatMessage[], maxTokens: number): Promise<GenerateResult> {
  const resp = await fetch(`${env.ai.openaiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.ai.openaiKey}`,
    },
    body: JSON.stringify({
      model: env.ai.openaiModel,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw ApiError.badRequest(`AI provider error: ${resp.status} ${text.slice(0, 200)}`);
  }
  const data = (await resp.json()) as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens?: number };
    model: string;
  };
  return {
    content: data.choices[0]?.message?.content?.trim() ?? '',
    model: data.model,
    provider: 'openai',
    tokensUsed: data.usage?.total_tokens,
  };
}

async function callAnthropic(system: string, user: string, maxTokens: number): Promise<GenerateResult> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ai.anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ai.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw ApiError.badRequest(`AI provider error: ${resp.status} ${text.slice(0, 200)}`);
  }
  const data = (await resp.json()) as {
    content: { text: string }[];
    usage?: { input_tokens: number; output_tokens: number };
    model: string;
  };
  return {
    content: data.content[0]?.text?.trim() ?? '',
    model: data.model,
    provider: 'anthropic',
    tokensUsed: data.usage ? data.usage.input_tokens + data.usage.output_tokens : undefined,
  };
}

/** Provider-agnostic generation. Chooses provider from env; validates configuration. */
export async function generate(
  opts: GenerateOptions,
  ctx: { companyId: number | null; userId: number | null }
): Promise<GenerateResult> {
  const system = buildSystemPrompt(opts);
  const maxTokens = opts.maxTokens ?? 1200;

  let result: GenerateResult;
  const provider = env.ai.provider;

  if (provider === 'anthropic') {
    if (!env.ai.anthropicKey) throw ApiError.badRequest('ANTHROPIC_API_KEY is not configured');
    result = await callAnthropic(system, opts.prompt, maxTokens);
  } else {
    if (!env.ai.openaiKey) throw ApiError.badRequest('OPENAI_API_KEY is not configured');
    result = await callOpenAI(
      [
        { role: 'system', content: system },
        { role: 'user', content: opts.prompt },
      ],
      maxTokens
    );
  }

  // Persist prompt history (best-effort).
  if (ctx.companyId != null) {
    await execute(
      `INSERT INTO prompt_history (company_id, user_id, feature, prompt, result, tone, language, model, tokens_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ctx.companyId,
        ctx.userId,
        opts.feature,
        opts.prompt,
        result.content,
        opts.tone ?? null,
        opts.language ?? 'en',
        result.model,
        result.tokensUsed ?? null,
      ]
    ).catch(() => undefined);
  }

  return result;
}

export function isConfigured(): boolean {
  return env.ai.provider === 'anthropic' ? !!env.ai.anthropicKey : !!env.ai.openaiKey;
}
