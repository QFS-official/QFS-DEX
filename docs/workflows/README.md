# Workflows (reference copies)

These files are reference copies of the GitHub Actions workflows.
The actual workflow files live in `.github/workflows/` and must be created via the
GitHub web UI (because pushing `.github/workflows/*.yml` via git/API requires a
GitHub PAT with `workflow` scope).

## How to install these workflows

1. Open each file in this folder (`ci.yml` and `deploy.yml`) and copy its content.
2. Go to https://github.com/QFS-official/QFS-DEX/actions/new
3. Click "set up a workflow yourself"
4. Rename the file from `main.yml` to `ci.yml` (or `deploy.yml`)
5. Paste the content
6. Click "Commit changes"
7. Repeat for the other file

## Required GitHub secrets

The deploy workflow reads these secrets (already configured in this repo):

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token (from https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel team/org ID (from dashboard settings) |
| `VERCEL_PROJECT_ID` | Vercel project ID (from project settings) |
| `DATABASE_URL` | Database connection URL (or local SQLite placeholder) |

## Vercel project details

- **Project name**: `qfs-dex`
- **Project ID**: `prj_XTK4HhISHrbswtuO1klzTQb4ulWL`
- **Org/Team ID**: `team_4jQJrPzpyVVB6Vmv8X6gJiWB`
- **Framework**: Next.js (auto-detected)
- **Git link**: none (deploy is driven by GitHub Actions, not Vercel's git integration)

## Helper script

`scripts/set-github-secrets.py` can be used to set the GitHub secrets programmatically
using the Vercel + GitHub tokens. It uses `pynacl` for libsodium sealed-box encryption:

```bash
pip3 install pynacl
export GH_TOKEN=ghp_xxx       # GitHub PAT with 'repo' scope
export VERCEL_TOKEN=vcp_xxx
export VERCEL_ORG_ID=team_xxx
export VERCEL_PROJECT_ID=prj_xxx
python3 scripts/set-github-secrets.py QFS-official QFS-DEX
```
