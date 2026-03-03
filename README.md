# FMCG SalesOS

A responsive full-stack Sales Operating System for FMCG teams with role-based dashboards, distribution and logistics command views, SalesEasy-connected intelligence feeds, and an AI copilot layer.

## What is included

- Role-based workspace for `Salesperson`, `Area Manager`, `Regional Manager`, and `Trade Marketing Manager`
- FMCG KPI dashboard with filters for region, channel, and planning horizon (MTD/QTD/YTD)
- Distributor command desk (coverage, throughput, receivables, stock cover)
- Logistics risk monitor (fill rate, OTIF, dispatch delays)
- Scheme performance and channel share analytics
- SalesEasy intelligence modules:
  - Market intelligence
  - Competitor pricing
  - Customer feedback
  - Retailer feedback
  - Display audit
- AI prediagnosis summary with prioritized risks
- Natural-language copilot Q&A over the selected dashboard context
- Mobile-first responsive layout and desktop control center UX

## Tech stack

- Frontend: React + TypeScript + Vite + Recharts
- Backend: Node.js + Express + TypeScript
- AI: OpenAI Responses API with deterministic fallback when no API key is configured

## Run locally

1. Install dependencies in all projects:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

2. Configure environment variables:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Optional: set `OPENAI_API_KEY` in `server/.env` to enable model-generated summaries and answers.

3. Start frontend + backend:

```bash
npm run dev
```

4. Open:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## API overview

- `GET /api/meta/options` - available roles, regions, channels, timeframes
- `POST /api/auth/login` - session bootstrap for role and region
- `GET /api/workspace` - combined dashboard + prediagnosis payload (optimized for fast first load)
- `GET /api/dashboard` - all dashboard data for selected filters
- `GET /api/prediagnosis` - risk alerts + AI summary
- `POST /api/ai/ask` - copilot question answering

## Demo mode (for static hosting)

- Set `VITE_DEMO_MODE=true` to run frontend with in-browser demo data (no backend required).
- Netlify deploy uses this mode by default via `netlify.toml`.

## Production notes

- Current auth is lightweight session bootstrap (no password/OAuth).
- Replace seeded domain data with live ERP/DMS/SFA/SalesEasy connectors.
- Add RBAC and JWT session verification middleware before production rollout.
- Add data persistence (PostgreSQL) and scheduler jobs for real-time feeds.
