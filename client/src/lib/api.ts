import type {
  AppOptions,
  AskResponse,
  Channel,
  DashboardData,
  LoginResponse,
  Prediagnosis,
  Role,
  Timeframe,
  WorkspaceResponse,
} from '../types/salesos';
import { DEMO_OPTIONS, demoAsk, demoLogin, demoWorkspace } from './demoData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  window.location.hostname.endsWith('.netlify.app');

export interface Filters {
  role: Role;
  region: string;
  channel: Channel;
  timeframe: Timeframe;
}

interface RequestOptions extends RequestInit {
  parseAsText?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (options.parseAsText) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

function toQuery(filters: Filters): string {
  const params = new URLSearchParams({
    role: filters.role,
    region: filters.region,
    channel: filters.channel,
    timeframe: filters.timeframe,
  });

  return params.toString();
}

export async function fetchOptions(): Promise<AppOptions> {
  if (DEMO_MODE) {
    return DEMO_OPTIONS;
  }

  return request<AppOptions>('/meta/options');
}

export async function login(name: string, role: Role, region: string): Promise<LoginResponse> {
  if (DEMO_MODE) {
    return demoLogin(name, role, region);
  }

  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name, role, region }),
  });
}

export async function fetchDashboard(filters: Filters): Promise<DashboardData> {
  if (DEMO_MODE) {
    const payload = await demoWorkspace(filters);
    return payload.dashboard;
  }

  return request<DashboardData>(`/dashboard?${toQuery(filters)}`);
}

export async function fetchPrediagnosis(filters: Filters): Promise<Prediagnosis> {
  if (DEMO_MODE) {
    const payload = await demoWorkspace(filters);
    return payload.prediagnosis;
  }

  return request<Prediagnosis>(`/prediagnosis?${toQuery(filters)}`);
}

export async function fetchWorkspace(filters: Filters): Promise<WorkspaceResponse> {
  if (DEMO_MODE) {
    return demoWorkspace(filters);
  }

  return request<WorkspaceResponse>(`/workspace?${toQuery(filters)}`);
}

export async function askCopilot(
  question: string,
  filters: Filters,
): Promise<AskResponse> {
  if (DEMO_MODE) {
    return demoAsk(question);
  }

  return request<AskResponse>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({
      question,
      role: filters.role,
      region: filters.region,
      channel: filters.channel,
      timeframe: filters.timeframe,
    }),
  });
}
