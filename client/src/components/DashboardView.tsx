import {
  Activity,
  AlertTriangle,
  Bot,
  Building2,
  CalendarRange,
  CircleAlert,
  Database,
  LogOut,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  Target,
  Truck,
  UserCircle2,
  Zap,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
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

const ROLE_LABEL: Record<Role, string> = {
  salesperson: 'Salesperson',
  area_manager: 'Area Manager',
  regional_manager: 'Regional Manager',
  trade_marketing_manager: 'Trade Marketing Manager',
};

const MODULE_LABELS = {
  marketIntelligence: 'Market Intel',
  competitorPricing: 'Pricing Watch',
  customerFeedback: 'Customer Voice',
  retailerFeedback: 'Retail Pulse',
  displayAudit: 'Display Audit',
} as const;

const QUICK_PROMPTS = [
  'What are my top three risks for the next 72 hours?',
  'Which distributors need intervention first and why?',
  'How do I close target gap this week using highest-yield levers?',
  'What is the logistics risk today and what should I escalate?',
];

const DecisionCharts = lazy(async () => {
  const module = await import('./DecisionCharts');
  return { default: module.DecisionCharts };
});

function fmtNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatKpi(value: number, unit: string): string {
  if (unit === 'Cr') {
    return `₹${fmtNumber(value)} Cr`;
  }

  if (unit === 'Days') {
    return `${fmtNumber(value)} days`;
  }

  return `${fmtNumber(value)}${unit}`;
}

function badgeClass(value: 'High' | 'Medium' | 'Low' | 'Healthy' | 'Watchlist' | 'Critical') {
  if (value === 'High' || value === 'Critical') {
    return 'badge badge-high';
  }

  if (value === 'Medium' || value === 'Watchlist') {
    return 'badge badge-medium';
  }

  return 'badge badge-low';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function DashboardSkeleton() {
  return (
    <main className="workspace-grid skeleton-workspace">
      <section className="workspace-main">
        <article className="ai-hero panel-surface skeleton-card">
          <div className="skeleton-line xl shimmer" />
          <div className="skeleton-line lg shimmer" />
          <div className="skeleton-line md shimmer" />
          <div className="skeleton-chip-row">
            <span className="skeleton-chip shimmer" />
            <span className="skeleton-chip shimmer" />
            <span className="skeleton-chip shimmer" />
          </div>
        </article>

        <article className="quick-param-strip panel-surface skeleton-card">
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
          <div className="skeleton-tile shimmer" />
        </article>

        <article className="source-fabric panel-surface skeleton-card">
          <div className="skeleton-line md shimmer" />
          <div className="source-cards">
            <div className="skeleton-tile shimmer" />
            <div className="skeleton-tile shimmer" />
            <div className="skeleton-tile shimmer" />
            <div className="skeleton-tile shimmer" />
            <div className="skeleton-tile shimmer" />
          </div>
        </article>
      </section>

      <aside className="copilot-pane panel-surface skeleton-card">
        <div className="skeleton-line md shimmer" />
        <div className="skeleton-line sm shimmer" />
        <div className="skeleton-line sm shimmer" />
        <div className="chat-scroll">
          <div className="skeleton-line md shimmer" />
          <div className="skeleton-line lg shimmer" />
          <div className="skeleton-line md shimmer" />
        </div>
      </aside>
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
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef(false);
  const workspaceCacheRef = useRef(
    new Map<
      string,
      {
        dashboard: DashboardData;
        prediagnosis: Prediagnosis;
        meta: { fetchedAt: string; responseMs: number };
      }
    >(),
  );

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;
    const cacheKey = `${filters.role}:${filters.region}:${filters.channel}:${filters.timeframe}`;

    async function load() {
      setError(null);
      const cached = workspaceCacheRef.current.get(cacheKey);

      if (cached && active) {
        setDashboard(cached.dashboard);
        setPrediagnosis(cached.prediagnosis);
        setResponseMs(cached.meta.responseMs);
        setLoading(false);
        hasLoadedRef.current = true;
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

        workspaceCacheRef.current.set(cacheKey, workspace);
        setDashboard(workspace.dashboard);
        setPrediagnosis(workspace.prediagnosis);
        setResponseMs(workspace.meta.responseMs);
        hasLoadedRef.current = true;
        setMessages([
          {
            id: `seed-${Date.now()}`,
            role: 'assistant',
            text:
              workspace.prediagnosis.aiSummary ||
              'I am ready with a cross-source sales summary. Ask me where to focus first.',
            ts: new Date().toISOString(),
            source: workspace.prediagnosis.aiSource,
          },
        ]);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard');
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

  const healthNumbers = useMemo(() => {
    if (!dashboard) {
      return {
        healthyDistributors: 0,
        riskDistributors: 0,
        highRiskLogistics: 0,
      };
    }

    return {
      healthyDistributors: dashboard.distributors.filter((item) => item.paymentStatus === 'Healthy').length,
      riskDistributors: dashboard.distributors.filter((item) => item.paymentStatus !== 'Healthy').length,
      highRiskLogistics: dashboard.logistics.filter((item) => item.risk === 'High').length,
    };
  }, [dashboard]);

  const strategySignals = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return (
      Object.entries(dashboard.salesEasy.modules) as Array<
        [
          keyof typeof MODULE_LABELS,
          DashboardData['salesEasy']['modules'][keyof DashboardData['salesEasy']['modules']],
        ]
      >
    )
      .flatMap(([module, signals]) =>
        signals.map((signal) => ({
          ...signal,
          module: MODULE_LABELS[module],
          priority: signal.impact === 'High' ? 3 : signal.impact === 'Medium' ? 2 : 1,
        })),
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
  }, [dashboard]);

  const riskDistributors = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.distributors
      .filter((distributor) => distributor.paymentStatus !== 'Healthy')
      .sort((a, b) => b.outstandingDays - a.outstandingDays)
      .slice(0, 4);
  }, [dashboard]);

  const logisticsBottlenecks = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [...dashboard.logistics]
      .sort((a, b) => b.avgDelayHours - a.avgDelayHours)
      .slice(0, 4);
  }, [dashboard]);

  const channelGrowth = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.channelMix
      .filter((item) => item.share > 0)
      .sort((a, b) => b.growth - a.growth)
      .map((item) => ({
        channel: item.channel,
        growth: item.growth,
      }));
  }, [dashboard]);

  const aiConfidence = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    const achievement = dashboard.kpis.find((kpi) => kpi.id === 'achievement')?.value ?? 0;
    const collection = dashboard.kpis.find((kpi) => kpi.id === 'collection_efficiency')?.value ?? 0;
    const penalty = healthNumbers.highRiskLogistics * 7 + healthNumbers.riskDistributors * 4;

    return Math.round(clamp(achievement * 0.55 + collection * 0.45 - penalty, 35, 98));
  }, [dashboard, healthNumbers.highRiskLogistics, healthNumbers.riskDistributors]);

  const sourceHealth = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const salesKpi = dashboard.kpis.find((item) => item.id === 'mtd_sales');

    return [
      {
        source: 'SFA Beat App',
        status: 'Live',
        freshness: '2m ago',
        detail: `${dashboard.user.territory}`,
        health: 'good',
      },
      {
        source: 'Distributor ERP',
        status: 'Live',
        freshness: '5m ago',
        detail: `${dashboard.distributors.length} distributors synced`,
        health: healthNumbers.riskDistributors > 1 ? 'warn' : 'good',
      },
      {
        source: 'Primary Billing',
        status: 'Live',
        freshness: '8m ago',
        detail: `${formatKpi(salesKpi?.value ?? 0, salesKpi?.unit ?? 'Cr')} run-rate`,
        health: 'good',
      },
      {
        source: 'Logistics TMS',
        status: 'Live',
        freshness: '11m ago',
        detail: `${healthNumbers.highRiskLogistics} high-risk nodes`,
        health: healthNumbers.highRiskLogistics > 0 ? 'warn' : 'good',
      },
      {
        source: 'SalesEasy Signals',
        status: 'Live',
        freshness: 'Real-time',
        detail: `${strategySignals.length} prioritized field signals`,
        health: 'good',
      },
    ] as const;
  }, [dashboard, healthNumbers.highRiskLogistics, healthNumbers.riskDistributors, strategySignals.length]);

  const quickParameters = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const sales = dashboard.kpis.find((kpi) => kpi.id === 'mtd_sales');
    const achievement = dashboard.kpis.find((kpi) => kpi.id === 'achievement');
    const distribution = dashboard.kpis.find((kpi) => kpi.id === 'weighted_distribution');
    const averageOtif =
      dashboard.logistics.reduce((sum, node) => sum + node.otif, 0) /
      Math.max(dashboard.logistics.length, 1);
    const highSignalCount = strategySignals.filter((signal) => signal.impact === 'High').length;

    return [
      {
        label: 'Run-Rate Sales',
        value: formatKpi(sales?.value ?? 0, sales?.unit ?? 'Cr'),
        detail: `${filters.timeframe} live billing`,
      },
      {
        label: 'Target Closure',
        value: `${achievement?.value ?? 0}%`,
        detail: 'achievement index',
      },
      {
        label: 'Weighted Distribution',
        value: `${distribution?.value ?? 0}%`,
        detail: 'coverage health',
      },
      {
        label: 'Network OTIF',
        value: `${averageOtif.toFixed(1)}%`,
        detail: 'logistics reliability',
      },
      {
        label: 'High-Impact Signals',
        value: `${highSignalCount}`,
        detail: 'SalesEasy intelligence',
      },
    ];
  }, [dashboard, filters.timeframe, strategySignals]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  async function sendQuestion(questionText: string) {
    if (!questionText.trim() || asking) {
      return;
    }

    const question = questionText.trim();
    const ts = new Date().toISOString();

    setMessages((current) => [
      ...current,
      {
        id: `u-${Date.now()}`,
        role: 'user',
        text: question,
        ts,
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
          text:
            askError instanceof Error
              ? askError.message
              : 'Copilot request failed. Please try again.',
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
    <div className="dashboard-shell ai-first">
      <div className="dashboard-ambient" aria-hidden="true" />

      <header className="ai-topbar">
        <div className="brand-left">
          <div className="brand-mark" aria-hidden="true">
            <img src="/salesos-mark.svg" alt="" width={24} height={24} className="logo-mark" />
          </div>
          <div>
            <p className="brand-subtitle">FutureLab SalesOS</p>
            <h1>Decision Intelligence Workspace</h1>
          </div>
        </div>

        <div className="topbar-filters">
          <label>
            <span>Role</span>
            <select
              value={filters.role}
              onChange={(event) =>
                setFilters((current) => ({ ...current, role: event.target.value as Role }))
              }
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
              onChange={(event) =>
                setFilters((current) => ({ ...current, region: event.target.value }))
              }
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
            <UserCircle2 size={17} />
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
        <DashboardSkeleton />
      ) : (
        <main className="workspace-grid">
          <section className="workspace-main">
            <article className="ai-hero panel-surface">
              <div className="ai-hero-top">
                <div className="hero-title-wrap">
                  <span className="hero-kicker">
                    <Zap size={14} /> AI Summary
                  </span>
                  <h2>{prediagnosis.headline}</h2>
                  <p>{prediagnosis.aiSummary}</p>
                </div>

                <div className="ai-score">
                  <span>Decision Readiness</span>
                  <strong>{aiConfidence}%</strong>
                  <p>Confidence based on sales, collection, logistics and market signals.</p>
                </div>
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
                <span>
                  <Database size={14} /> 5 integrated data streams
                </span>
                <span>
                  <Building2 size={14} /> {dashboard.user.office} • {dashboard.user.territory}
                </span>
              </div>

              <div className="hero-alerts">
                {prediagnosis.alerts.slice(0, 3).map((alert) => (
                  <article key={alert.id} className="hero-alert-row">
                    <span className={badgeClass(alert.severity)}>{alert.severity}</span>
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.recommendation}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hero-actions">
                {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      void sendQuestion(prompt);
                    }}
                    disabled={asking}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </article>

            <section className="quick-param-strip panel-surface">
              {quickParameters.map((item) => (
                <article key={item.label} className="quick-param-card">
                  <p>{item.label}</p>
                  <h3>{item.value}</h3>
                  <small>{item.detail}</small>
                </article>
              ))}
            </section>

            <section className="source-fabric panel-surface">
              <div className="panel-headline">
                <h3>Unified Data Fabric</h3>
                <p>Latest context merged from sales, distribution, logistics and SalesEasy intelligence.</p>
              </div>
              <div className="source-cards">
                {sourceHealth.map((source) => (
                  <article key={source.source} className="source-card">
                    <div>
                      <strong>{source.source}</strong>
                      <p>{source.detail}</p>
                    </div>
                    <div>
                      <span className={source.health === 'warn' ? 'pulse-tag warn' : 'pulse-tag'}>
                        {source.status}
                      </span>
                      <small>{source.freshness}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="decision-grid">
              <article className="decision-panel panel-surface">
                <div className="panel-headline">
                  <h3>Where to Act First</h3>
                  <p>AI-prioritized intervention lanes for immediate execution.</p>
                </div>
                <div className="priority-lanes">
                  <div>
                    <h4>
                      <ShieldAlert size={15} /> Distributor Risk
                    </h4>
                    <div className="lane-items">
                      {riskDistributors.length > 0 ? (
                        riskDistributors.map((distributor) => (
                          <article key={distributor.code}>
                            <strong>{distributor.name}</strong>
                            <p>
                              {distributor.town} • {distributor.outstandingDays} DSO • {distributor.stockCoverDays} day cover
                            </p>
                          </article>
                        ))
                      ) : (
                        <article>
                          <strong>No payment risk cluster</strong>
                          <p>Distributor receivables look stable in this view.</p>
                        </article>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4>
                      <Truck size={15} /> Logistics Bottlenecks
                    </h4>
                    <div className="lane-items">
                      {logisticsBottlenecks.map((node) => (
                        <article key={node.node}>
                          <strong>{node.node}</strong>
                          <p>
                            Fill {node.fillRate}% • Delay {node.avgDelayHours}h • OTIF {node.otif}%
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4>
                      <MessageSquare size={15} /> Field Intelligence
                    </h4>
                    <div className="lane-items">
                      {strategySignals.map((signal) => (
                        <article key={signal.id}>
                          <strong>{signal.title}</strong>
                          <p>
                            {signal.module} • {signal.location} • {signal.impact}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <Suspense
                fallback={
                  <article className="decision-panel panel-surface skeleton-card">
                    <div className="skeleton-line md shimmer" />
                    <div className="chart-wrap compact shimmer" />
                  </article>
                }
              >
                <DecisionCharts
                  salesTrend={dashboard.salesTrend}
                  channelGrowth={channelGrowth}
                  timeframe={filters.timeframe}
                />
              </Suspense>

              <article className="decision-panel panel-surface">
                <div className="panel-headline">
                  <h3>Action Queue</h3>
                  <p>Execution plan generated from multi-layer diagnostics.</p>
                </div>
                <div className="action-stack">
                  {dashboard.actions.slice(0, 4).map((action) => (
                    <article key={action.id}>
                      <div className="action-line">
                        <strong>{action.title}</strong>
                        <span className={`priority priority-${action.priority.toLowerCase()}`}>{action.priority}</span>
                      </div>
                      <p>{action.impact}</p>
                      <small>
                        {action.owner} • due {action.dueDate} • {action.status}
                      </small>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          </section>

          <aside className="copilot-pane panel-surface">
            <div className="copilot-head">
              <div>
                <h3>
                  <Bot size={16} /> Assistant Copilot
                </h3>
                <p>Cross-checks latest figures across all connected sources before answering.</p>
              </div>
              <span className="live-tag">Live</span>
            </div>

            <div className="copilot-context">
              <span>
                <Activity size={14} /> Decision mode: {ROLE_LABEL[filters.role]}
              </span>
              <span>
                <Target size={14} /> Region: {filters.region}
              </span>
            </div>

            <div className="prompt-grid">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={asking}
                  onClick={() => {
                    void sendQuestion(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chat-scroll">
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
                placeholder="Ask: where should I focus today and why?"
              />
              <button type="submit" disabled={!draft.trim() || asking}>
                {asking ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
              </button>
            </form>
          </aside>
        </main>
      )}

      <footer className="dashboard-footer">
        <span>
          <Database size={14} /> Multi-source context: SFA, DMS, Billing, Logistics, SalesEasy
        </span>
        <span>
          <CalendarRange size={14} /> Decision window set to {filters.timeframe}
        </span>
        <span>
          <AlertTriangle size={14} /> AI recommendations support judgement; use manager approvals where needed
        </span>
      </footer>
    </div>
  );
}
