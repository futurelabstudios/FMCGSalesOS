import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';

import {
  APP_OPTIONS,
  Channel,
  Role,
  Timeframe,
  buildPrediagnosis,
  getDashboard,
} from './data';
import { answerSalesQuestion, summarizePrediagnosis } from './services/ai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const filterSchema = z.object({
  role: z.enum(APP_OPTIONS.roles).default('regional_manager'),
  region: z.string().default('West'),
  channel: z.enum(APP_OPTIONS.channels).default('All'),
  timeframe: z.enum(APP_OPTIONS.timeframes).default('MTD'),
});

const loginSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.enum(APP_OPTIONS.roles),
  region: z.string().min(2).max(30),
});

const askSchema = z.object({
  question: z.string().min(4).max(1000),
  role: z.enum(APP_OPTIONS.roles),
  region: z.string().min(2).max(30),
  channel: z.enum(APP_OPTIONS.channels).default('All'),
  timeframe: z.enum(APP_OPTIONS.timeframes).default('MTD'),
});

function parseFilters(query: Record<string, unknown>): {
  role: Role;
  region: string;
  channel: Channel;
  timeframe: Timeframe;
} {
  const parsed = filterSchema.safeParse(query);

  if (!parsed.success) {
    return {
      role: 'regional_manager',
      region: 'West',
      channel: 'All',
      timeframe: 'MTD',
    };
  }

  return parsed.data;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'FMCG Sales OS API' });
});

app.get('/api/meta/options', (_req, res) => {
  res.json(APP_OPTIONS);
});

app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid login payload',
      issues: parsed.error.issues,
    });
    return;
  }

  const session = {
    token: `salesos_${Buffer.from(`${parsed.data.name}:${Date.now()}`).toString('base64')}`,
    user: {
      name: parsed.data.name,
      role: parsed.data.role,
      region: parsed.data.region,
    },
  };

  res.json(session);
});

app.get('/api/dashboard', (req, res) => {
  const filters = parseFilters(req.query as Record<string, unknown>);
  const dashboard = getDashboard(filters.role, filters.region, filters.channel, filters.timeframe);

  res.json(dashboard);
});

app.get('/api/workspace', async (req, res) => {
  const startedAt = Date.now();
  const filters = parseFilters(req.query as Record<string, unknown>);
  const dashboard = getDashboard(filters.role, filters.region, filters.channel, filters.timeframe);
  const prediagnosis = buildPrediagnosis(dashboard);
  const summary = await summarizePrediagnosis(dashboard, prediagnosis);

  res.json({
    dashboard,
    prediagnosis: {
      ...prediagnosis,
      aiSummary: summary.summary,
      aiSource: summary.source,
    },
    meta: {
      fetchedAt: new Date().toISOString(),
      responseMs: Date.now() - startedAt,
    },
  });
});

app.get('/api/prediagnosis', async (req, res) => {
  const filters = parseFilters(req.query as Record<string, unknown>);
  const dashboard = getDashboard(filters.role, filters.region, filters.channel, filters.timeframe);
  const prediagnosis = buildPrediagnosis(dashboard);
  const summary = await summarizePrediagnosis(dashboard, prediagnosis);

  res.json({
    ...prediagnosis,
    aiSummary: summary.summary,
    aiSource: summary.source,
  });
});

app.post('/api/ai/ask', async (req, res) => {
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid ask payload',
      issues: parsed.error.issues,
    });
    return;
  }

  const dashboard = getDashboard(
    parsed.data.role,
    parsed.data.region,
    parsed.data.channel,
    parsed.data.timeframe,
  );

  const prediagnosis = buildPrediagnosis(dashboard);
  const answer = await answerSalesQuestion({
    question: parsed.data.question,
    dashboard,
    prediagnosis,
  });

  res.json({
    answer: answer.answer,
    source: answer.source,
    timestamp: new Date().toISOString(),
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Unexpected server error',
  });
});

app.listen(PORT, () => {
  console.log(`Sales OS API running at http://localhost:${PORT}`);
});
