# Birdeye — Share & Customize Flow

UI prototype for the Birdeye Share and Customize flow.
Original Figma file: https://www.figma.com/design/khkMRKdBSWf0LF0NqAvoEe/Prototype-Share-and-Customize-Flow

---

## Prerequisites

- Node.js 18+
- npm 9+

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

### Start Storybook

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
