export type Role =
  | 'salesperson'
  | 'area_manager'
  | 'regional_manager'
  | 'trade_marketing_manager';

export type Channel =
  | 'All'
  | 'General Trade'
  | 'Modern Trade'
  | 'E-commerce'
  | 'HoReCa';

export type Timeframe = 'MTD' | 'QTD' | 'YTD';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  region: string;
  office: string;
  territory: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit: 'Cr' | '%' | 'Days' | 'L';
  delta: number;
  deltaLabel: string;
  trend: 'up' | 'down';
}

export interface SalesTrendPoint {
  period: string;
  target: number;
  actual: number;
  lastYear: number;
}

export interface ChannelContribution {
  channel: Exclude<Channel, 'All'>;
  share: number;
  growth: number;
}

export interface SchemePerformance {
  scheme: string;
  uplift: number;
  redemption: number;
  roi: number;
}

export interface LogisticsNode {
  node: string;
  fillRate: number;
  otif: number;
  avgDelayHours: number;
  inTransitValueCr: number;
  risk: 'Low' | 'Medium' | 'High';
}

export interface DistributorHealth {
  code: string;
  name: string;
  town: string;
  beatCoverage: number;
  primarySalesLakh: number;
  secondarySalesLakh: number;
  outstandingDays: number;
  stockCoverDays: number;
  paymentStatus: 'Healthy' | 'Watchlist' | 'Critical';
}

export interface SalesEasySignal {
  id: string;
  title: string;
  location: string;
  impact: 'Low' | 'Medium' | 'High';
  note: string;
  timestamp: string;
}

export interface SalesEasyModules {
  marketIntelligence: SalesEasySignal[];
  competitorPricing: SalesEasySignal[];
  customerFeedback: SalesEasySignal[];
  retailerFeedback: SalesEasySignal[];
  displayAudit: SalesEasySignal[];
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'Open' | 'In Progress' | 'Done';
  impact: string;
}

export interface DashboardData {
  user: UserProfile;
  filters: {
    region: string;
    channel: Channel;
    timeframe: Timeframe;
  };
  kpis: KpiMetric[];
  salesTrend: SalesTrendPoint[];
  channelMix: ChannelContribution[];
  schemePerformance: SchemePerformance[];
  logistics: LogisticsNode[];
  distributors: DistributorHealth[];
  salesEasy: {
    summary: string;
    modules: SalesEasyModules;
  };
  actions: ActionItem[];
}

export interface PrediagnosisAlert {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  detail: string;
  recommendation: string;
}

export interface Prediagnosis {
  generatedAt: string;
  headline: string;
  alerts: PrediagnosisAlert[];
  suggestedFocus: string[];
}

const REGION_FACTORS: Record<string, number> = {
  North: 1.02,
  South: 0.98,
  East: 0.89,
  West: 1.11,
  Central: 0.93,
};

const ROLE_VOLUME_MULTIPLIER: Record<Role, number> = {
  salesperson: 0.22,
  area_manager: 0.44,
  regional_manager: 1,
  trade_marketing_manager: 0.86,
};

const TIMEFRAME_MULTIPLIER: Record<Timeframe, number> = {
  MTD: 1,
  QTD: 2.7,
  YTD: 9.1,
};

const USERS: UserProfile[] = [
  {
    id: 'u-sp-001',
    name: 'Aarav Sharma',
    role: 'salesperson',
    region: 'North',
    office: 'Lucknow SO',
    territory: 'Lucknow Urban Beat 3',
  },
  {
    id: 'u-am-001',
    name: 'Neha Reddy',
    role: 'area_manager',
    region: 'South',
    office: 'Bengaluru AO',
    territory: 'Bengaluru Rural + 4 Towns',
  },
  {
    id: 'u-rm-001',
    name: 'Ritwik Mehta',
    role: 'regional_manager',
    region: 'West',
    office: 'Ahmedabad RO',
    territory: 'Gujarat + Rajasthan Cluster',
  },
  {
    id: 'u-tm-001',
    name: 'Pooja Iyer',
    role: 'trade_marketing_manager',
    region: 'North',
    office: 'Delhi RO',
    territory: 'GT and MT Activation - North',
  },
];

const BASE_TREND: SalesTrendPoint[] = [
  { period: 'Oct', target: 82, actual: 77, lastYear: 73 },
  { period: 'Nov', target: 89, actual: 87, lastYear: 79 },
  { period: 'Dec', target: 95, actual: 93, lastYear: 86 },
  { period: 'Jan', target: 90, actual: 84, lastYear: 81 },
  { period: 'Feb', target: 98, actual: 92, lastYear: 85 },
  { period: 'Mar', target: 101, actual: 96, lastYear: 89 },
];

const BASE_CHANNEL_MIX: ChannelContribution[] = [
  { channel: 'General Trade', share: 58, growth: 6.4 },
  { channel: 'Modern Trade', share: 21, growth: 9.2 },
  { channel: 'E-commerce', share: 12, growth: 13.9 },
  { channel: 'HoReCa', share: 9, growth: 4.1 },
];

const BASE_SCHEMES: SchemePerformance[] = [
  { scheme: 'Summer Saver 5+1', uplift: 17, redemption: 72, roi: 2.4 },
  { scheme: 'Retailer Loyalty Max', uplift: 11, redemption: 63, roi: 2.1 },
  { scheme: 'Festival Visibility Combo', uplift: 14, redemption: 68, roi: 2.8 },
  { scheme: 'Cold Chain Support', uplift: 8, redemption: 54, roi: 1.9 },
];

const BASE_LOGISTICS: LogisticsNode[] = [
  {
    node: 'Lucknow RDC',
    fillRate: 96,
    otif: 92,
    avgDelayHours: 7.2,
    inTransitValueCr: 4.3,
    risk: 'Medium',
  },
  {
    node: 'Nagpur Cross Dock',
    fillRate: 98,
    otif: 95,
    avgDelayHours: 4.9,
    inTransitValueCr: 3.8,
    risk: 'Low',
  },
  {
    node: 'Bengaluru CDC',
    fillRate: 93,
    otif: 90,
    avgDelayHours: 8.4,
    inTransitValueCr: 5.1,
    risk: 'High',
  },
  {
    node: 'Guwahati Hub',
    fillRate: 91,
    otif: 88,
    avgDelayHours: 9.8,
    inTransitValueCr: 2.7,
    risk: 'High',
  },
];

const BASE_DISTRIBUTORS: DistributorHealth[] = [
  {
    code: 'DS-4012',
    name: 'Shree Raj Agencies',
    town: 'Lucknow',
    beatCoverage: 88,
    primarySalesLakh: 74,
    secondarySalesLakh: 68,
    outstandingDays: 19,
    stockCoverDays: 7,
    paymentStatus: 'Healthy',
  },
  {
    code: 'DS-5520',
    name: 'Nandini Traders',
    town: 'Kanpur',
    beatCoverage: 79,
    primarySalesLakh: 58,
    secondarySalesLakh: 49,
    outstandingDays: 31,
    stockCoverDays: 10,
    paymentStatus: 'Watchlist',
  },
  {
    code: 'DS-8821',
    name: 'Madhav FMCG Link',
    town: 'Varanasi',
    beatCoverage: 71,
    primarySalesLakh: 43,
    secondarySalesLakh: 35,
    outstandingDays: 42,
    stockCoverDays: 13,
    paymentStatus: 'Critical',
  },
  {
    code: 'DS-7401',
    name: 'Sai Metro Distributors',
    town: 'Bengaluru',
    beatCoverage: 93,
    primarySalesLakh: 82,
    secondarySalesLakh: 78,
    outstandingDays: 14,
    stockCoverDays: 6,
    paymentStatus: 'Healthy',
  },
  {
    code: 'DS-9902',
    name: 'Navkar Wholesale',
    town: 'Ahmedabad',
    beatCoverage: 85,
    primarySalesLakh: 66,
    secondarySalesLakh: 60,
    outstandingDays: 23,
    stockCoverDays: 9,
    paymentStatus: 'Watchlist',
  },
];

const SALES_EASY_MODULES: SalesEasyModules = {
  marketIntelligence: [
    {
      id: 'mi-1',
      title: 'Competitor launched 200g economy pouch',
      location: 'Meerut',
      impact: 'High',
      note: 'Retailers report 6% pull from low-price packs in GT outlets.',
      timestamp: '2h ago',
    },
    {
      id: 'mi-2',
      title: 'Milk derivative demand spike',
      location: 'Pune',
      impact: 'Medium',
      note: 'Institutional buyers requested 18% extra stock for week 2.',
      timestamp: '5h ago',
    },
  ],
  competitorPricing: [
    {
      id: 'cp-1',
      title: 'Ghee 1L',
      location: 'Delhi NCR',
      impact: 'High',
      note: 'Competitor avg MRP undercut by 4.8% across 31 stores.',
      timestamp: '1d ago',
    },
    {
      id: 'cp-2',
      title: 'Paneer 500g',
      location: 'Jaipur',
      impact: 'Medium',
      note: 'Promo bundle observed in MT with equivalent 3.2% discount.',
      timestamp: '7h ago',
    },
  ],
  customerFeedback: [
    {
      id: 'cf-1',
      title: 'Quality concern: packaging leak',
      location: 'Indore',
      impact: 'High',
      note: '17 complaints in 72h concentrated in one distributor route.',
      timestamp: '3h ago',
    },
    {
      id: 'cf-2',
      title: 'Strong preference for smaller pack',
      location: 'Kolkata',
      impact: 'Medium',
      note: 'Repeat mention in 43 customer interviews this month.',
      timestamp: '9h ago',
    },
  ],
  retailerFeedback: [
    {
      id: 'rf-1',
      title: 'Scheme communication gap',
      location: 'Nashik',
      impact: 'Medium',
      note: 'Retailers unclear on slab benefits; redemption lagging by 11%.',
      timestamp: '4h ago',
    },
    {
      id: 'rf-2',
      title: 'Need faster replenishment in weekends',
      location: 'Hyderabad',
      impact: 'High',
      note: '72 stores recorded stockout risk for top 8 SKUs on Sundays.',
      timestamp: '6h ago',
    },
  ],
  displayAudit: [
    {
      id: 'da-1',
      title: 'Shelf compliance dropped',
      location: 'Ahmedabad',
      impact: 'High',
      note: 'Planogram compliance down to 63% in 52 modern trade stores.',
      timestamp: '8h ago',
    },
    {
      id: 'da-2',
      title: 'POSM damage observed',
      location: 'Chennai',
      impact: 'Low',
      note: '18 displays require replacement before campaign launch.',
      timestamp: '1d ago',
    },
  ],
};

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickUser(role: Role, region: string): UserProfile {
  return (
    USERS.find((user) => user.role === role && user.region === region) ||
    USERS.find((user) => user.role === role) ||
    USERS[0]
  );
}

function kpiSet(role: Role, regionFactor: number, timeframe: Timeframe): KpiMetric[] {
  const volumeMultiplier = ROLE_VOLUME_MULTIPLIER[role] * regionFactor * TIMEFRAME_MULTIPLIER[timeframe];
  const achievementBias =
    role === 'salesperson'
      ? 0.8
      : role === 'area_manager'
        ? 0.4
        : role === 'trade_marketing_manager'
          ? -0.3
          : 0;

  const weightedDistributionBias = role === 'trade_marketing_manager' ? 3 : role === 'salesperson' ? -2 : 0;

  return [
    {
      id: 'mtd_sales',
      label: `${timeframe} Net Sales`,
      value: round(96 * volumeMultiplier, 1),
      unit: 'Cr',
      delta: 8.2,
      deltaLabel: 'vs last year',
      trend: 'up',
    },
    {
      id: 'achievement',
      label: 'Target Achievement',
      value: round(clamp(94.6 + achievementBias, 84, 102), 1),
      unit: '%',
      delta: 1.7,
      deltaLabel: 'vs last month',
      trend: 'up',
    },
    {
      id: 'weighted_distribution',
      label: 'Weighted Distribution',
      value: round(clamp(86 + weightedDistributionBias, 70, 98), 1),
      unit: '%',
      delta: role === 'salesperson' ? -1.8 : 1.2,
      deltaLabel: 'active outlets',
      trend: role === 'salesperson' ? 'down' : 'up',
    },
    {
      id: 'collection_efficiency',
      label: 'Collection Efficiency',
      value: round(clamp(93.4 + regionFactor, 84, 99), 1),
      unit: '%',
      delta: 0.8,
      deltaLabel: 'over previous cycle',
      trend: 'up',
    },
    {
      id: 'stock_cover',
      label: 'Avg Stock Cover',
      value: round(clamp(8.5 - regionFactor, 5, 15), 1),
      unit: 'Days',
      delta: -0.6,
      deltaLabel: 'inventory tightening',
      trend: 'up',
    },
    {
      id: 'returns',
      label: 'Return %',
      value: round(clamp(1.9 + (role === 'salesperson' ? 0.4 : 0), 1, 4), 2),
      unit: '%',
      delta: -0.2,
      deltaLabel: 'quality actions',
      trend: 'up',
    },
  ];
}

function trendSet(role: Role, regionFactor: number, timeframe: Timeframe): SalesTrendPoint[] {
  const volumeMultiplier = ROLE_VOLUME_MULTIPLIER[role] * regionFactor * TIMEFRAME_MULTIPLIER[timeframe];
  return BASE_TREND.map((point) => ({
    period: point.period,
    target: round(point.target * volumeMultiplier, 1),
    actual: round(point.actual * volumeMultiplier, 1),
    lastYear: round(point.lastYear * volumeMultiplier, 1),
  }));
}

function channelMixSet(channel: Channel, role: Role, regionFactor: number): ChannelContribution[] {
  const roleSkew: Partial<Record<'gt' | 'modern' | 'ecommerce' | 'horeca', number>> =
    role === 'trade_marketing_manager'
      ? { modern: 4, ecommerce: 2 }
      : role === 'salesperson'
        ? { gt: 5, horeca: 2 }
        : {};

  const adjusted = BASE_CHANNEL_MIX.map((item) => {
    let share = item.share;

    if (item.channel === 'General Trade' && roleSkew.gt !== undefined) {
      share += roleSkew.gt;
    }
    if (item.channel === 'Modern Trade' && roleSkew.modern !== undefined) {
      share += roleSkew.modern;
    }
    if (item.channel === 'E-commerce' && roleSkew.ecommerce !== undefined) {
      share += roleSkew.ecommerce;
    }
    if (item.channel === 'HoReCa' && roleSkew.horeca !== undefined) {
      share += roleSkew.horeca;
    }

    return {
      ...item,
      share,
      growth: round(item.growth * regionFactor, 1),
    };
  });

  const total = adjusted.reduce((acc, cur) => acc + cur.share, 0);
  const normalized = adjusted.map((item) => ({
    ...item,
    share: round((item.share / total) * 100, 1),
  }));

  if (channel === 'All') {
    return normalized;
  }

  return normalized.map((item) =>
    item.channel === channel
      ? { ...item, share: 100, growth: round(item.growth + 1.2, 1) }
      : { ...item, share: 0 },
  );
}

function schemeSet(role: Role): SchemePerformance[] {
  const upliftBias = role === 'trade_marketing_manager' ? 2.8 : role === 'salesperson' ? -1.6 : 0;

  return BASE_SCHEMES.map((scheme) => ({
    ...scheme,
    uplift: round(clamp(scheme.uplift + upliftBias, 2, 30), 1),
    redemption: round(clamp(scheme.redemption + upliftBias * 1.2, 35, 95), 1),
  }));
}

function logisticsSet(regionFactor: number): LogisticsNode[] {
  return BASE_LOGISTICS.map((node) => {
    const delay = clamp(node.avgDelayHours + (1 - regionFactor) * 4, 2.5, 16);
    const fillRate = clamp(node.fillRate + (regionFactor - 1) * 6, 86, 99);
    const otif = clamp(node.otif + (regionFactor - 1) * 8, 82, 98);

    return {
      ...node,
      avgDelayHours: round(delay, 1),
      fillRate: round(fillRate, 1),
      otif: round(otif, 1),
      inTransitValueCr: round(node.inTransitValueCr * regionFactor, 2),
      risk: delay > 8.5 || fillRate < 92 ? 'High' : delay > 6 || fillRate < 95 ? 'Medium' : 'Low',
    };
  });
}

function distributorSet(role: Role, regionFactor: number): DistributorHealth[] {
  const multiplier = ROLE_VOLUME_MULTIPLIER[role] * regionFactor;

  return BASE_DISTRIBUTORS.map((distributor) => {
    const beatAdjustment = role === 'salesperson' ? -4 : role === 'area_manager' ? 1 : 2;

    return {
      ...distributor,
      beatCoverage: round(clamp(distributor.beatCoverage + beatAdjustment, 52, 98), 1),
      primarySalesLakh: round(distributor.primarySalesLakh * multiplier, 1),
      secondarySalesLakh: round(distributor.secondarySalesLakh * multiplier, 1),
      outstandingDays: round(clamp(distributor.outstandingDays + (1 - regionFactor) * 9, 8, 60), 0),
      stockCoverDays: round(clamp(distributor.stockCoverDays + (role === 'salesperson' ? 1 : 0), 4, 18), 0),
      paymentStatus:
        distributor.outstandingDays > 38
          ? 'Critical'
          : distributor.outstandingDays > 24
            ? 'Watchlist'
            : 'Healthy',
    };
  });
}

function salesEasySummary(modules: SalesEasyModules): string {
  const allSignals = Object.values(modules).flat();
  const highImpact = allSignals.filter((signal) => signal.impact === 'High').length;
  const mediumImpact = allSignals.filter((signal) => signal.impact === 'Medium').length;

  return `${highImpact} high-impact and ${mediumImpact} medium-impact field signals captured by SalesEasy in the last 24 hours.`;
}

function actionCenter(role: Role, kpis: KpiMetric[], distributors: DistributorHealth[], logistics: LogisticsNode[]): ActionItem[] {
  const achievement = kpis.find((kpi) => kpi.id === 'achievement')?.value ?? 0;
  const weightedDistribution = kpis.find((kpi) => kpi.id === 'weighted_distribution')?.value ?? 0;
  const criticalDistributors = distributors.filter((dist) => dist.paymentStatus === 'Critical').length;
  const highRiskNodes = logistics.filter((node) => node.risk === 'High').length;

  const actions: ActionItem[] = [
    {
      id: 'ac-1',
      title:
        achievement < 95
          ? 'Close target gap with top 30 SKU-store pairs'
          : 'Push premium SKU mix in growth outlets',
      owner: role === 'salesperson' ? 'Salesperson' : 'Area Manager',
      dueDate: '2026-03-08',
      priority: 'P0',
      status: 'Open',
      impact: achievement < 95 ? 'Recover 2.1 Cr sales this cycle' : 'Improve gross margin by 1.4%',
    },
    {
      id: 'ac-2',
      title:
        highRiskNodes > 0
          ? 'Escalate logistics bottleneck nodes to supply planning'
          : 'Optimize route cadence for low-throughput beats',
      owner: role === 'trade_marketing_manager' ? 'SCM Lead' : 'Regional Logistics Lead',
      dueDate: '2026-03-06',
      priority: 'P1',
      status: highRiskNodes > 1 ? 'Open' : 'In Progress',
      impact: 'Reduce delayed dispatches by 18%',
    },
    {
      id: 'ac-3',
      title:
        criticalDistributors > 0
          ? 'Run focused receivables drive for watchlist distributors'
          : 'Launch retailer education on active schemes',
      owner: 'Finance + Sales Ops',
      dueDate: '2026-03-11',
      priority: criticalDistributors > 0 ? 'P0' : 'P2',
      status: 'Open',
      impact:
        criticalDistributors > 0
          ? 'Unlock working capital and reduce DSO by 2.5 days'
          : 'Improve scheme redemption by 9%',
    },
    {
      id: 'ac-4',
      title:
        weightedDistribution < 85
          ? 'Activate 120 dormant outlets in high-footfall pockets'
          : 'Expand display compliance checks in MT stores',
      owner: role === 'trade_marketing_manager' ? 'Trade Marketing' : 'Territory Sales',
      dueDate: '2026-03-09',
      priority: 'P1',
      status: 'In Progress',
      impact: 'Improve offtake velocity for top 10 SKUs',
    },
  ];

  return actions;
}

export function getDashboard(
  role: Role,
  region: string,
  channel: Channel,
  timeframe: Timeframe,
): DashboardData {
  const regionFactor = REGION_FACTORS[region] ?? 1;
  const user = pickUser(role, region);

  const kpis = kpiSet(role, regionFactor, timeframe);
  const salesTrend = trendSet(role, regionFactor, timeframe);
  const channelMix = channelMixSet(channel, role, regionFactor);
  const schemePerformance = schemeSet(role);
  const logistics = logisticsSet(regionFactor);
  const distributors = distributorSet(role, regionFactor);

  const salesEasy = {
    summary: salesEasySummary(SALES_EASY_MODULES),
    modules: SALES_EASY_MODULES,
  };

  const actions = actionCenter(role, kpis, distributors, logistics);

  return {
    user,
    filters: { region, channel, timeframe },
    kpis,
    salesTrend,
    channelMix,
    schemePerformance,
    logistics,
    distributors,
    salesEasy,
    actions,
  };
}

export function buildPrediagnosis(dashboard: DashboardData): Prediagnosis {
  const alerts: PrediagnosisAlert[] = [];

  const achievement = dashboard.kpis.find((kpi) => kpi.id === 'achievement')?.value ?? 0;
  const weightedDistribution =
    dashboard.kpis.find((kpi) => kpi.id === 'weighted_distribution')?.value ?? 0;
  const collectionEfficiency =
    dashboard.kpis.find((kpi) => kpi.id === 'collection_efficiency')?.value ?? 0;
  const stockCover = dashboard.kpis.find((kpi) => kpi.id === 'stock_cover')?.value ?? 0;

  const highRiskNodes = dashboard.logistics.filter((node) => node.risk === 'High');
  const lowFillNodes = dashboard.logistics.filter((node) => node.fillRate < 93);
  const criticalDistributors = dashboard.distributors.filter(
    (distributor) => distributor.paymentStatus === 'Critical',
  );

  if (achievement < 95) {
    alerts.push({
      id: 'al-target-gap',
      severity: 'High',
      title: 'Target closure risk in current cycle',
      detail: `Achievement is ${achievement.toFixed(1)}%, below the 95% safety threshold.`,
      recommendation:
        'Prioritize top-contributing outlets with low repeat offtake and run SKU-specific push plans within 72 hours.',
    });
  }

  if (weightedDistribution < 85) {
    alerts.push({
      id: 'al-distribution',
      severity: 'Medium',
      title: 'Distribution width slipping in active beats',
      detail: `Weighted distribution stands at ${weightedDistribution.toFixed(1)}%, reducing execution capacity for new schemes.`,
      recommendation:
        'Reactivate dormant outlets and ensure beat-level assortment compliance for top 12 SKUs.',
    });
  }

  if (highRiskNodes.length > 0) {
    alerts.push({
      id: 'al-logistics',
      severity: 'High',
      title: 'Logistics disruptions may trigger stockouts',
      detail: `${highRiskNodes.length} node(s) are flagged high risk with elevated dispatch delays.`,
      recommendation:
        'Reroute urgent loads through alternate cross-docks and freeze low-priority dispatches for 48 hours.',
    });
  }

  if (criticalDistributors.length > 0 || collectionEfficiency < 92) {
    alerts.push({
      id: 'al-collections',
      severity: 'Medium',
      title: 'Receivable stress across distributor network',
      detail: `${criticalDistributors.length} distributor(s) in critical status; collection efficiency at ${collectionEfficiency.toFixed(1)}%.`,
      recommendation:
        'Run a focused receivables sprint with credit control and link fresh dispatches to agreed payment milestones.',
    });
  }

  if (stockCover > 10 || lowFillNodes.length > 1) {
    alerts.push({
      id: 'al-inventory',
      severity: 'Low',
      title: 'Inventory imbalance signal',
      detail: `Average stock cover is ${stockCover.toFixed(1)} days with ${lowFillNodes.length} low-fill logistics node(s).`,
      recommendation:
        'Adjust replenishment frequency by outlet cluster and reduce over-allocation to low-velocity routes.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'al-stable',
      severity: 'Low',
      title: 'No critical risk cluster detected',
      detail: 'Current indicators are within stable operating range for this view.',
      recommendation: 'Sustain execution cadence and keep monitoring SalesEasy pulse signals every morning.',
    });
  }

  const suggestedFocus = [
    'Top 20 outlet-SKU interventions by expected upside',
    'Logistics node escalation matrix and alternate dispatch plans',
    'Distributor receivables watchlist and commitment follow-up',
    'Scheme education refresher in low-redemption beats',
  ];

  const highCount = alerts.filter((alert) => alert.severity === 'High').length;
  const headline =
    highCount > 0
      ? `Immediate action recommended: ${highCount} high-severity risk cluster(s) detected.`
      : 'Operations are mostly stable; monitor medium-risk indicators closely.';

  return {
    generatedAt: new Date().toISOString(),
    headline,
    alerts,
    suggestedFocus,
  };
}

export const APP_OPTIONS = {
  regions: Object.keys(REGION_FACTORS),
  channels: ['All', 'General Trade', 'Modern Trade', 'E-commerce', 'HoReCa'] as Channel[],
  timeframes: ['MTD', 'QTD', 'YTD'] as Timeframe[],
  roles: [
    'salesperson',
    'area_manager',
    'regional_manager',
    'trade_marketing_manager',
  ] as Role[],
};
