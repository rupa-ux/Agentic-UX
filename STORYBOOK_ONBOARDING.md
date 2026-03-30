# Storybook Design System — Designer Onboarding Guide

Welcome! This guide will walk you through everything you need to start using,
viewing, and contributing to our Storybook design system. No deep engineering
knowledge required — just follow the steps and you will be up and running in
under 15 minutes.

---

## Table of Contents

1. [What Is Storybook?](#1-what-is-storybook)
2. [Prerequisites](#2-prerequisites)
3. [Access Setup](#3-access-setup)
4. [Local Setup](#4-local-setup)
5. [Running Storybook](#5-running-storybook)
6. [Branching Workflow](#6-branching-workflow)
7. [Making Changes](#7-making-changes)
8. [Pushing Changes & Pull Requests](#8-pushing-changes--pull-requests)
9. [Best Practices](#9-best-practices)
10. [Troubleshooting](#10-troubleshooting)
11. [Glossary](#11-glossary)
12. [Using Storybook as an MCP to Build Products with AI](#12-using-storybook-as-an-mcp-to-build-products-with-ai)

---

## 1. What Is Storybook?

Think of Storybook as a **living catalogue of every UI component** in our product.

Instead of hunting through the app to find a button or a card, you open Storybook
and see every component laid out in one place — with all its variants, states, and
sizes. It works like a design playground: you can toggle controls, switch between
light and dark mode, and inspect exactly how something behaves without touching the
real product.

**Why designers use it:**
- See what already exists before designing something new
- Verify that a component looks right in every state (loading, empty, error)
- Propose changes to a component directly alongside the code
- Share a link to a specific component with engineers

---

## 2. Prerequisites

Before you start, make sure you have the following:

### A GitHub Account
If you do not have one, sign up for free at [github.com](https://github.com).
Ask your team lead to invite you to the repository once your account is ready.

### Node.js (version 18 or higher)
Node.js is a tool that lets your computer run the project locally. To check if
you already have it:

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Type the following and press Enter:

```
node --version
```

If you see a number like `v20.10.0`, you are good. If you see an error or a
version below 18, download the latest LTS version from [nodejs.org](https://nodejs.org).

### Git
Git is how we track and share changes to the project. Check if you have it:

```
git --version
```

If nothing shows up, download Git from [git-scm.com](https://git-scm.com).

### A Code Editor (optional but recommended)
[Visual Studio Code](https://code.visualstudio.com) is free and works great.
You do not need to write code — it is just a convenient way to browse files.

---

## 3. Access Setup

### Step 1 — Request Repository Access

Send your GitHub username to your team lead or engineering contact and ask to be
added as a **Collaborator** on the repository. You will receive an email invitation
from GitHub. Accept it.

### Step 2 — Find the Repository

Once you have access, go to the repository URL shared by your team. It will look
something like:

```
https://github.com/your-org/your-repo-name
```

Bookmark it — you will come back here often.

---

## 4. Local Setup

"Local setup" means downloading the project to your own computer so you can run
it and make changes.

### Step 1 — Clone the Repository

Cloning means copying the repository from GitHub to your computer.

1. Open Terminal
2. Navigate to the folder where you want to keep the project. For example, to put
   it on your Desktop:

```
cd ~/Desktop
```

3. Copy the repository URL from GitHub (click the green **Code** button, then copy
   the HTTPS link)
4. Run:

```
git clone https://github.com/your-org/your-repo-name.git
```

5. Move into the project folder:

```
cd your-repo-name
```

You now have a local copy of the project on your computer.

### Step 2 — Install Dependencies

Dependencies are the third-party packages the project needs to work. Think of it
like installing apps — you only need to do this once (and again whenever someone
updates the project's requirements).

```
npm install
```

This may take a minute or two. You will see a progress bar in Terminal. Once it
finishes, you are ready.

> **Tip:** If you see warnings in yellow, that is usually fine. Only worry if you
> see red error messages.

---

## 5. Running Storybook

### Start Storybook

```
npm run storybook
```

After about 10–20 seconds, you will see something like this in Terminal:

```
╭────────────────────────────────────────╮
│                                        │
│   Storybook 8 for react-vite started  │
│                                        │
│    Local:   http://localhost:6006/     │
│                                        │
╰────────────────────────────────────────╯
```

Your browser should open automatically. If it does not, copy
`http://localhost:6006` and paste it into your browser.

### Navigating Storybook

- **Left sidebar** — browse components by category (UI, App, Design System)
- **Canvas** — the live preview of the selected component
- **Controls panel** (bottom) — change props like label text, variant, or size
  without touching any code
- **Sun / Moon toggle** (top toolbar) — switch between light and dark mode

### Stop Storybook

Go back to Terminal and press `Ctrl + C`.

---

## 6. Branching Workflow

A **branch** is your own isolated workspace. Changes you make on a branch do not
affect the main project until they are reviewed and merged by the team. This keeps
the shared codebase safe.

### Always Start From the Latest Main Branch

Before creating a branch, make sure you have the latest version of the project:

```
git checkout main
git pull
```

### Create a New Branch

```
git checkout -b feature/your-branch-name
```

Replace `your-branch-name` with something descriptive (see naming conventions below).

**Example:**

```
git checkout -b feature/button-loading-state
```

### Branch Naming Conventions

Use lowercase letters and hyphens. Always prefix with a category:

| Prefix | When to use | Example |
|---|---|---|
| `feature/` | Adding a new component or story | `feature/avatar-sizes` |
| `update/` | Changing or improving an existing component | `update/badge-dark-mode` |
| `fix/` | Correcting a visual bug or broken story | `fix/input-disabled-state` |
| `tokens/` | Updating colors, spacing, or typography | `tokens/new-chart-colors` |

**Good branch names:**
```
feature/modal-empty-state
update/sidebar-dark-mode
fix/progress-bar-animation
```

**Avoid:**
```
my-changes
test123
johns-branch
```

### When to Create a New Branch vs. Update an Existing One

**Create a new branch when:**
- You are starting work on a component that has not been added to Storybook yet
- You are making a change unrelated to anything already in progress
- You are picking up a new task from the backlog

**Update your existing branch when:**
- You received feedback on a pull request and need to make revisions
- You are continuing work you already started on that branch

> **Rule of thumb:** One branch = one focused piece of work. Keep them small.

---

## 7. Making Changes

### Understanding the File Structure

Stories live in the `src/stories/` folder. Each component has its own file:

```
src/
  stories/
    Button.stories.tsx       ← Button component stories
    Badge.stories.tsx        ← Badge component stories
    Sidebar.stories.tsx      ← Sidebar navigation stories
    AppShell.stories.tsx     ← Full page layout stories
    DesignTokens.stories.tsx ← Colors, typography, spacing
```

A "story" is just a single scenario or state of a component — for example,
`Button / Disabled` or `Card / With Action`.

### Adding a New Story (Example: a New Button Variant)

Open the relevant file in VS Code. Stories follow this pattern:

```tsx
export const MyNewStory: Story = {
  name: "Button / My New Variant",
  render: () => (
    <Button variant="outline" size="lg">
      Click me
    </Button>
  ),
};
```

- `name` — what appears in the left sidebar of Storybook (use `Category / Label`)
- `render` — the component as it should look for this story

You do not need to understand all the code. Focus on the `render` section — that
is the visual part.

### Handling Variants, States, and Traits

Every component should have stories covering its full range. Use this checklist:

**Variants** — different visual styles
```
Default, Primary, Secondary, Outline, Ghost, Destructive
```

**Sizes**
```
Small (sm), Default, Large (lg), Icon-only
```

**States** — different conditions the component can be in

| State | When it applies |
|---|---|
| Default | The normal, resting state |
| Hover | When a user's cursor is over it |
| Active / Pressed | When being clicked |
| Disabled | When interaction is not allowed |
| Loading | When waiting for data |
| Empty | When there is no content to show |
| Error | When something went wrong |

**Example — covering states for an Input:**

```tsx
export const Default: Story = {
  args: { placeholder: "Enter text…" },
};

export const Disabled: Story = {
  args: { placeholder: "Not editable", disabled: true },
};

export const WithError: Story = {
  args: { placeholder: "Email", "aria-invalid": true },
};
```

### Maintaining Consistency

- **Match the Figma names** — if a component is called "Input / Error" in Figma,
  use that exact name in the story's `name` field
- **Use design tokens** — always reference color and spacing variables
  (e.g., `bg-primary`, `text-muted-foreground`) rather than hardcoded values like
  `#030213`. This ensures light and dark mode work automatically
- **Keep stories focused** — one story = one scenario. Do not combine multiple
  unrelated states into a single story
- **Check both themes** — after adding a story, toggle the Sun/Moon button in
  Storybook to verify it looks correct in both light and dark mode

---

## 8. Pushing Changes & Pull Requests

Once your changes look good in Storybook, it is time to share them with the team.

### Step 1 — Save Your Changes (Commit)

A commit is a saved snapshot of your changes with a message describing what you did.

First, see what you changed:

```
git status
```

Stage the files you want to include:

```
git add src/stories/Button.stories.tsx
```

Or stage everything at once:

```
git add .
```

Write a clear commit message:

```
git commit -m "feat: add loading and disabled states to Button stories"
```

**Commit message format:**

```
type: short description of what changed
```

| Type | Meaning |
|---|---|
| `feat` | Added something new |
| `update` | Improved something existing |
| `fix` | Fixed a bug or visual issue |
| `tokens` | Changed design tokens |

**Good commit messages:**
```
feat: add avatar stack story with overflow indicator
update: improve badge dark mode contrast
fix: correct spacing in card footer story
```

**Avoid:**
```
updated stuff
WIP
asdfgh
```

### Step 2 — Push to GitHub

```
git push origin feature/your-branch-name
```

This sends your branch and commits to GitHub so others can see them.

### Step 3 — Open a Pull Request

1. Go to the repository on GitHub
2. You will see a yellow banner: **"Compare & pull request"** — click it
3. Fill in the pull request form:

**Title** — a one-line summary of the change:
```
feat: add loading and disabled states to Button stories
```

**Description** — a brief explanation. Use this template:

```
## What changed
- Added Loading story (spinner + disabled state)
- Added Disabled story
- Added WithIcon story showing all icon placements

## How to review
Open Storybook → UI / Button and check the new stories.
Toggle light/dark mode to verify both themes.

## Screenshots
[Paste a screenshot of the stories in Storybook here]
```

4. Assign a reviewer (usually a senior designer or engineer on the team)
5. Click **Create pull request**

> **Tip:** Adding a screenshot of your story in the PR description makes reviews
> much faster — the reviewer can see the change at a glance without running the
> project.

### Step 4 — Address Feedback

If reviewers leave comments, make your changes locally, commit them, and push
again to the same branch. The pull request updates automatically.

Once approved, someone will merge it into `main`.

---

## 9. Best Practices

### Keep Changes Small and Focused
One pull request should do one thing. Instead of adding five new components at
once, add them one at a time. Smaller PRs get reviewed faster and are easier to
understand.

### Follow Naming Conventions
Consistent naming makes the catalogue easier to search and maintain:
- Story names: `Category / Sub-category / Variant` (e.g., `UI / Button / Destructive`)
- Branch names: `type/short-description` (e.g., `feature/empty-state-card`)
- File names: `ComponentName.stories.tsx` (e.g., `Tooltip.stories.tsx`)

### Always Include All States
A component is not complete in Storybook until it covers:
- Default
- Disabled
- Loading (if the component fetches data)
- Empty (if the component can have no content)
- Error (if the component can fail)

Missing states are how visual bugs slip into production unnoticed.

### Do Not Duplicate Components
Before adding something new, search the left sidebar in Storybook. If a similar
component already exists, update it with the missing variant rather than creating
a new one from scratch.

### Test Both Light and Dark Mode
Every story should look intentional in both themes. Use the Sun/Moon toolbar
button after every change.

### Sync With Main Regularly
If you have been on your branch for a few days, pull the latest changes from main
to avoid conflicts:

```
git checkout main
git pull
git checkout feature/your-branch-name
git merge main
```

### Ask Before Changing Shared Components
Components like `Button`, `Input`, and `Card` are used everywhere. Flag changes
to these in Slack or a ticket before starting — they need extra review.

---

## 10. Troubleshooting

### "npm install" fails

Try deleting the `node_modules` folder and running install again:

```
rm -rf node_modules
npm install
```

### Storybook does not open in the browser

Manually paste `http://localhost:6006` into your browser. If that also fails,
check if another application is using port 6006 and close it.

### "Port 6006 is already in use"

Another instance of Storybook is still running. Find and stop it:

```
lsof -ti:6006 | xargs kill
```

Then run `npm run storybook` again.

### My changes are not showing up in Storybook

Make sure you saved the file (Cmd+S / Ctrl+S). Storybook should automatically
reload. If it does not, stop Storybook with `Ctrl+C` and start it again with
`npm run storybook`.

### Git says "your branch is behind main"

You need to pull the latest changes:

```
git pull origin main
```

If there are conflicts, reach out to an engineer for help resolving them.

### I accidentally committed to main

Do not push. Let an engineer know immediately — this is fixable as long as nothing
has been pushed to the remote.

---

## 11. Glossary

| Term | Plain English meaning |
|---|---|
| **Repository (repo)** | The project folder on GitHub, including all its history |
| **Clone** | Download a copy of the repo to your computer |
| **Branch** | Your own isolated workspace for making changes |
| **Commit** | A saved snapshot of your changes with a label |
| **Push** | Send your local commits to GitHub |
| **Pull request (PR)** | A request to merge your branch into the shared main branch |
| **Merge** | Combining one branch's changes into another |
| **Main branch** | The stable, shared version of the project everyone works from |
| **Dependencies** | External packages the project needs (installed via `npm install`) |
| **Story** | A single visual scenario or state of a component in Storybook |
| **Design token** | A named variable for a design value (color, spacing, radius) |
| **Variant** | A different visual style of the same component (e.g., outline vs. filled) |
| **State** | A condition a component can be in (default, disabled, loading, error) |

---

## Quick Reference Card

```
# One-time setup
git clone <repo-url>
cd <repo-name>
npm install

# Every time you start new work
git checkout main
git pull
git checkout -b feature/your-work-name
npm run storybook          → opens http://localhost:6006

# When you are ready to share
git add .
git commit -m "feat: describe your change"
git push origin feature/your-work-name
# Then open a pull request on GitHub
```

---

## 12. Using Storybook as an MCP to Build Products with AI

This section explains how to connect Claude Code to your running Storybook
instance so the AI can read your entire design system — every component,
every variant, every token — and use that context to build new product
screens that match your patterns exactly.

### What is MCP?

MCP stands for **Model Context Protocol**. It is a standard that lets AI
tools like Claude connect to external data sources — in this case, your
Storybook — and query them in real time while generating code.

Without MCP, you would have to copy-paste component documentation into a
chat every time you want AI help. With MCP, Claude automatically knows:

- Every component in your Storybook and its available props
- Every variant and state that already exists
- Your design tokens (colors, spacing, radius)
- Your copy guidelines (voice, tone, microcopy patterns)
- The exact import paths to use

Think of it as giving Claude a live connection to your design system so it
builds with what you already have instead of inventing new patterns.

---

### Prerequisites

- Storybook running locally at `http://localhost:6006` (`npm run storybook`)
- [Claude Code](https://claude.ai/code) installed (the CLI or desktop app)
- Node.js 18 or higher

---

### Step 1 — Install the Storybook MCP Server

The Storybook MCP server is a small package that exposes your Storybook's
component index over a protocol Claude can read.

```
npm install --save-dev @storybook/mcp
```

---

### Step 2 — Configure Claude Code to Use It

Claude Code reads MCP server configuration from a settings file. Add the
Storybook server to your Claude Code configuration.

**Option A — Project-level (recommended for team use)**

Create a `.claude/settings.json` file in the root of this repository:

```json
{
  "mcpServers": {
    "storybook": {
      "command": "npx",
      "args": [
        "-y",
        "@storybook/mcp",
        "--storybook-url",
        "http://localhost:6006"
      ]
    }
  }
}
```

This file is committed to the repo so every team member gets the same
configuration automatically when they clone.

**Option B — Global (for your own machine only)**

Open `~/.claude/settings.json` (create it if it does not exist) and add
the same `mcpServers` block above.

---

### Step 3 — Start Storybook, Then Start Claude Code

Order matters. Storybook must be running before Claude Code starts so the
MCP server has something to connect to.

```
# Terminal 1 — keep this running
npm run storybook

# Terminal 2 — start Claude Code
claude
```

When Claude Code launches, it will detect the MCP configuration and connect
to your Storybook. You will see a confirmation in the Claude Code output:

```
MCP server "storybook" connected
```

---

### Step 4 — What Claude Can Now See

Once connected, Claude can query your design system at any time:

| What Claude can access | Example |
|---|---|
| Full component list | Every story in the left sidebar |
| Component props & controls | All args for Button (variant, size, disabled…) |
| Existing stories | The exact code for `Button / Destructive` |
| Design tokens | Colors, spacing, radius variables from `DesignTokens` |
| Copy guidelines | Voice & Tone, Microcopy Patterns stories |
| App shell layout | AppShell story showing how the full layout fits together |

Claude will use this to make sure every piece of code it generates:
- Uses components that already exist (not new ones from scratch)
- Follows your naming conventions and import paths
- Respects light and dark mode tokens
- Matches the voice and copy patterns in your content stories

---

### Step 5 — Build a New Product Screen

Here is the complete workflow for using Claude + Storybook MCP to build a
new screen.

#### 5.1 — Describe what you want in plain language

You do not need to write any code. Just describe the screen:

```
Build a new "Team Members" page. It should have a page header with a
title and a primary "Invite member" button. Below that, show a table
with columns: Name, Email, Role, and Status. Include an empty state
for when there are no members yet.
```

Claude will look up your Storybook to find the right components before
writing a single line of code.

#### 5.2 — Ask Claude to check what already exists first

This is the key habit. Before asking for new code, prompt Claude to search
your Storybook:

```
Check our Storybook for any existing table, button, badge, and empty
state components before building this screen.
```

Claude will query the MCP server, find `UI / Table`, `UI / Button`,
`UI / Badge`, and `Content / Microcopy Patterns / Empty States`, and use
those exact components in its output.

#### 5.3 — Ask for a Storybook story first, then the page component

A good workflow is to have Claude write the story before the real component.
This gives you a visual preview in Storybook before any page code is written:

```
Write a Storybook story for the Team Members page first so I can review
it before we build the real component.
```

Claude creates `src/stories/TeamMembersPage.stories.tsx`. Open Storybook
and approve the layout. Then:

```
The story looks good. Now build the real TeamMembersPage component
using the same structure.
```

#### 5.4 — Ask Claude to follow your copy guidelines

Your Storybook includes `Content / Microcopy Patterns` stories. Tell Claude
to use them:

```
Make sure all labels, button text, empty state copy, and error messages
follow the patterns in our Storybook copy guidelines.
```

Claude will look up the MCP data for voice, tone, empty state structure,
and error message format before writing any text.

---

### Practical Prompt Templates

Copy and adapt these when starting a new build session.

**Starting a new screen:**
```
Storybook is running at localhost:6006. Check it for existing components
before writing any code. I want to build [screen name]. It should include
[describe the content and layout].
```

**Adding a new component:**
```
Look at our Storybook first. We need a new [component name] component.
Check if anything similar already exists. If it does, extend it with a
new variant rather than creating from scratch.
```

**Fixing a visual inconsistency:**
```
Check our Storybook DesignTokens story for the correct colors and spacing.
Update [component/file] to use the token variables instead of hardcoded
values.
```

**Generating copy for a new screen:**
```
Read our Storybook copy guidelines (Content / Voice & Tone and
Content / Microcopy Patterns). Write all labels, helper text, empty
states, and error messages for [screen name] following those patterns.
```

**Full new feature build:**
```
I need to build [feature name]. Before writing any code:
1. Check Storybook for all existing components we should reuse
2. Check the AppShell story for the correct layout structure
3. Check our copy guidelines for text patterns
Then build the feature using what already exists.
```

---

### What Good Output Looks Like

When Claude uses the Storybook MCP correctly, the generated code will:

- Import components from `@/app/components/ui/` — not from scratch
- Use CSS token classes (`bg-primary`, `text-muted-foreground`) — not
  hardcoded hex values
- Have copy that matches the voice and structure in the microcopy stories
- Include a story file alongside the component so it appears in Storybook
  immediately
- Work in both light and dark mode without any extra changes

If Claude starts generating components that do not exist in your Storybook
or uses hardcoded colors, prompt it to re-check:

```
Re-check the Storybook MCP. Use the existing components and tokens
instead of creating new ones.
```

---

### Adding the MCP Config to the Repository

To make this setup automatic for everyone on the team, commit the settings
file:

```
git add .claude/settings.json
git commit -m "feat: add Storybook MCP configuration for Claude Code"
```

Now every team member who clones the repo and runs `claude` gets the
Storybook MCP connection for free — no individual setup required.

---

### Troubleshooting the MCP Connection

**Claude says it cannot connect to Storybook**

Make sure Storybook is running before starting Claude Code:
```
npm run storybook    # wait until you see "Storybook started"
claude               # then start Claude Code
```

**Claude is not finding components I know exist**

Ask Claude to re-query the MCP:
```
Please re-read the Storybook MCP data and list all components you can see.
```

**The MCP server is not listed when Claude Code starts**

Check that your `.claude/settings.json` is valid JSON and that the file is
in the project root. Then restart Claude Code.

---

*Questions? Reach out in the #design-system Slack channel or tag an engineer
on your pull request. We are here to help.*
