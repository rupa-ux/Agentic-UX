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

*Questions? Reach out in the #design-system Slack channel or tag an engineer
on your pull request. We are here to help.*
