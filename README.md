# Birdeye v2 — Share & Customize Flow

**GitHub:** https://github.com/balajik-cmyk/birdeyev2

Birdeye v2 UI prototype for the Share and Customize flow (Bird AI shell).
Original Figma file: https://www.figma.com/design/khkMRKdBSWf0LF0NqAvoEe/Prototype-Share-and-Customize-Flow

---

## Shared Storybook (canonical workflow)

**This repository is the single source of truth** for Storybook in **Birdeye v2**: `.storybook/`, stories under `src/stories/`, and the documented UI. Host the canonical copy in **one** org or public GitHub repository so everyone clones the same remote. You do not need a separate “Storybook-only” repo unless your team splits the app and design system later—this repo is already the place to **pull, install, and run** Storybook.

**Canonical remote:** `https://github.com/balajik-cmyk/birdeyev2.git` (HTTPS) or `git@github.com:balajik-cmyk/birdeyev2.git` (SSH, using your usual GitHub host alias if you use one).

**Private forks:** If someone works from a fork under their own account, add the canonical repo as **`upstream`** and pull from it to stay current:

```bash
git remote add upstream https://github.com/balajik-cmyk/birdeyev2.git
git fetch upstream
git checkout main   # or your default branch
git pull upstream main
```

---

## Prerequisites

- **Node.js** 18 or newer (20 LTS recommended)
- **npm** 9+ (this repo ships `package-lock.json`; use `npm ci` for clean installs)
- Optional: **pnpm** 8+ if you prefer `pnpm` over npm

---

## Setup

```bash
npm install
```

---

## Running the app

```bash
npm run dev
```

Opens at `http://localhost:5173`

---

## End-to-end tests (Playwright)

Browser automation tests run against the **real Vite app**. They complement **Storybook**, which focuses on components, tokens, and isolated views—not full navigation in the running product.

**First-time browser install** (if tests fail with a missing-browser error):

```bash
npx playwright install
```

On Linux CI agents, system deps are installed via `npx playwright install chromium --with-deps` (see [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)).

**Commands** (see [`package.json`](package.json)):

| Script | What it does |
| --- | --- |
| `npm run test:e2e` | Run all E2E tests (headless) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:headed` | Run with a visible browser |
| `npm run test:e2e:debug` | Step through with the inspector |
| `npm run test:e2e:report` | Open the last HTML report (`playwright show-report`) |

**Where tests live:** `tests/` (`*.spec.ts`). [`playwright.config.ts`](playwright.config.ts) sets `baseURL` to the Vite dev server and starts it automatically via `webServer` (`npm run dev` on `http://127.0.0.1:5173`). You do not need to run `npm run dev` in a separate terminal unless you are debugging the app while writing tests.

**CI:** GitHub Actions workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on **every push and pull request** (any branch), installs Chromium with `npm ci`, then `npx playwright test`. You can also run it **manually** from the Actions tab (**Run workflow**).

API and fixtures: [Playwright Test docs](https://playwright.dev/docs/intro).

---

## Storybook

Storybook is the living design system for **Birdeye v2** — every UI component,
app view, design token, and copy guideline in one place.

### Quick start (clone → install → run)

Use this when you open the project on a new machine or after cloning from the canonical remote.

1. **Clone** the repository.

   ```bash
   git clone https://github.com/balajik-cmyk/birdeyev2.git
   cd birdeyev2
   ```

2. **Install** dependencies.

   ```bash
   npm ci
   ```

   If you use pnpm instead:

   ```bash
   pnpm install
   ```

3. **Start Storybook.**

   ```bash
   npm run storybook
   ```

   With pnpm:

   ```bash
   pnpm storybook
   ```

   Opens at `http://localhost:6006`

### Start Storybook (after setup)

```bash
npm run storybook
```

Opens at `http://localhost:6006`

### Build Storybook (static output)

```bash
npm run build-storybook
```

Output goes to `storybook-static/`

### What's inside

| Section | Contents |
|---|---|
| **UI** | Button, Badge, Input, Card, Tabs, Select, Checkbox, Switch, Avatar, Alert, Progress, Skeleton, Separator, Textarea, RadioGroup, Slider, Tooltip, Dialog, DropdownMenu, Table, Accordion |
| **Design System** | Color tokens, typography scale, spacing & radius |
| **App / Sidebar** | Icon Strip + L2 nav — single story with `Active view` control to switch between all products |
| **App / AppShell** | Full page layout: Icon Strip + TopBar + L2 + content placeholder |
| **App / Views** | Dashboard, Reviews, Agents, Inbox, Contacts, Scheduled Deliveries, Shared by Me, TopBar |
| **Content / Voice & Tone** | Voice pillars, tone modes, word choices |
| **Content / Grammar & Style** | Core rules, capitalization, punctuation, numbers & dates, formatting |
| **Content / Microcopy Patterns** | Error messages, toasts, tooltips, empty states, confirmations, action labels, helper text |

### Theme switching

Use the **Sun / Moon toggle** in the Storybook toolbar to switch between light and dark mode across all stories.

### Stories live in

```
src/stories/          ← UI + app view stories
src/stories/copy/     ← content & copy guideline stories
```
