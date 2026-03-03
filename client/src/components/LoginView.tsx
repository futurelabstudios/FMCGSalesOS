import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { AppOptions, Role } from '../types/salesos';

interface LoginViewProps {
  options: AppOptions;
  pending: boolean;
  error: string | null;
  onSubmit: (name: string, role: Role, region: string) => Promise<void>;
}

const ROLE_LABEL: Record<Role, string> = {
  salesperson: 'Salesperson',
  area_manager: 'Area Manager',
  regional_manager: 'Regional Manager',
  trade_marketing_manager: 'Trade Marketing Manager',
};

export function LoginView({ options, pending, error, onSubmit }: LoginViewProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('regional_manager');
  const [region, setRegion] = useState('West');

  const canSubmit = useMemo(() => name.trim().length >= 2 && !pending, [name, pending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    await onSubmit(name.trim(), role, region);
  }

  return (
    <div className="login-shell">
      <div className="login-ambient" aria-hidden="true" />

      <div className="login-content">
        <div className="brand-hero">
          <div className="brand-avatar">
            <img src="/salesos-mark.svg" alt="SalesOS" width={42} height={42} />
          </div>
          <h1>SalesOS</h1>
          <p>
            AI-powered operating system for FMCG sales, distribution, logistics, and trade
            execution.
          </p>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <label>
            <span>Your Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Rahul Verma"
              autoComplete="name"
            />
          </label>

          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {options.roles.map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABEL[item]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {options.regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={!canSubmit}>
            {pending ? 'Signing in...' : 'Enter SalesOS'}
          </button>

          <div className="login-pills">
            <span>
              <ShieldCheck size={14} /> Role-based views
            </span>
            <span>
              <Building2 size={14} /> Distributor intelligence
            </span>
            <span>
              <MapPin size={14} /> Logistics + market pulse
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
