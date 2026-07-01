import { z } from 'zod';

export const campaignCreate = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  objective: z.string().max(120).optional(),
  type_id: z.number().int().positive().optional(),
  status: z.enum(['draft','scheduled','active','paused','completed','archived']).optional(),
  budget: z.number().nonnegative().optional(),
  spent: z.number().nonnegative().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
export const campaignUpdate = campaignCreate.partial();

export const leadCreate = z.object({
  full_name: z.string().min(1).max(160),
  email: z.string().email().max(180).optional(),
  phone: z.string().max(40).optional(),
  company_name: z.string().max(160).optional(),
  message: z.string().max(5000).optional(),
  source_id: z.number().int().positive().optional(),
  campaign_id: z.number().int().positive().optional(),
  value: z.number().nonnegative().optional(),
  status: z.enum(['new','contacted','qualified','proposal','won','lost']).optional(),
});
export const leadUpdate = leadCreate.partial();

export const postCreate = z.object({
  platform: z.enum(['facebook','instagram','linkedin','x','threads','pinterest','google_business','youtube']),
  title: z.string().max(200).optional(),
  body: z.string().max(20000).optional(),
  link: z.string().url().max(500).optional(),
  tags: z.string().max(255).optional(),
  campaign_id: z.number().int().positive().optional(),
  media_id: z.number().int().positive().optional(),
  status: z.enum(['draft','pending_approval','approved','scheduled','published','failed']).optional(),
});
export const postUpdate = postCreate.partial();

export const taskCreate = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  assigned_to: z.number().int().positive().optional(),
  campaign_id: z.number().int().positive().optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  status: z.enum(['todo','in_progress','review','done']).optional(),
  due_date: z.string().optional(),
});
export const taskUpdate = taskCreate.partial();

export const contentCreate = z.object({
  title: z.string().min(1).max(200),
  content_type: z.string().max(60).optional(),
  body: z.string().max(50000).optional(),
  language: z.string().max(20).optional(),
  tags: z.string().max(255).optional(),
  status: z.enum(['draft','approved','archived']).optional(),
});
export const contentUpdate = contentCreate.partial();

export const seoProjectCreate = z.object({
  name: z.string().min(1).max(160),
  domain: z.string().min(1).max(200),
  location: z.string().max(120).optional(),
  language: z.string().max(20).optional(),
});
export const seoProjectUpdate = seoProjectCreate.partial();

export const emailCampaignCreate = z.object({
  name: z.string().min(1).max(180),
  subject: z.string().min(1).max(255),
  from_name: z.string().max(120).optional(),
  from_email: z.string().email().max(180).optional(),
  html_body: z.string().max(200000).optional(),
  template_id: z.number().int().positive().optional(),
  list_id: z.number().int().positive().optional(),
  status: z.enum(['draft','scheduled','sending','sent','paused']).optional(),
});
export const emailCampaignUpdate = emailCampaignCreate.partial();

export const whatsappCampaignCreate = z.object({
  name: z.string().min(1).max(180),
  message: z.string().max(5000).optional(),
  template_id: z.number().int().positive().optional(),
  status: z.enum(['draft','scheduled','sending','sent','paused']).optional(),
});
export const whatsappCampaignUpdate = whatsappCampaignCreate.partial();

export const blogCreate = z.object({
  title: z.string().min(1).max(220),
  slug: z.string().min(1).max(240),
  excerpt: z.string().max(500).optional(),
  body: z.string().max(200000).optional(),
  meta_title: z.string().max(180).optional(),
  meta_description: z.string().max(320).optional(),
  keywords: z.string().max(255).optional(),
  language: z.string().max(20).optional(),
  status: z.enum(['draft','review','published','archived']).optional(),
});
export const blogUpdate = blogCreate.partial();

export const automationCreate = z.object({
  name: z.string().min(1).max(180),
  trigger_type: z.string().min(1).max(80),
  status: z.enum(['active','paused','draft']).optional(),
});
export const automationUpdate = automationCreate.partial();

export const gbpCreate = z.object({
  post_type: z.enum(['update','offer','event','product']).optional(),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  cta_type: z.string().max(40).optional(),
  cta_url: z.string().url().max(500).optional(),
  status: z.enum(['draft','scheduled','published','failed']).optional(),
});
export const gbpUpdate = gbpCreate.partial();

export const reportCreate = z.object({
  name: z.string().min(1).max(180),
  type: z.enum(['pdf','excel','csv']).optional(),
  status: z.enum(['pending','ready','failed']).optional(),
});
export const reportUpdate = reportCreate.partial();

export const keywordCreate = z.object({
  project_id: z.number().int().positive(),
  keyword: z.string().min(1).max(200),
  search_volume: z.number().int().nonnegative().optional(),
  difficulty: z.number().int().min(0).max(100).optional(),
  intent: z.enum(['informational','navigational','commercial','transactional']).optional(),
});
export const keywordUpdate = keywordCreate.partial();
