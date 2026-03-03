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

export interface SessionUser {
  name: string;
  role: Role;
  region: string;
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
  user: {
    id: string;
    name: string;
    role: Role;
    region: string;
    office: string;
    territory: string;
  };
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
  aiSummary: string;
  aiSource: 'openai' | 'rule';
}

export interface AppOptions {
  regions: string[];
  channels: Channel[];
  timeframes: Timeframe[];
  roles: Role[];
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}

export interface AskResponse {
  answer: string;
  source: 'openai' | 'rule';
  timestamp: string;
}

export interface WorkspaceResponse {
  dashboard: DashboardData;
  prediagnosis: Prediagnosis;
  meta: {
    fetchedAt: string;
    responseMs: number;
  };
}
