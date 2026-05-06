---
name: ops
description: >
  DevOps, infrastructure, and deployment context for this project. Load for any
  task involving CI/CD pipelines, environment configuration, Docker, cloud infra,
  monitoring, alerts, scaling, secrets management, or anything related to how the
  application runs in production. Also load when troubleshooting infrastructure
  issues or setting up new environments.
---

# Ops Skill

Everything needed to manage, deploy, and operate this project reliably.

---

## Infrastructure Overview

- **Hosting:** [e.g. Vercel / AWS / Railway / Fly.io / GCP]
- **Database:** [e.g. Supabase / PlanetScale / RDS / Neon]
- **Storage:** [e.g. Supabase Storage / S3 / Cloudflare R2]
- **CDN:** [e.g. Cloudflare / Vercel Edge / CloudFront]
- **Monitoring:** [e.g. Sentry / Datadog / Axiom / none]
- **CI/CD:** [e.g. GitHub Actions / Vercel auto-deploy / CircleCI]

---

## Environments

| Environment | URL | Branch | Purpose |
|---|---|---|---|
| Local | localhost:[PORT] | any | Development |
| Staging | [URL] | develop | Pre-production testing |
| Production | [URL] | main | Live users |

---

## Deployment Process

### Normal deploy (staging)
```bash
git push origin develop
# Auto-deploys to staging via [CI/CD tool]
# Check: [WHERE TO VERIFY DEPLOY STATUS]
```

### Normal deploy (production)
```bash
# Option A: Auto-deploy
git push origin main

# Option B: Manual
[YOUR MANUAL DEPLOY COMMAND]
```

### Pre-deploy checklist
- [ ] No failing tests in CI
- [ ] Staging verified working
- [ ] Any pending DB migrations coordinated
- [ ] No open "CRITICAL" issues
- [ ] Team notified if it's a significant change

### Rollback
```bash
# Rollback to previous version
[YOUR ROLLBACK COMMAND]

# Emergency: take site down temporarily
[YOUR MAINTENANCE MODE COMMAND]
```

---

## Environment Variables

### How we manage secrets
[e.g. "Stored in Vercel dashboard / AWS Secrets Manager / 1Password"]

### Adding a new secret
1. Add to `.env.example` with a placeholder value and a comment
2. Add to this skill file (name only, never value)
3. Add to [staging environment — how]
4. Add to [production environment — how]
5. Tell the team (Slack / PR comment) so everyone updates their local `.env`

### Required variables by environment

```bash
# All environments
DATABASE_URL=
NODE_ENV=

# Production only
[PROD_ONLY_VAR]=

# Staging only
[STAGING_ONLY_VAR]=
```

---

## CI/CD Pipeline

```yaml
# Pipeline runs on every PR:
steps:
  - Install dependencies
  - Lint
  - Type check
  - Run tests
  - Build

# Deploys automatically when:
  - develop branch: → staging
  - main branch: → production
```

---

## Monitoring and Alerts

### Where to look when something breaks
1. [Error tracker URL — e.g. Sentry dashboard]
2. [Log viewer URL — e.g. Axiom / Datadog / Vercel logs]
3. [Database dashboard URL]
4. [Hosting dashboard URL]

### Alert channels
- Critical errors → [e.g. PagerDuty / Slack #alerts]
- Performance issues → [e.g. Slack #monitoring]
- Deployments → [e.g. Slack #deployments]

### Key metrics to watch after a deploy
- Error rate (should not increase)
- P95 response time (should stay under [X]ms)
- [Any business metric — e.g. signup conversion, checkout completion]

---

## Database Operations

### Backups
- Frequency: [e.g. daily automatic via Supabase]
- Retention: [e.g. 7 days]
- How to restore: [steps or link to docs]

### Running migrations in production
```bash
# Always do this in a maintenance window for large migrations
# 1. Backup the database first
# 2. Run migration
[YOUR MIGRATION COMMAND]
# 3. Verify the migration ran correctly
# 4. Monitor for errors
```

### Never do in production without approval
- `DROP TABLE` or `DROP COLUMN`
- Removing an index on a high-traffic table
- Large data backfills during peak hours

---

## Scaling Considerations

- [e.g. "The app is stateless — horizontal scaling is safe"]
- [e.g. "Database connection pooling is via PgBouncer — don't bypass it"]
- [e.g. "Image processing is CPU-heavy — put it in a background job, not a request"]

---

## On-Call Runbook

### Service is down
1. Check [hosting status page]
2. Check [database status page]
3. Check recent deploys — was anything released in the last hour?
4. Check error logs for the first error
5. If it's a code issue: rollback → investigate → fix forward
6. If it's an infra issue: escalate to [WHO]

### Database is slow
1. Check [database monitoring dashboard]
2. Look for long-running queries
3. Check if a migration is running
4. Check connection count — are we hitting limits?

### Errors spiking after deploy
1. Immediately rollback if user-impacting
2. Check the diff between the broken deploy and the previous one
3. Reproduce locally
4. Fix and redeploy

---

## Self-Audit (run when asked to check ops/infra)

> Full protocol in `skills/core/self-audit.md`. This is your domain-specific checklist.

Load `skills/core/self-audit.md` and run the universal checks, then these:

### CI / CD Health (P1 if failing)
- [ ] CI pipeline passing on all open PRs?
- [ ] No build step taking >10 minutes without caching?
- [ ] Deploy preview working for PRs?
- [ ] Production deploy process documented and tested?
- [ ] Rollback procedure documented and last tested within 30 days?

### Security & Secrets
- [ ] No secrets in CI logs or environment variable names that get echoed?
- [ ] All secrets rotated if they were ever accidentally exposed in a commit?
- [ ] All staging/production env vars set correctly in the deployment platform?
- [ ] `.env` and `.env.local` in `.gitignore`?

### Monitoring
- [ ] Production error alerts configured and going to the right channel?
- [ ] Uptime monitoring active for the main domain?
- [ ] Database connection count monitored?
- [ ] Any alert that fired in the last 14 days without a resolution documented?

### Hygiene
- [ ] Old preview/staging environments cleaned up?
- [ ] Any deprecated CI steps or workflows that can be removed?
- [ ] Dependencies in CI image up to date?

**When you find issues:**
- P1/P2 → fix immediately, commit with `fix(ops): ...`
- P3 → add slice to `planning/EXECUTION-PLAN.md`, write audit report to `planning/ACTIVE.md`
