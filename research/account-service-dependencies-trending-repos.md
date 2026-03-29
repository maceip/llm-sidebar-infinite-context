# Research: Account/Service Dependencies from GitHub Trending Projects

## Context

This research identifies which external accounts, API keys, and services are most commonly required by trending GitHub projects in TypeScript, JavaScript, Swift, and Rust — specifically focused on agent and agent-adjacent developer tooling. The goal is to derive an initial list of "high-value" accounts that are hard to share, hard to get, or essential for developers building with these tools.

## Methodology

- Scraped GitHub Trending (daily) for TypeScript, JavaScript, Swift, and Rust on 2026-03-28
- Analyzed ~30 trending repositories
- Extracted all required services from `.env.example` files, READMEs, docker-compose configs, and config files

---

## Consolidated Service Frequency Map

Ranked by how many trending projects require or support each service:

### Tier 1: Ubiquitous (5+ projects)

| Service | Category | Projects Using It |
|---------|----------|-------------------|
| **OpenAI** (API key) | LLM Provider | dexter, twenty, anything-llm, cline, firecrawl, cc-switch, tabby, cube |
| **Anthropic / Claude** (API key or subscription) | LLM Provider | dexter, twenty, anything-llm, cline, oh-my-claudecode, learn-claude-code, cc-switch |
| **Google Gemini** (API key) | LLM Provider | dexter, twenty, anything-llm, cline, 9router, cc-switch |
| **GitHub** (OAuth / Copilot subscription / tokens) | Auth + AI | CopilotForXcode, 9router, komodo, tabby, figma-mcp |
| **PostgreSQL** (connection string) | Database | twenty, firecrawl, superset, OpenMetadata, cube |
| **Redis** (connection URL) | Cache/Queue | twenty, firecrawl, superset, OpenMetadata |

### Tier 2: Very Common (3-4 projects)

| Service | Category | Projects Using It |
|---------|----------|-------------------|
| **AWS** (access key + secret) | Cloud IaaS | cline (S3/Bedrock), cube (Athena/S3), komodo, anything-llm (Bedrock) |
| **Groq** (API key) | LLM Provider | twenty, anything-llm, cline |
| **Google OAuth / GCP** (client ID + secret) | Auth / Cloud | twenty, komodo, OpenMetadata, cube (BigQuery) |
| **Azure / Microsoft** (OAuth or OpenAI endpoint) | Auth / Cloud | twenty, cline, OpenMetadata |
| **Slack** (webhook URL) | Notifications | firecrawl, oh-my-claudecode, OpenMetadata |
| **Stripe** (API key / price IDs) | Payments | firecrawl, easy-vibe |
| **SMTP / Email** (server creds) | Email | twenty, OpenMetadata, tabby, superset |
| **OpenRouter** (API key) | LLM Router | dexter, anything-llm, cline |
| **Supabase** (anon token + service token) | BaaS | firecrawl, easy-vibe |
| **Mistral** (API key) | LLM Provider | twenty, anything-llm |
| **DeepSeek** (API key) | LLM Provider | dexter, anything-llm |

### Tier 3: Common (2 projects)

| Service | Category | Projects Using It |
|---------|----------|-------------------|
| **Pinecone** (API key) | Vector DB | anything-llm |
| **Weaviate** (API key + endpoint) | Vector DB | anything-llm |
| **Qdrant** (API key + endpoint) | Vector DB | anything-llm |
| **Perplexity** (API key) | Search/LLM | dexter, anything-llm |
| **Tavily** (API key) | Search API | dexter, anything-llm |
| **Figma** (OAuth) | Design | figma-mcp, easy-vibe |
| **Atlassian / Jira / Confluence** (OAuth) | Project Mgmt | atlassian-mcp |
| **Sentry** (DSN) | Error Monitoring | twenty |
| **PostHog** (API key) | Analytics | firecrawl, cline |
| **Cloudflare** (API key + zone ID) | CDN/DNS | twenty |
| **ElevenLabs** (API key) | TTS | anything-llm |
| **Hugging Face** (access token) | Models | anything-llm, mlx-swift-lm |
| **Discord** (webhook) | Notifications | oh-my-claudecode |
| **Telegram** (bot token + chat ID) | Notifications | oh-my-claudecode |
| **Moonshot AI / Kimi** (API key) | LLM Provider | dexter, 9router, learn-claude-code |
| **xAI / Grok** (API key) | LLM Provider | dexter, twenty |
| **Together AI** (API key) | LLM Provider | anything-llm |
| **Fireworks AI** (API key) | LLM Provider | anything-llm |
| **Cohere** (API key) | LLM Provider | anything-llm |
| **Snowflake** (account + key) | Data Warehouse | cube, superset |
| **Databricks** (token or OAuth) | Data Platform | cube |
| **Elasticsearch / OpenSearch** | Search Engine | OpenMetadata, cube |

### Tier 4: Niche but High-Value (1 project, notable)

| Service | Category | Project |
|---------|----------|---------|
| **Financial Datasets** (financialdatasets.ai) | Data API | dexter |
| **ScrapingBee** (API key) | Web Scraping | firecrawl |
| **LlamaParse** (API key) | Document Parsing | firecrawl |
| **Resend** (API key) | Email API | firecrawl |
| **Coinbase CDP** (API key) | Crypto | firecrawl |
| **Voyage AI** (API key) | Embeddings | anything-llm |
| **SerpAPI / Serper / SearchAPI** | Search APIs | anything-llm |
| **Bing Search** (API key) | Search API | anything-llm |
| **Exa** (API key) | Search API | dexter, anything-llm |
| **LangSmith** (API key) | Observability | dexter |
| **Mapbox** (API key) | Maps | superset |
| **X / Twitter** (bearer token) | Social API | dexter |
| **Zhipu AI / GLM** (API key) | LLM (China) | 9router, learn-claude-code |
| **MiniMax** (API key) | LLM (China) | 9router, learn-claude-code |
| **SambaNova** (API key) | LLM Provider | anything-llm |
| **NVIDIA NIM** (endpoint) | LLM Provider | anything-llm, cc-switch |
| **Chroma Cloud** (API key) | Vector DB | anything-llm, chroma |
| **Zilliz** (API token + endpoint) | Vector DB | anything-llm |
| **Astra DB / DataStax** (app token) | Vector DB | anything-llm |
| **ClickHouse** (connection URL) | Analytics DB | twenty |
| **TiKV** (PD endpoints) | Distributed KV | surrealdb |
| **MongoDB / FerretDB** (credentials) | Document DB | komodo |
| **Dify** (platform account) | RAG Workflow | easy-vibe |
| **Vercel** (deployment account) | Hosting | easy-vibe |

---

## Recommended Initial Supported Services List

Based on frequency across trending projects, developer demand, and "hard to share / high value" characteristics:

### Must-Have (Core AI + Cloud)
1. **OpenAI** — API key (used by 8+ projects)
2. **Anthropic / Claude** — API key or Max subscription (7+ projects)
3. **Google Gemini** — API key (6+ projects)
4. **GitHub** — OAuth tokens, Copilot subscription, PATs (5+ projects)
5. **AWS** — Access key + secret (Bedrock, S3, Athena) (4+ projects)
6. **Azure / Microsoft** — OAuth, OpenAI endpoint (3+ projects)
7. **GCP / Google Cloud** — Service account, BigQuery (3+ projects)

### High-Value (Common Developer Services)
8. **Groq** — API key (fast inference, 3 projects)
9. **OpenRouter** — API key (LLM routing, 3 projects)
10. **Mistral** — API key (2+ projects)
11. **DeepSeek** — API key (2+ projects)
12. **Supabase** — Anon token + service token (2+ projects)
13. **Stripe** — API key (payments, 2+ projects)
14. **Slack** — Webhook URL / bot token (3+ projects)
15. **Figma** — OAuth (2 projects, high-value design tool)
16. **Atlassian (Jira/Confluence)** — OAuth (high-value enterprise tool)

### Important Infrastructure
17. **PostgreSQL** — Connection credentials (5 projects)
18. **Redis** — Connection URL (4 projects)
19. **Pinecone** — API key (vector DB leader)
20. **Hugging Face** — Access token (model hub)

### Search & Data APIs
21. **Tavily** — API key (AI search, 2 projects)
22. **Exa** — API key (AI search, 2 projects)
23. **Perplexity** — API key (search + LLM, 2 projects)
24. **SerpAPI / Serper** — API key (web search)

### Observability & Notifications
25. **Sentry** — DSN (error monitoring)
26. **PostHog** — API key (analytics)
27. **LangSmith** — API key (LLM observability)
28. **Discord** — Webhook / bot token
29. **Telegram** — Bot token + chat ID

### Emerging / China Market
30. **Moonshot AI / Kimi** — API key (3 projects)
31. **Zhipu AI / GLM** — API key (2 projects)
32. **MiniMax** — API key (2 projects)
33. **xAI / Grok** — API key (2 projects)

---

## Source Projects Analyzed

### TypeScript (11 repos)
- virattt/dexter, twentyhq/twenty, apache/superset, Yeachan-Heo/oh-my-claudecode, shareAI-lab/learn-claude-code, benjitaylor/agentation, firecrawl/firecrawl, open-metadata/OpenMetadata, vercel-labs/json-render, cline/cline, thedotmack/claude-mem

### JavaScript (7 repos)
- Mintplex-Labs/anything-llm, figma/mcp-server-guide, decolua/9router, atlassian/atlassian-mcp-server, datawhalechina/easy-vibe, EmulatorJS/EmulatorJS, zen-browser/desktop

### Swift (6 repos)
- github/CopilotForXcode, ml-explore/mlx-swift-lm, manaflow-ai/cmux, tuist/tuist, alienator88/Sentinel, PlayCover/PlayCover

### Rust (7 repos)
- TabbyML/tabby, chroma-core/chroma, surrealdb/surrealdb, cube-js/cube, moghtech/komodo, farion1231/cc-switch, denoland/deno

---

## Key Insight

The overwhelming pattern is that **LLM API keys dominate** — OpenAI, Anthropic, Google, and increasingly Groq/DeepSeek/Mistral are required by the vast majority of agent projects. The second tier is **cloud infrastructure** (AWS/GCP/Azure) and **developer platform OAuth** (GitHub, Atlassian, Figma). The third tier is **specialized APIs** (search, vector DBs, observability). Agent developers in 2026 need a minimum of 3-5 API keys just to get started with any trending project.
