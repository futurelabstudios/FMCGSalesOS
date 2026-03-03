import type {
  AppOptions,
  AskResponse,
  Channel,
  DashboardData,
  LoginResponse,
  Prediagnosis,
  Timeframe,
  WorkspaceResponse,
  Role,
} from '../types/salesos';

export interface DemoFilters {
  role: Role;
  region: string;
  channel: Channel;
  timeframe: Timeframe;
}

const ROLE_LABEL: Record<Role, string> = {
  salesperson: 'Salesperson',
  area_manager: 'Area Manager',
  regional_manager: 'Regional Manager',
  trade_marketing_manager: 'Trade Marketing Manager',
};

export const DEMO_OPTIONS: AppOptions = {
  regions: ['North', 'South', 'East', 'West', 'Central'],
  channels: ['All', 'General Trade', 'Modern Trade', 'E-commerce', 'HoReCa'],
  timeframes: ['MTD', 'QTD', 'YTD'],
  roles: ['salesperson', 'area_manager', 'regional_manager', 'trade_marketing_manager'],
};

function seedNumber(seed: string): number {
  return seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function buildDashboard(filters: DemoFilters): DashboardData {
  const seed = seedNumber(`${filters.region}:${filters.role}:${filters.channel}:${filters.timeframe}`);
  const multiplier = 1 + (seed % 9) / 100;

  return {
    user: {
      id: `demo-${filters.role}`,
      name: 'Demo User',
      role: filters.role,
      region: filters.region,
      office: `${filters.region} Regional Office`,
      territory: `${filters.region} Territory Cluster`,
    },
    filters: {
      region: filters.region,
      channel: filters.channel,
      timeframe: filters.timeframe,
    },
    kpis: [
      {
        id: 'mtd_sales',
        label: `${filters.timeframe} Net Sales`,
        value: Number((103 * multiplier).toFixed(1)),
        unit: 'Cr',
        delta: 9.4,
        deltaLabel: 'vs LY',
        trend: 'up',
      },
      {
        id: 'achievement',
        label: 'Target Achievement',
        value: Number((95.2 + (seed % 3)).toFixed(1)),
        unit: '%',
        delta: 1.9,
        deltaLabel: 'monthly movement',
        trend: 'up',
      },
      {
        id: 'weighted_distribution',
        label: 'Weighted Distribution',
        value: Number((85.8 + (seed % 4)).toFixed(1)),
        unit: '%',
        delta: 1.1,
        deltaLabel: 'active outlets',
        trend: 'up',
      },
      {
        id: 'collection_efficiency',
        label: 'Collection Efficiency',
        value: Number((93.4 + (seed % 3)).toFixed(1)),
        unit: '%',
        delta: 0.7,
        deltaLabel: 'vs cycle',
        trend: 'up',
      },
    ],
    salesTrend: [
      { period: 'Oct', target: 82, actual: 79, lastYear: 73 },
      { period: 'Nov', target: 88, actual: 84, lastYear: 77 },
      { period: 'Dec', target: 93, actual: 89, lastYear: 82 },
      { period: 'Jan', target: 95, actual: 91, lastYear: 84 },
      { period: 'Feb', target: 98, actual: 95, lastYear: 88 },
      { period: 'Mar', target: 102, actual: 99, lastYear: 91 },
    ],
    channelMix: [
      { channel: 'General Trade', share: 56, growth: 6.1 },
      { channel: 'Modern Trade', share: 22, growth: 9.3 },
      { channel: 'E-commerce', share: 13, growth: 12.5 },
      { channel: 'HoReCa', share: 9, growth: 4.8 },
    ],
    schemePerformance: [
      { scheme: 'Summer Saver', uplift: 15.2, redemption: 70, roi: 2.2 },
      { scheme: 'Retail Push', uplift: 12.8, redemption: 66, roi: 2.0 },
      { scheme: 'Festive Combo', uplift: 17.1, redemption: 72, roi: 2.7 },
    ],
    logistics: [
      {
        node: `${filters.region} Main DC`,
        fillRate: 95,
        otif: 93,
        avgDelayHours: 6.1,
        inTransitValueCr: 3.9,
        risk: 'Medium',
      },
      {
        node: `${filters.region} Secondary Hub`,
        fillRate: 92,
        otif: 89,
        avgDelayHours: 8.2,
        inTransitValueCr: 2.6,
        risk: 'High',
      },
      {
        node: `${filters.region} Urban Dock`,
        fillRate: 97,
        otif: 95,
        avgDelayHours: 4.5,
        inTransitValueCr: 2.1,
        risk: 'Low',
      },
    ],
    distributors: [
      {
        code: 'DS-101',
        name: 'Shakti Distributors',
        town: 'Tier 1 Urban',
        beatCoverage: 89,
        primarySalesLakh: 78,
        secondarySalesLakh: 71,
        outstandingDays: 17,
        stockCoverDays: 7,
        paymentStatus: 'Healthy',
      },
      {
        code: 'DS-204',
        name: 'Mohan Agencies',
        town: 'Tier 2 Cluster',
        beatCoverage: 75,
        primarySalesLakh: 51,
        secondarySalesLakh: 44,
        outstandingDays: 33,
        stockCoverDays: 10,
        paymentStatus: 'Watchlist',
      },
      {
        code: 'DS-309',
        name: 'Ganesh FMCG Link',
        town: 'Tier 3 Belt',
        beatCoverage: 68,
        primarySalesLakh: 39,
        secondarySalesLakh: 33,
        outstandingDays: 44,
        stockCoverDays: 13,
        paymentStatus: 'Critical',
      },
    ],
    salesEasy: {
      summary: '4 high-impact and 3 medium-impact field signals captured in the last 24 hours.',
      modules: {
        marketIntelligence: [
          {
            id: 'mi-1',
            title: 'Economy SKU acceleration in GT clusters',
            location: filters.region,
            impact: 'High',
            note: 'Low-unit packs gaining repeat velocity in 52 stores.',
            timestamp: '2h ago',
          },
        ],
        competitorPricing: [
          {
            id: 'cp-1',
            title: 'Competitor undercut in key SKU',
            location: `${filters.region} urban`,
            impact: 'High',
            note: 'Average 4.1% price gap observed in 30 stores.',
            timestamp: '4h ago',
          },
        ],
        customerFeedback: [
          {
            id: 'cf-1',
            title: 'Strong demand for smaller packs',
            location: `${filters.region} rural`,
            impact: 'Medium',
            note: 'Repeated request in retailer-assisted interviews.',
            timestamp: '6h ago',
          },
        ],
        retailerFeedback: [
          {
            id: 'rf-1',
            title: 'Scheme communication gap',
            location: `${filters.region} mixed market`,
            impact: 'Medium',
            note: 'Retailers need slab clarity for better redemption.',
            timestamp: '5h ago',
          },
        ],
        displayAudit: [
          {
            id: 'da-1',
            title: 'Display compliance dropped in MT',
            location: `${filters.region} metro`,
            impact: 'High',
            note: 'Planogram compliance at 64% in audited stores.',
            timestamp: '7h ago',
          },
        ],
      },
    },
    actions: [
      {
        id: 'ac-1',
        title: 'Close target gap using top 20 outlet-SKU combinations',
        owner: ROLE_LABEL[filters.role],
        dueDate: '2026-03-10',
        priority: 'P0',
        status: 'Open',
        impact: 'Recover up to 1.8 Cr in current cycle',
      },
      {
        id: 'ac-2',
        title: 'Escalate logistics delays for secondary hub',
        owner: 'Regional Logistics Lead',
        dueDate: '2026-03-08',
        priority: 'P1',
        status: 'In Progress',
        impact: 'Reduce potential stockout by 22%',
      },
      {
        id: 'ac-3',
        title: 'Receivables sprint for critical distributors',
        owner: 'Sales Ops + Finance',
        dueDate: '2026-03-09',
        priority: 'P0',
        status: 'Open',
        impact: 'Lower DSO by 2 days in this cluster',
      },
    ],
  };
}

function buildPrediagnosis(filters: DemoFilters): Prediagnosis {
  return {
    generatedAt: new Date().toISOString(),
    headline: 'Immediate action recommended: 2 high-severity risk clusters detected.',
    alerts: [
      {
        id: 'al-1',
        severity: 'High',
        title: 'Target closure risk in current cycle',
        detail: 'Achievement trend is below safety threshold for current trajectory.',
        recommendation: 'Prioritize top throughput outlets with SKU-specific action plan for 72 hours.',
      },
      {
        id: 'al-2',
        severity: 'High',
        title: 'Logistics slippage can trigger weekend stockout',
        detail: 'One secondary node is running above acceptable delay threshold.',
        recommendation: 'Reroute urgent dispatches and lock replenishment windows for top SKUs.',
      },
      {
        id: 'al-3',
        severity: 'Medium',
        title: 'Distributor receivable stress is rising',
        detail: 'One critical and one watchlist distributor need coordinated follow-up.',
        recommendation: 'Run receivable commitments with dispatch-linked payment milestones.',
      },
    ],
    suggestedFocus: [
      'Outlet-SKU intervention matrix',
      'Logistics fallback routing',
      'Distributor receivables plan',
    ],
    aiSummary: `For ${ROLE_LABEL[filters.role]} in ${filters.region}, the fastest win is to close distribution and receivable risks first, then push high-velocity SKU execution in top outlets.`,
    aiSource: 'rule',
  };
}

export async function demoLogin(name: string, role: Role, region: string): Promise<LoginResponse> {
  return {
    token: `demo_${Date.now()}`,
    user: {
      name,
      role,
      region,
    },
  };
}

export async function demoWorkspace(filters: DemoFilters): Promise<WorkspaceResponse> {
  const dashboard = buildDashboard(filters);
  const prediagnosis = buildPrediagnosis(filters);

  return {
    dashboard,
    prediagnosis,
    meta: {
      fetchedAt: new Date().toISOString(),
      responseMs: 22,
    },
  };
}

export async function demoAsk(question: string): Promise<AskResponse> {
  const lower = question.toLowerCase();
  const answer = lower.includes('distributor')
    ? 'Critical focus: Ganesh FMCG Link and Mohan Agencies. Prioritize collections linked to dispatch commitments and tighten stock cover to under 10 days.'
    : lower.includes('logistics')
      ? 'Key risk is at the secondary hub (delay 8.2h). Shift high-velocity SKUs through main DC routing for the next 48 hours.'
      : 'Top action sequence: secure receivables, protect logistics continuity, and push high-yield outlet-SKU interventions for immediate sales lift.';

  return {
    answer,
    source: 'rule',
    timestamp: new Date().toISOString(),
  };
}
