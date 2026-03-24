# HeadyMe

> **Your Personal Cloud**

Your AI-powered personal cloud hub — the command center for your entire digital life.

[![Deploy](https://img.shields.io/badge/deploy-Cloud%20Run-blue?logo=google-cloud)](https://headyme.com)
[![Projected](https://img.shields.io/badge/projected-Heady%20Latent%20OS-purple)](https://github.com/HeadyMe/headyos-core)

## Quick Start

```bash
git clone https://github.com/HeadyMe/headyme-core.git
cd headyme-core
cp .env.example .env   # configure as needed
npm install
npm start
```

The server starts on port `8080` by default (configurable via `PORT`).

## Endpoints

| Route     | Description                          |
| --------- | ------------------------------------ |
| `GET /`   | Landing page with feature overview   |
| `GET /health` | Health check (JSON)             |
| `GET /status`  | Extended runtime diagnostics   |
| `GET /docs`    | Documentation and service map  |

Any unmatched route returns a structured `404` JSON response.

## Configuration

All configuration is via environment variables — see [`.env.example`](.env.example).

| Variable       | Default                | Description                              |
| -------------- | ---------------------- | ---------------------------------------- |
| `PORT`         | `8080`                 | HTTP listen port                         |
| `HOST`         | `0.0.0.0`             | Bind address                             |
| `BASE_URL`     | `https://headyme.com`  | Public URL (used for CORS, links)        |
| `NODE_ENV`     | `development`          | `production` enables HSTS & JSON logging |
| `CORS_ORIGINS` | (same as `BASE_URL`)   | Comma-separated allowed origins          |

## Features

- **Personal Dashboard** — Unified view across all Heady services
- **AI Memory** — 3D vector context that remembers everything
- **Cloud Storage** — Secure, intelligent file management
- **Cross-Vertical Sync** — Seamlessly share context between all Heady apps

## Architecture

This service is **autonomously projected** from the [Heady Latent OS](https://github.com/HeadyMe/headyos-core).

```
pgvector (Brain) → Projection Engine → Domain Slicer → GitHub Push → Cloud Run
```

### Heady Service Map

| Service | Repository |
| ------- | ---------- |
| HeadyMe (this) | [headyme-core](https://github.com/HeadyMe/headyme-core) |
| Core Systems | [headysystems-core](https://github.com/HeadyMe/headysystems-core) |
| Latent OS | [headyos-core](https://github.com/HeadyMe/headyos-core) |
| API Layer | [headyapi-core](https://github.com/HeadyMe/headyapi-core) |
| MCP Orchestration | [headymcp-core](https://github.com/HeadyMe/headymcp-core) |
| Connections | [headyconnection-core](https://github.com/HeadyMe/headyconnection-core) |
| Buddy Bridge | [headybuddy-core](https://github.com/HeadyMe/headybuddy-core) |
| I/O Services | [headyio-core](https://github.com/HeadyMe/headyio-core) |
| Bot Framework | [headybot-core](https://github.com/HeadyMe/headybot-core) |
| Documentation | [heady-docs](https://github.com/HeadyMe/heady-docs) |

## Deployment

- **Platform**: Google Cloud Run
- **Container**: `node:20-slim`
- **CI/CD**: GitHub Actions → Cloud Run (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
- **Health check**: `GET /health`
- **Graceful shutdown**: Handles `SIGTERM` / `SIGINT`

## Security

- Security headers (CSP-adjacent): `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- HSTS enabled in production
- CORS restricted to configured origins (no wildcards in production)
- Non-root container user (`heady`)
- `.dockerignore` excludes secrets and dev files

---

**© 2026 Heady Systems LLC.** Powered by the Heady Latent OS.
