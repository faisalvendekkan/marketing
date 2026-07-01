import { z } from 'zod';

export const generateSchema = z.object({
  feature: z.string().min(1).max(60),
  prompt: z.string().min(1).max(8000),
  tone: z.string().max(40).optional(),
  language: z.enum(['en', 'ml']).optional(),
  brandVoice: z.string().max(2000).optional(),
  action: z.enum(['generate', 'rewrite', 'expand', 'summarize', 'translate']).optional(),
  maxTokens: z.number().int().min(64).max(4000).optional(),
});
