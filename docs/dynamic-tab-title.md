# Dynamic browser tab title

## Pattern

```
{Section} – Birdeye
```

- **Context first, brand last** — mirrors Linear, Figma, Vercel.
- **En dash (`–`)** — not hyphen (`-`) or em dash (`—`). B2B SaaS standard.
- **Section granularity** — section-level for now (no named entities in routing yet). Upgrade to entity-level (e.g. a specific contact name) when real URL routing is added.

## Source of truth

`src/app/appViewTitle.ts` — `getAppViewTitle(view: AppView)` is the single mapping from route to human label. Update it there; the tab title picks it up automatically.

## Implementation

One `useEffect` in `App.tsx`, watching `currentView`:

```ts
useEffect(() => {
  document.title = `${getAppViewTitle(currentView)} – Birdeye`;
}, [currentView]);
```

## Title reference

| AppView | Tab title |
|---|---|
| `agents-monitor`, `agents-builder`, `agent-detail`, `agents-analyze-performance`, `birdai-reports` | `BirdAI – Birdeye` |
| `agents-onboarding` | `BirdAI setup – Birdeye` |
| `inbox` | `Inbox – Birdeye` |
| `reviews` | `Reviews – Birdeye` |
| `social` | `Social – Birdeye` |
| `contacts` | `Contacts – Birdeye` |
| `listings` | `Listings – Birdeye` |
| `surveys` | `Surveys – Birdeye` |
| `ticketing` | `Ticketing – Birdeye` |
| `campaigns` | `Campaigns – Birdeye` |
| `insights` | `Insights – Birdeye` |
| `competitors` | `Competitors – Birdeye` |
| `dashboard`, `shared-by-me` | `Reports – Birdeye` |
| `business-overview` | `Overview – Birdeye` |
| `referrals` | `Referrals – Birdeye` |
| `payments` | `Payments – Birdeye` |
| `appointments` | `Appointments – Birdeye` |
| `scheduled-deliveries`, `schedule-builder` | `Scheduled deliveries – Birdeye` |

## Future upgrade

When real URL routing (React Router / TanStack Router) is added, switch to entity-level titles for detail views:

```
Acme Corp · Contacts – Birdeye
ENG-123 Fix login bug · Ticketing – Birdeye
```
