import { useEffect, useState } from 'react';

import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { fetchOptions, login } from './lib/api';
import type { AppOptions, Role, SessionUser } from './types/salesos';

const SESSION_KEY = 'sales_os_session_v1';

interface SessionState {
  token: string;
  user: SessionUser;
}

const FALLBACK_OPTIONS: AppOptions = {
  regions: ['North', 'South', 'East', 'West', 'Central'],
  channels: ['All', 'General Trade', 'Modern Trade', 'E-commerce', 'HoReCa'],
  timeframes: ['MTD', 'QTD', 'YTD'],
  roles: ['salesperson', 'area_manager', 'regional_manager', 'trade_marketing_manager'],
};

function readSession(): SessionState | null {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function App() {
  const [options, setOptions] = useState<AppOptions>(FALLBACK_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [session, setSession] = useState<SessionState | null>(() => readSession());
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const payload = await fetchOptions();

        if (!active) {
          return;
        }

        setOptions(payload);
      } catch {
        if (!active) {
          return;
        }

        setOptions(FALLBACK_OPTIONS);
      } finally {
        if (active) {
          setOptionsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(name: string, role: Role, region: string) {
    setLoginPending(true);
    setLoginError(null);

    try {
      const payload = await login(name, role, region);
      const nextSession: SessionState = {
        token: payload.token,
        user: payload.user,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to login.');
    } finally {
      setLoginPending(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (optionsLoading) {
    return <div className="boot-screen">Preparing SalesOS...</div>;
  }

  if (!session) {
    return (
      <LoginView
        options={options}
        pending={loginPending}
        error={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  return <DashboardView options={options} session={session.user} onLogout={handleLogout} />;
}

export default App;
