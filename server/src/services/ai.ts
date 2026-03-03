import OpenAI from 'openai';

import { DashboardData, Prediagnosis } from '../data';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 2500);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface AskInput {
  question: string;
  dashboard: DashboardData;
  prediagnosis: Prediagnosis;
}

function buildFallbackAnswer(question: string, dashboard: DashboardData, prediagnosis: Prediagnosis): string {
  const normalized = question.toLowerCase();
  const topKpi = [...dashboard.kpis].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const topAlert = prediagnosis.alerts[0];

  if (normalized.includes('distributor') || normalized.includes('payment')) {
    const riskDistributors = dashboard.distributors
      .filter((item) => item.paymentStatus !== 'Healthy')
      .slice(0, 3)
      .map((item) => `${item.name} (${item.paymentStatus}, ${item.outstandingDays} DSO)`);

    if (riskDistributors.length === 0) {
      return 'Distributor network is healthy in this view. No payment watchlist distributor is currently flagged.';
    }

    return `Priority distributors to review: ${riskDistributors.join(', ')}. Suggested action: run 48-hour receivables follow-up with dispatch-linked commitments.`;
  }

  if (normalized.includes('logistics') || normalized.includes('stockout') || normalized.includes('otif')) {
    const riskyNodes = dashboard.logistics
      .filter((node) => node.risk !== 'Low')
      .map((node) => `${node.node} (fill ${node.fillRate}%, delay ${node.avgDelayHours}h)`);

    if (riskyNodes.length === 0) {
      return 'Logistics indicators are stable across nodes. Keep daily monitoring on fill rate and OTIF trends.';
    }

    return `Logistics risk centers: ${riskyNodes.join(', ')}. Immediate step: reroute urgent loads and review route-level dispatch cutoffs.`;
  }

  if (normalized.includes('scheme') || normalized.includes('trade')) {
    const topScheme = [...dashboard.schemePerformance].sort((a, b) => b.uplift - a.uplift)[0];
    return `Best-performing scheme is ${topScheme.scheme} with ${topScheme.uplift}% uplift and ${topScheme.redemption}% redemption. Expand this in top velocity beats first.`;
  }

  if (normalized.includes('summary') || normalized.includes('overall') || normalized.includes('status')) {
    return `${prediagnosis.headline} Most volatile KPI right now is ${topKpi.label} (${topKpi.value}${topKpi.unit}, delta ${topKpi.delta}).`;
  }

  return `Based on current data, immediate focus should be: ${topAlert.title}. Recommended move: ${topAlert.recommendation}`;
}

function fallbackSummary(prediagnosis: Prediagnosis): string {
  return `${prediagnosis.headline} Focus on: ${prediagnosis.alerts
    .slice(0, 2)
    .map((alert) => alert.title)
    .join('; ')}.`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = OPENAI_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI request timed out')), timeoutMs);
    }),
  ]);
}

export async function answerSalesQuestion(input: AskInput): Promise<{ answer: string; source: 'openai' | 'rule' }> {
  const { question, dashboard, prediagnosis } = input;

  if (!openai) {
    return {
      answer: buildFallbackAnswer(question, dashboard, prediagnosis),
      source: 'rule',
    };
  }

  try {
    const context = {
      user: dashboard.user,
      filters: dashboard.filters,
      kpis: dashboard.kpis,
      topLogisticsRisks: dashboard.logistics.filter((item) => item.risk !== 'Low'),
      watchlistDistributors: dashboard.distributors.filter((item) => item.paymentStatus !== 'Healthy'),
      salesEasySummary: dashboard.salesEasy.summary,
      prediagnosis,
    };

    const response = await withTimeout(
      openai.responses.create({
        model: MODEL,
        input: [
          {
            role: 'system',
            content:
              'You are SalesOS Copilot for a fast-moving FMCG organization in India. Give crisp, action-oriented responses grounded in the provided data. Include quantified recommendations and prioritize what to do in the next 24-72 hours.',
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nData context:\n${JSON.stringify(context, null, 2)}`,
          },
        ],
      }),
    );

    const answer = response.output_text?.trim();
    if (!answer) {
      throw new Error('OpenAI returned an empty response');
    }

    return { answer, source: 'openai' };
  } catch {
    return {
      answer: buildFallbackAnswer(question, dashboard, prediagnosis),
      source: 'rule',
    };
  }
}

export async function summarizePrediagnosis(
  dashboard: DashboardData,
  prediagnosis: Prediagnosis,
): Promise<{ summary: string; source: 'openai' | 'rule' }> {
  if (!openai) {
    return {
      source: 'rule',
      summary: fallbackSummary(prediagnosis),
    };
  }

  try {
    const response = await withTimeout(
      openai.responses.create({
        model: MODEL,
        input: [
          {
            role: 'system',
            content:
              'You are an FMCG sales planning analyst. Summarize risks in 2-3 concise sentences with clear management action priority.',
          },
          {
            role: 'user',
            content: `Dashboard snapshot:\n${JSON.stringify(
              {
                user: dashboard.user,
                filters: dashboard.filters,
                kpis: dashboard.kpis,
                logistics: dashboard.logistics,
                distributors: dashboard.distributors,
                alerts: prediagnosis.alerts,
              },
              null,
              2,
            )}`,
          },
        ],
      }),
    );

    const summary = response.output_text?.trim();
    if (!summary) {
      throw new Error('OpenAI returned empty summary');
    }

    return { source: 'openai', summary };
  } catch {
    return {
      source: 'rule',
      summary: fallbackSummary(prediagnosis),
    };
  }
}
