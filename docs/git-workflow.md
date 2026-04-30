# Git workflow: `main` as source of truth

This document is the team convention for **birdeyev2** (and aligns with the shared **aero-ds** submodule rules below).

## Branch protection on `main`

**Goal:** No direct pushes to `main`; integrate only via pull request; optional required CI.

### Enable in GitHub (repository admin)

1. Open **Settings** → **Branches** → **Add branch protection rule** (or edit the rule for `main`).
2. **Branch name pattern:** `main`
3. Enable:
   - **Require a pull request before merging** (set minimum reviewers to `1` if you want mandatory review).
   - **Require status checks to pass before merging** → **Require branches to be up to date before merging** (recommended).
     - Add the check that runs on PRs. For this repo, after workflows have run at least once, pick the Playwright job (often listed as **Playwright Tests / test** or similar under “Status checks that are required”).
   - **Do not allow bypassing the above settings** (optional but strict).
4. Under **Rules applied to everyone including administrators**, decide whether admins may bypass (default off is stricter).

**Note:** On some **private** repositories, the REST API for branch protection returns `403` unless the org/repo is on a plan that includes the feature; configuration via the **web UI** is still the standard approach.

### Optional: automation via CLI

If your org allows it (public repo or eligible plan), an admin can script protection with the [GitHub REST API “Update branch protection”](https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection) or future `gh` extensions. Prefer the UI if API access is blocked.

---

## Updating feature branches: merge vs rebase (team convention)

**Convention for this repo: merge from `main` into your feature branch.**

When `main` moves ahead while your PR is open:

```bash
git fetch origin
git checkout your-feature-branch
git merge origin/main
# resolve conflicts, test, push
```

**Why merge (not rebase) here:** Keeps a clear history of when `main` was integrated into the branch; avoids force-pushing shared branches; matches default GitHub “merge PR into main” flows. If the whole org later standardizes on **rebase** for feature branches, update this section in one place—until then, use **merge** for `origin/main` → feature branch updates.

**Do not** resolve integration issues by committing directly on `main`.

---

## Submodule `aero-ds`: bump flow

The **`aero-ds`** directory is a **nested Git repository** (gitlink). Clones must be able to check out the recorded commit on **GitHub**.

### Rules

1. **Never commit secrets** in `aero-ds` (tokens in `.npmrc`, credentials in remotes). Push protection may block the whole repo; it is a security risk.
2. **The commit pinned in birdeyev2 must exist on `aero-ds`’s remote** (`origin` for [balajik-cmyk/aero-ds](https://github.com/balajik-cmyk/aero-ds)). After `git clone` + `git submodule update --init`, the checkout must succeed without “missing commit” errors.

### Recommended sequence when UI changes need `aero-ds`

1. In **`aero-ds`:** create a branch, commit, open a PR, merge to **`aero-ds`** `main`, **push** so the commit is on GitHub.
2. In **birdeyev2:** on your feature branch, point the submodule at that commit:
   ```bash
   cd aero-ds
   git fetch origin
   git checkout <sha-or-main>
   cd ..
   git add aero-ds
   git commit -m "chore: bump aero-ds to <short-reason>"
   ```
3. Open or update the **birdeyev2** PR that includes the submodule pointer change.

### Fresh clone

```bash
git clone <birdeyev2-url>
cd birdeyev2
git submodule update --init --recursive
```

---

## Quick reference

| Action | Command / location |
|--------|---------------------|
| Start feature | `git checkout main && git pull && git checkout -b feature/my-change` |
| Sync feature with `main` | `git fetch origin && git merge origin/main` |
| Submodule sync | `git submodule update --init --recursive` |
| Protect `main` | GitHub → Settings → Branches → protection rule for `main` |
