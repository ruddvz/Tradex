---
name: data
description: >
  Data engineering, analytics, and ML context for this project. Load for any
  task involving data pipelines, ETL processes, data models, SQL analytics
  queries, dashboards, reporting, machine learning workflows, or data
  infrastructure. Also load when the user mentions "pipeline", "dataset",
  "model training", "feature engineering", "reporting", "metrics", "dashboard",
  or "data warehouse" — even if the primary task is something else.
---

# Data Skill

Everything needed to build consistent, reliable data pipelines and analytics in this project.

---

## Stack

- **Data warehouse:** [e.g. BigQuery / Snowflake / Redshift / DuckDB]
- **Pipeline / orchestration:** [e.g. dbt / Airflow / Prefect / Dagster / none]
- **Transformation layer:** [e.g. dbt / raw SQL / pandas / Spark]
- **BI / dashboards:** [e.g. Metabase / Looker / Mode / Superset / none]
- **ML platform:** [e.g. MLflow / SageMaker / Vertex AI / none]
- **Language:** [e.g. Python 3.11 / SQL / both]
- **Notebook environment:** [e.g. Jupyter / Databricks / none]

---

## Data Model Conventions

### Naming
- All table and column names: `snake_case`
- Staging tables: `stg_[source]__[entity]` — e.g. `stg_postgres__orders`
- Marts / reporting tables: `[domain]_[entity]` — e.g. `finance_revenue`
- Metrics / aggregates: `[entity]_[metric]_[grain]` — e.g. `user_signups_daily`
- Boolean columns: prefix with `is_` or `has_` — `is_active`, `has_paid`
- Timestamps: `_at` suffix — `created_at`, `processed_at`
- Date-only columns: `_date` suffix — `cohort_date`, `invoice_date`

### Standard columns every table should have
```sql
id            -- surrogate or natural key
created_at    -- when the record was created in the source system
updated_at    -- when the record was last modified in the source system
_loaded_at    -- when this row was loaded into the warehouse (pipeline metadata)
```

---

## SQL Patterns

```sql
-- GOOD — explicit, readable, aliased
SELECT
    o.id          AS order_id,
    o.created_at  AS order_date,
    u.email       AS customer_email,
    SUM(oi.unit_price * oi.quantity) AS order_total
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY 1, 2, 3

-- BAD — SELECT *, no aliases, implicit joins
SELECT * FROM orders, users WHERE orders.user_id = users.id
```

### Query rules
- Never `SELECT *` in production queries or pipeline models
- Always alias columns with meaningful names — no ambiguous `id` or `count`
- Use CTEs for readability over nested subqueries
- Add comments explaining the business logic, not just the SQL
- Paginate or `LIMIT` exploratory queries — never run unbounded scans in production

---

## Pipeline Rules

1. **Idempotent by default.** Every pipeline run should produce the same result
   if run multiple times on the same input. No side effects on re-run.
2. **Fail loudly.** Pipelines must fail with a clear error — never silently produce
   empty or partial output and mark the run as success.
3. **Log row counts.** At each stage, log input count vs output count.
   Unexpected drops are bugs.
4. **Test before promoting.** Run pipelines against a sample in staging before
   pointing them at production data.
5. **Document sources.** Every pipeline model or script must document where the
   data comes from and what transformations were applied.

```python
# GOOD — logs counts, handles errors, idempotent
def transform_orders(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw orders from Postgres into the analytics-ready orders model.
    Source: postgres.public.orders
    Transformations: filter cancelled orders, parse address, compute totals
    """
    input_count = len(df)

    df = df[df['status'] != 'cancelled'].copy()
    df['order_total'] = df['unit_price'] * df['quantity']
    df['order_date'] = pd.to_datetime(df['created_at']).dt.date

    output_count = len(df)
    print(f"[transform_orders] {input_count} rows in → {output_count} rows out")
    return df

# BAD — no logging, no error handling, unclear source
def transform(df):
    return df[df['status'] != 'cancelled']
```

---

## ML Workflow (if applicable)

### Experiment tracking
- All experiments logged to [your ML platform — e.g. MLflow / W&B]
- Required log fields per run: model type, hyperparameters, train/val metrics, dataset version
- Never overwrite a model artifact — version everything

### Model promotion process
```
1. Train and log the experiment
2. Evaluate on held-out test set (never the validation set used for tuning)
3. Compare against the current production baseline
4. If metrics improve: open a review PR with the experiment log linked
5. After approval: promote model artifact to production registry
6. Monitor production metrics for [X] days after deployment
```

### What never goes in a model
- PII or sensitive user data without explicit approval and privacy review
- Features computed from future data (data leakage)
- Hardcoded thresholds — these belong in config, not code

---

## Data Quality Rules

- Every new dataset added to the warehouse must have a row count check
- Null rates above [X%] on non-nullable columns trigger a pipeline alert
- Referential integrity: foreign keys to core tables must be validated at load time
- Schema changes in source systems must be detected and surfaced — not silently ignored

---

## Access and Privacy

- PII columns must be documented and flagged in the data catalog
- Raw PII is never exposed in BI tools or reporting tables — mask or hash at the transformation layer
- Access to production data follows the principle of least privilege
- [List who can access what — e.g. "Only data team members have direct warehouse access"]

---

## Common Mistakes to Avoid

- Do not run heavy analytical queries directly against the production application database
- Do not use `DISTINCT` as a fix for duplicates — find and fix the root cause
- Do not hardcode date ranges or business rules in SQL — use parameters or config
- Do not drop or truncate tables without a backup and approval
- Do not expose warehouse credentials in notebooks or scripts — use environment variables

---

## Self-Audit (run when asked to check the data domain)

> Full protocol in `skills/core/self-audit.md`. This is your domain-specific checklist.

Load `skills/core/self-audit.md` and run the universal checks, then these:

### Pipeline Health (P1 if failing)
- [ ] All scheduled pipelines ran successfully in the last 24 hours?
- [ ] Any pipeline silently producing empty or partial results?
- [ ] All transformations have row-count sanity checks (fail if output is suspiciously small)?
- [ ] Error notifications firing when pipelines fail?

### Data Quality
- [ ] Any `NULL` values in columns that should never be null?
- [ ] Any duplicate records in tables with unique constraints?
- [ ] Any stale data (last updated > expected freshness window)?
- [ ] Any metrics that have drifted unexpectedly vs. 7-day average?

### Performance
- [ ] Any query running >30 seconds that ran in <5 seconds last week?
- [ ] Any missing indexes on warehouse join keys?
- [ ] Any full-table scans on large tables that could use a partition filter?

### Privacy & Access
- [ ] No PII exposed in reporting tables or BI tools without masking?
- [ ] Access controls still correct (no former team members with warehouse access)?
- [ ] No credentials hardcoded in notebooks or scripts?

**When you find issues:**
- P1/P2 → fix immediately, commit with `fix(data): ...`
- P3 → add slice to `planning/EXECUTION-PLAN.md`, write audit report to `planning/ACTIVE.md`
