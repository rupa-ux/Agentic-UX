# Birdeye — Share & Customize Flow

UI prototype for the Birdeye Share and Customize flow.
Original Figma file: https://www.figma.com/design/khkMRKdBSWf0LF0NqAvoEe/Prototype-Share-and-Customize-Flow

---

## Shared Storybook (canonical workflow)

**This repository is the single source of truth** for Storybook in this project: `.storybook/`, stories under `src/stories/`, and the documented UI. Host the canonical copy in **one** org or public GitHub repository so everyone clones the same remote. You do not need a separate “Storybook-only” repo unless your team splits the app and design system later—this repo is already the place to **pull, install, and run** Storybook.

**Ownership:** Decide which account or org owns the official remote (for example your company org on GitHub). Document that URL in your internal wiki if needed; the clone URL is always `https://github.com/<org-or-user>/<repo>.git` or the SSH equivalent.

**Private forks:** If someone works from a fork under their own account, add the canonical repo as **`upstream`** and pull from it to stay current:

```bash
git remote add upstream https://github.com/<org-or-user>/<repo>.git
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

## Storybook

Storybook is the living design system for this project — every UI component,
app view, design token, and copy guideline in one place.

### Quick start (clone → install → run)

Use this when you open the project on a new machine or after cloning from the canonical remote.

1. **Clone** the repository (replace the URL with your canonical remote).

   ```bash
   git clone https://github.com/<org-or-user>/<repo>.git
   cd <repo>
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
