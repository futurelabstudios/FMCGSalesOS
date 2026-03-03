import {
  Bot,
  Building2,
  CalendarRange,
  CircleAlert,
  LogOut,
  RefreshCw,
  Send,
  ShieldAlert,
  TrendingUp,
  Truck,
  UserCircle2,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { askCopilot, fetchWorkspace } from '../lib/api';
import type { Filters } from '../lib/api';
import type {
  AppOptions,
  DashboardData,
  Prediagnosis,
  Role,
  SessionUser,
  Timeframe,
} from '../types/salesos';

interface DashboardViewProps {
  options: AppOptions;
  session: SessionUser;
  onLogout: () => void;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  ts: string;
  source?: 'openai' | 'rule';
}

interface TopicPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
}

const ROLE_LABEL: Record<Role, string> = {
  salesperson: 'Salesperson',
  area_manager: 'Area Manager',
  regional_manager: 'Regional Manager',
  trade_marketing_manager: 'Trade Marketing Manager',
};

const TOPIC_PROMPTS: TopicPrompt[] = [
  {
    id: 'sales',
    title: 'Sales Performance',
    description: 'Target gap, momentum, and closures.',
    prompt: 'Give me a crisp sales performance summary and what I should do in the next 48 hours.',
    icon: TrendingUp,
  },
  {
    id: 'distributor',
    title: 'Distributor Health',
    description: 'Collections, stock, and risk.',
    prompt: 'Which distributors need immediate intervention and what exact actions should I take?',
    icon: Building2,
  },
  {
    id: 'logistics',
    title: 'Logistics Risk',
    description: 'OTIF, delays, and stockout prevention.',
    prompt: 'Where are logistics bottlenecks and what should I escalate now?',
    icon: Truck,
  },
  {
    id: 'trade',
    title: 'Scheme & Trade',
    description: 'Scheme lift and execution focus.',
    prompt: 'Which trade schemes are working and where should I increase activation?',
    icon: Zap,
  },
  {
    id: 'pricing',
    title: 'Pricing Signals',
    description: 'Competition and market movement.',
    prompt: 'Summarize competitor pricing threats and recommended response by channel.',
    icon: ShieldAlert,
  },
  {
    id: 'plan',
    title: 'Today Action Plan',
    description: 'Prioritized action checklist.',
    prompt: 'Create a simple action plan for today with top priorities and expected impact.',
    icon: CalendarRange,
  },
];

function formatValue(value: number, unit: string): string {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);

  if (unit === 'Cr') {
    return `₹${formatted} Cr`;
  }

  if (unit === 'Days') {
    return `${formatted} days`;
  }

  return `${formatted}${unit}`;
}

function MinimalSkeleton() {
  return (
    <main className="minimal-main skeleton-workspace">
      <section className="ai-command-card panel-surface minimal-panel skeleton-card">
        <div className="skeleton-line xl shimmer" />
        <div className="skeleton-line lg shimmer" />
        <div className="skeleton-line md shimmer" />
        <div className="topic-button-grid">
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
        </div>
        <div className="snapshot-row">
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
        </div>
      </section>
    </main>
  );
}

export function DashboardView({ options, session, onLogout }: DashboardViewProps) {
  const [filters, setFilters] = useState<Filters>({
    role: session.role,
    region: session.region,
    channel: 'All',
    timeframe: 'MTD',
  });

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [prediagnosis, setPrediagnosis] = useState<Prediagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responseMs, setResponseMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [asking, setAsking] = useState(false);

  const [refreshTick, setRefreshTick] = useState(0);

  const hasLoadedRef = useRef(false);
  const cacheRef = useRef(
    new Map<
      string,
      {
        dashboard: DashboardData;
        prediagnosis: Prediagnosis;
        meta: { fetchedAt: string; responseMs: number };
      }
    >(),
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const cacheKey = `${filters.role}:${filters.region}:${filters.channel}:${filters.timeframe}`;

    async function load() {
      setError(null);
      const cached = cacheRef.current.get(cacheKey);

      if (cached && active) {
        setDashboard(cached.dashboard);
        setPrediagnosis(cached.prediagnosis);
        setResponseMs(cached.meta.responseMs);
        setLoading(false);
      } else if (hasLoadedRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const workspace = await fetchWorkspace(filters);
        if (!active) {
          return;
        }

        cacheRef.current.set(cacheKey, workspace);
        hasLoadedRef.current = true;
        setDashboard(workspace.dashboard);
        setPrediagnosis(workspace.prediagnosis);
        setResponseMs(workspace.meta.responseMs);
        setMessages([
          {
            id: `seed-${Date.now()}`,
            role: 'assistant',
            text:
              workspace.prediagnosis.aiSummary ||
              'I am ready with your current sales context. Tap a topic or ask any question.',
            ts: new Date().toISOString(),
            source: workspace.prediagnosis.aiSource,
          },
        ]);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load workspace.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [filters, refreshTick]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const quickStats = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const sales = dashboard.kpis.find((kpi) => kpi.id === 'mtd_sales');
    const achievement = dashboard.kpis.find((kpi) => kpi.id === 'achievement');
    const atRiskDistributors = dashboard.distributors.filter((d) => d.paymentStatus !== 'Healthy').length;
    const highRiskNodes = dashboard.logistics.filter((l) => l.risk === 'High').length;

    return [
      {
        label: sales?.label || 'Net Sales',
        value: formatValue(sales?.value ?? 0, sales?.unit ?? 'Cr'),
      },
      {
        label: 'Target Achievement',
        value: `${achievement?.value ?? 0}%`,
      },
      {
        label: 'At-Risk Distributors',
        value: `${atRiskDistributors}`,
      },
      {
        label: 'High-Risk Logistics Nodes',
        value: `${highRiskNodes}`,
      },
    ];
  }, [dashboard]);

  async function sendQuestion(questionText: string) {
    if (!questionText.trim() || asking) {
      return;
    }

    const question = questionText.trim();

    setMessages((current) => [
      ...current,
      {
        id: `u-${Date.now()}`,
        role: 'user',
        text: question,
        ts: new Date().toISOString(),
      },
    ]);

    setDraft('');
    setAsking(true);

    try {
      const response = await askCopilot(question, filters);
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: response.answer,
          ts: response.timestamp,
          source: response.source,
        },
      ]);
    } catch (askError) {
      setMessages((current) => [
        ...current,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          text: askError instanceof Error ? askError.message : 'Request failed. Please retry.',
          ts: new Date().toISOString(),
          source: 'rule',
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion(draft);
  }

  return (
    <div className="dashboard-shell minimal-shell">
      <header className="minimal-topbar panel-surface minimal-panel">
        <div className="brand-left">
          <div className="brand-mark" aria-hidden="true">
            <img src="/salesos-mark.svg" alt="" width={24} height={24} className="logo-mark" />
          </div>
          <div>
            <p className="brand-subtitle">SalesOS</p>
            <h1>AI Command Workspace</h1>
          </div>
        </div>

        <div className="minimal-filters">
          <label>
            <span>Role</span>
            <select
              value={filters.role}
              onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value as Role }))}
            >
              {options.roles.map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABEL[item]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Region</span>
            <select
              value={filters.region}
              onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
            >
              {options.regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Channel</span>
            <select
              value={filters.channel}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  channel: event.target.value as Filters['channel'],
                }))
              }
            >
              {options.channels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Horizon</span>
            <select
              value={filters.timeframe}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  timeframe: event.target.value as Timeframe,
                }))
              }
            >
              {options.timeframes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="topbar-right">
          <div className="identity-chip">
            <UserCircle2 size={16} />
            <div>
              <strong>{session.name}</strong>
              <p>
                {ROLE_LABEL[session.role]} • {filters.region}
              </p>
            </div>
          </div>

          <button className="ghost-btn" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            <RefreshCw size={14} className={refreshing ? 'spin' : undefined} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>

          <button className="ghost-btn" type="button" onClick={onLogout}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {error ? (
        <div className="error-banner">
          <CircleAlert size={18} />
          <p>{error}</p>
        </div>
      ) : null}

      {loading || !dashboard || !prediagnosis ? (
        <MinimalSkeleton />
      ) : (
        <main className="minimal-main">
          <section className="ai-command-card panel-surface minimal-panel">
            <div className="ai-center-heading">
              <span className="hero-kicker">
                <Bot size={14} /> Central Sales AI
              </span>
              <h2>{prediagnosis.headline}</h2>
              <p>{prediagnosis.aiSummary}</p>
            </div>

            <div className="hero-meta-row">
              <span>
                <CalendarRange size={14} /> Synced {new Date(prediagnosis.generatedAt).toLocaleString('en-IN')}
              </span>
              {responseMs !== null ? (
                <span>
                  <Zap size={14} /> Loaded in {responseMs} ms
                </span>
              ) : null}
            </div>

            <div className="topic-button-grid">
              {TOPIC_PROMPTS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className="topic-button"
                  disabled={asking}
                  onClick={() => {
                    void sendQuestion(topic.prompt);
                  }}
                >
                  <topic.icon size={16} />
                  <div>
                    <strong>{topic.title}</strong>
                    <p>{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="snapshot-row">
              {quickStats.map((item) => (
                <article key={item.label} className="snapshot-card">
                  <p>{item.label}</p>
                  <h3>{item.value}</h3>
                </article>
              ))}
            </div>

            <div className="ai-chat-scroll">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={message.role === 'assistant' ? 'chat-bubble assistant' : 'chat-bubble user'}
                >
                  <p>{message.text}</p>
                  <small>
                    {new Date(message.ts).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {message.source ? ` • ${message.source}` : ''}
                  </small>
                </article>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-form" onSubmit={handleAsk}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask anything about sales, distribution, logistics, pricing, or actions"
              />
              <button type="submit" disabled={!draft.trim() || asking}>
                {asking ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
              </button>
            </form>
          </section>
        </main>
      )}
    </div>
  );
}
