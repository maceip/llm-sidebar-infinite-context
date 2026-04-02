# Research: High-Value Legacy Developer Accounts & Infrastructure Services

## Context

This research identifies the **foundational "legacy" accounts** — the core infrastructure services that existed before AI — that are most commonly required by trending GitHub projects and most valued by developers broadly. These are accounts that are hard to share, hard to replace, identity-verified, and accumulate value over time (reputation, billing history, service limits).

## Methodology

1. Scraped GitHub Trending (daily, 2026-03-28) for TypeScript, JavaScript, Swift, and Rust (~30 repos)
2. Analyzed `.env.example` files, docker-compose configs, `package.json`, and READMEs for infrastructure dependencies
3. Cross-referenced with 2025 StackOverflow Developer Survey, JetBrains State of Developer Ecosystem, and industry market share data

---

## Recommended Initial Supported Services

### Tier 1: Core Infrastructure (Nearly Universal)

These appear in 5-8 of the 10 analyzed trending projects and are foundational to virtually all developer work.

| #   | Service                                                   | Category               |            Trending Repo Count             | Why High-Value                                                                                                                  |
| --- | --------------------------------------------------------- | ---------------------- | :----------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **AWS**                                                   | Cloud / IaaS           | 6 (S3, SDK, SES, Bedrock, EC2, CloudWatch) | Largest cloud. Account age unlocks higher service limits. Reserved instances, billing history, IAM configs are non-transferable |
| 2   | **PostgreSQL hosting** (Supabase, Neon, RDS, self-hosted) | Database               |                     7                      | #1 admired DB (StackOverflow). Production data + backup history = irreplaceable                                                 |
| 3   | **Redis hosting** (Redis Cloud, ElastiCache, self-hosted) | Cache / Queue          |                     6                      | Universal caching layer. Session data, job queues                                                                               |
| 4   | **Docker Hub**                                            | Container Registry     |        8 (Docker/Compose universal)        | Image hosting, pull rate limits tied to account                                                                                 |
| 5   | **GitHub**                                                | Source Control / OAuth |                     5                      | Contribution history, org memberships, SSH keys, Actions minutes, PATs                                                          |

### Tier 2: Identity & Money (Hardest to Replace)

These are **identity-verified**, accumulate reputation, and are the hardest accounts to recreate from scratch.

| #   | Service                     | Category            | Market Position                        | Why High-Value                                                                                        |
| --- | --------------------------- | ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 6   | **Stripe**                  | Payments            | Gold standard; $1.4T processed in 2024 | Identity-verified, processing history builds better rates, chargeback ratio tied to account           |
| 7   | **Apple Developer Program** | App Store           | Required for all iOS distribution      | $99/yr, identity-bound, app review history, provisioning profiles, push notification certs            |
| 8   | **Google Play Console**     | App Store           | Required for all Android distribution  | $25 one-time, now requires gov't ID + device verification (post-Nov 2023), testing requirements       |
| 9   | **Twilio**                  | SMS / Phone Numbers | Dominant; 100+ countries               | Phone numbers, short codes, 10DLC campaigns take weeks to register. Throughput limits tied to account |
| 10  | **Cloudflare**              | CDN / DNS / Edge    | 40-64% developer market share          | Bundles DNS + CDN + DDoS + Workers + R2 + Zero Trust. Configured zones + DNS records = critical infra |

### Tier 3: Auth, Email & Comms (Reputation-Based)

Accounts where **reputation accumulates over time** — sender scores, trust levels, verification status.

| #   | Service                        | Category       | Trending Repo Count | Why High-Value                                                                                              |
| --- | ------------------------------ | -------------- | :-----------------: | ----------------------------------------------------------------------------------------------------------- |
| 11  | **SendGrid** (Twilio)          | Email API      |  3 (SMTP generic)   | Market leader. Sender reputation takes months to build. Free plan removed — existing accounts grandfathered |
| 12  | **Auth0** (Okta)               | Authentication |  3 (OIDC generic)   | Incumbent. Configured tenants + user credential stores are extremely painful to migrate                     |
| 13  | **Google OAuth** (GCP Console) | Social Login   |          4          | Most common social auth. Consent screen verification for production takes weeks                             |
| 14  | **Microsoft / Azure**          | Cloud + OAuth  |         2-3         | Enterprise standard. Azure AD tenant setup, verified publisher status                                       |
| 15  | **Slack**                      | Communication  |          3          | Bot tokens, workspace integrations, app directory listings                                                  |

### Tier 4: Hosting & Deployment (Where Code Runs)

| #   | Service                       | Category         | Market Position            | Why High-Value                                                         |
| --- | ----------------------------- | ---------------- | -------------------------- | ---------------------------------------------------------------------- |
| 16  | **Vercel**                    | Frontend Hosting | Dominant for Next.js/React | Team plans, domain configs, environment variables, preview deployments |
| 17  | **GCP / Google Cloud**        | Cloud / IaaS     | ~10% market share          | BigQuery, Firebase, GKE. Service account keys, project configs         |
| 18  | **DigitalOcean**              | Cloud / VPS      | Top developer-focused      | Simple pricing, droplet snapshots, managed databases                   |
| 19  | **Netlify**                   | Frontend Hosting | #2 Jamstack platform       | Build configs, deploy hooks, form handling                             |
| 20  | **Fly.io / Railway / Render** | App Hosting      | Growing fast               | Edge deployment, managed Postgres, environment configs                 |

### Tier 5: Observability & Ops (Historical Data Lock-in)

| #   | Service           | Category            |    Trending Repo Count     | Why High-Value                                                             |
| --- | ----------------- | ------------------- | :------------------------: | -------------------------------------------------------------------------- |
| 21  | **Sentry**        | Error Tracking      |             3              | Configured alert rules, issue history, release tracking                    |
| 22  | **Datadog**       | Monitoring / APM    |    1 (+ market leader)     | 600+ integrations. Historical dashboards, alert policies = months of setup |
| 23  | **PostHog**       | Product Analytics   |             2              | Event definitions, dashboards, feature flags, session recordings           |
| 24  | **PagerDuty**     | Incident Management |     Industry standard      | On-call schedules, escalation policies, integration configs                |
| 25  | **Grafana Cloud** | Observability       | 1 (+ open-source standard) | Prometheus + Loki + Tempo stack. Dashboard configs                         |

### Tier 6: Database & Storage (Data Lock-in)

| #   | Service                        | Category                          | Trending Repo Count | Why High-Value                                              |
| --- | ------------------------------ | --------------------------------- | :-----------------: | ----------------------------------------------------------- |
| 26  | **MongoDB Atlas**              | Document DB                       |          2          | Managed clusters, backup schedules, connection strings      |
| 27  | **Supabase**                   | BaaS (Postgres + Auth + Realtime) |          2          | Row-level security policies, auth configs, edge functions   |
| 28  | **S3 / R2 / GCS**              | Object Storage                    |   3 (S3) + 1 (R2)   | Bucket policies, lifecycle rules, CORS configs, stored data |
| 29  | **Elasticsearch / OpenSearch** | Search Engine                     |          2          | Index mappings, analyzer configs, stored indices            |
| 30  | **ClickHouse**                 | Analytics DB                      |          2          | Materialized views, aggregation configs                     |

### Tier 7: Communication & Virtual Numbers

| #   | Service            | Category     | Market Position           | Why High-Value                                       |
| --- | ------------------ | ------------ | ------------------------- | ---------------------------------------------------- |
| 31  | **Vonage** (Nexmo) | SMS / Voice  | #2 after Twilio           | Numbers in 200+ countries, per-second billing        |
| 32  | **Telnyx**         | SMS / Voice  | Growing; owns network     | SMS from $0.004/msg, SIP trunking                    |
| 33  | **Discord**        | Bot Platform | Universal dev community   | Bot tokens, server integrations, webhook configs     |
| 34  | **Telegram**       | Bot Platform | Growing for notifications | Bot tokens, chat IDs                                 |
| 35  | **Resend**         | Email API    | Modern newcomer           | Developer-friendly, growing fast. Found in firecrawl |

### Tier 8: Domain & SSL

| #   | Service                     | Category            | Market Position   | Why High-Value                     |
| --- | --------------------------- | ------------------- | ----------------- | ---------------------------------- |
| 36  | **Cloudflare Registrar**    | Domain Registration | At-cost pricing   | Domains + DNS + CDN in one account |
| 37  | **Namecheap**               | Domain Registration | Popular with devs | Domain portfolio, DNS configs      |
| 38  | **Let's Encrypt / ZeroSSL** | SSL/TLS             | Free standard     | ACME configs, auto-renewal scripts |

### Tier 9: Maps & Media

| #   | Service        | Category         | Trending Repo Count | Why High-Value                                            |
| --- | -------------- | ---------------- | :-----------------: | --------------------------------------------------------- |
| 39  | **Mapbox**     | Maps             |    1 (superset)     | Custom map styles, tilesets, geocoding quotas             |
| 40  | **Cloudinary** | Media Processing |    Market leader    | Transformation pipelines, stored assets, delivery configs |

---

## Frequency Heatmap: Infrastructure Services in Trending Repos

From direct `.env.example` / docker-compose analysis of 10 deeply-analyzed repos:

```
PostgreSQL          ███████  7/10
Docker/Compose      ████████ 8/10
Redis               ██████   6/10
JWT/Custom Auth     ██████   6/10
Google OAuth        ████     4/10
OpenTelemetry       ████     4/10
AWS S3              ███      3/10
AWS SDK             ███      3/10
SMTP/Email          ███      3/10
Sentry              ███      3/10
Prometheus          ███      3/10
GitHub OAuth        ███      3/10
OIDC (generic)      ███      3/10
Kubernetes          ███      3/10
SSL/TLS certs       ███      3/10
Stripe              ██       2/10
Cloudflare          ██       2/10
PostHog             ██       2/10
Slack               ██       2/10
ClickHouse          ██       2/10
Elasticsearch       ██       2/10
Microsoft OAuth     ██       2/10
MySQL               ██       2/10
MongoDB             ██       2/10
Google Cloud SDK    ██       2/10
Azure SDK           ██       2/10
```

---

## Top 10 Highest-Value Legacy Accounts (Ranked by Replacement Difficulty)

These accounts accumulate value over time and are hardest to recreate:

1. **AWS account** — Service limits increase with age, billing history, reserved instances, IAM configs
2. **Stripe account** — Identity-verified, processing volume unlocks better rates, chargeback history
3. **Apple Developer account** — Annual fee, identity-bound, provisioning profiles, app review history, push certs
4. **Cloudflare account** — DNS zones, CDN configs, Workers, R2 buckets, Zero Trust policies
5. **Twilio account** — Phone numbers, short codes, 10DLC campaigns (weeks to register), sender verification
6. **Google Play Console** — Gov't ID required, testing requirements, app signing keys
7. **GitHub account** — Contribution graph, org memberships, SSH keys, Actions history, package registry
8. **SendGrid account** — Sender reputation takes months to build, free tier removed
9. **Auth0 account** — User credential stores, tenant configs, compliance certs (migrating users = nightmare)
10. **Datadog account** — Historical dashboards, alert policies, 600+ configured integrations

---

## Summary: Recommended Initial Service List by Category

| Category                | Services                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| **Cloud / Compute**     | AWS, GCP, Azure, DigitalOcean, Vercel, Netlify                      |
| **CDN / DNS / Domains** | Cloudflare, Namecheap                                               |
| **Database**            | PostgreSQL (Supabase/Neon/RDS), Redis, MongoDB Atlas, Elasticsearch |
| **Object Storage**      | S3, Cloudflare R2, GCS                                              |
| **Payments**            | Stripe                                                              |
| **Email**               | SendGrid, Resend, Amazon SES                                        |
| **SMS / Phone**         | Twilio, Vonage, Telnyx                                              |
| **Auth / Identity**     | Auth0, Google OAuth, GitHub OAuth                                   |
| **App Stores**          | Apple Developer, Google Play Console                                |
| **Container Registry**  | Docker Hub, GitHub Container Registry                               |
| **Monitoring**          | Sentry, Datadog, Grafana Cloud, PagerDuty                           |
| **Analytics**           | PostHog                                                             |
| **Communication**       | Slack, Discord, Telegram                                            |
| **Maps**                | Mapbox                                                              |
| **Media**               | Cloudinary                                                          |
| **SSL**                 | Let's Encrypt, ZeroSSL                                              |

---

## Source Data

### Trending Repos Analyzed (2026-03-28)

**TypeScript:** virattt/dexter, twentyhq/twenty, apache/superset, Yeachan-Heo/oh-my-claudecode, shareAI-lab/learn-claude-code, benjitaylor/agentation, firecrawl/firecrawl, open-metadata/OpenMetadata, vercel-labs/json-render, cline/cline, thedotmack/claude-mem

**JavaScript:** Mintplex-Labs/anything-llm, figma/mcp-server-guide, decolua/9router, atlassian/atlassian-mcp-server, datawhalechina/easy-vibe, EmulatorJS/EmulatorJS, zen-browser/desktop

**Swift:** github/CopilotForXcode, ml-explore/mlx-swift-lm, manaflow-ai/cmux, tuist/tuist, alienator88/Sentinel, PlayCover/PlayCover

**Rust:** TabbyML/tabby, chroma-core/chroma, surrealdb/surrealdb, cube-js/cube, moghtech/komodo, farion1231/cc-switch, denoland/deno

### Market Research Sources

- 2025 StackOverflow Developer Survey
- JetBrains State of Developer Ecosystem 2025
- Industry market share reports (6sense, Northflank, BlazingCDN, SplitMetrics)
