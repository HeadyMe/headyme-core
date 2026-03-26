/*
 * © 2026 Heady Systems LLC.
 * HeadyMe — Standalone Server
 * Projected from the Heady Latent OS
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const BASE_URL = process.env.BASE_URL || 'https://headyme.com';

const siteConfig = require('./site-config.json');

// ── Security headers ────────────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// ── CORS (env-driven, no wildcards in production) ───────────────────
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : [BASE_URL];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ── Request logging (structured JSON in production) ─────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const log = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration_ms: Date.now() - start,
            ts: new Date().toISOString(),
        };
        if (process.env.NODE_ENV === 'production') {
            process.stdout.write(JSON.stringify(log) + '\n');
        }
    });
    next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// ── Health endpoint ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        service: 'HeadyMe',
        domain: 'headyme.com',
        projected: true,
        version: require('./package.json').version,
        uptime_s: Math.floor(process.uptime()),
        ts: new Date().toISOString(),
    });
});

// ── Status endpoint (extended diagnostics) ──────────────────────────
app.get('/status', (req, res) => {
    res.json({
        service: 'HeadyMe',
        status: 'operational',
        version: require('./package.json').version,
        uptime_s: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        node: process.version,
        env: process.env.NODE_ENV || 'development',
        ts: new Date().toISOString(),
    });
});

// ── Landing page ────────────────────────────────────────────────────
app.get('/', (req, res) => {
    const features = siteConfig.features
        .map(f => `<div class="feature"><span class="icon">${f.icon}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`)
        .join('');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${siteConfig.name} — ${siteConfig.tagline}</title>
    <meta name="description" content="${siteConfig.description}">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #e2e2f0; line-height: 1.6; }
        .container { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }
        header { text-align: center; padding: 3rem 0; }
        h1 { font-size: 2.5rem; color: ${siteConfig.accent}; }
        .tagline { font-size: 1.2rem; opacity: 0.8; margin-top: 0.5rem; }
        .description { font-size: 1rem; opacity: 0.6; margin-top: 1rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 3rem 0; }
        .feature { background: rgba(129, 140, 248, 0.08); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 12px; padding: 1.5rem; }
        .feature .icon { font-size: 1.5rem; }
        .feature h3 { margin: 0.5rem 0 0.25rem; color: ${siteConfig.accent}; }
        .feature p { font-size: 0.9rem; opacity: 0.7; }
        nav { text-align: center; margin: 2rem 0; }
        nav a { color: ${siteConfig.accent}; text-decoration: none; margin: 0 1rem; font-weight: 500; }
        nav a:hover { text-decoration: underline; }
        footer { text-align: center; opacity: 0.4; padding: 2rem 0; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${siteConfig.name}</h1>
            <p class="tagline">${siteConfig.tagline}</p>
            <p class="description">${siteConfig.description}</p>
        </header>
        <nav>
            <a href="/health">Health</a>
            <a href="/status">Status</a>
            <a href="/docs">Docs</a>
            <a href="https://github.com/HeadyMe/headyme-core">GitHub</a>
        </nav>
        <div class="features">${features}</div>
        <footer>&copy; 2026 Heady Systems LLC. Powered by the Heady Latent OS.</footer>
    </div>
</body>
</html>`);
});

// ── Docs endpoint — service map and architecture links ──────────────
app.get('/docs', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${siteConfig.name} — Documentation</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #e2e2f0; line-height: 1.6; }
        .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
        h1 { color: ${siteConfig.accent}; margin-bottom: 1rem; }
        h2 { color: ${siteConfig.accent}; margin: 2rem 0 0.5rem; font-size: 1.2rem; }
        a { color: ${siteConfig.accent}; }
        ul { padding-left: 1.5rem; }
        li { margin: 0.3rem 0; }
        .back { display: inline-block; margin-bottom: 1.5rem; }
        footer { text-align: center; opacity: 0.4; padding: 2rem 0; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back">&larr; Home</a>
        <h1>Documentation</h1>
        <h2>Getting Started</h2>
        <ul>
            <li><a href="https://github.com/HeadyMe/headyme-core#quick-start">Quick Start Guide</a></li>
            <li><a href="/health">Health Check</a> — verify the service is running</li>
            <li><a href="/status">Status</a> — runtime diagnostics</li>
        </ul>
        <h2>Architecture</h2>
        <ul>
            <li><a href="https://github.com/HeadyMe/headyme-core">headyme-core</a> — Personal cloud hub (this service)</li>
            <li><a href="https://github.com/HeadyMe/headysystems-core">headysystems-core</a> — Core systems platform</li>
            <li><a href="https://github.com/HeadyMe/headyos-core">headyos-core</a> — Heady Latent OS</li>
            <li><a href="https://github.com/HeadyMe/headyapi-core">headyapi-core</a> — API layer</li>
            <li><a href="https://github.com/HeadyMe/headymcp-core">headymcp-core</a> — MCP orchestration</li>
            <li><a href="https://github.com/HeadyMe/headyconnection-core">headyconnection-core</a> — Connection services</li>
            <li><a href="https://github.com/HeadyMe/headybuddy-core">headybuddy-core</a> — Buddy / device bridge</li>
            <li><a href="https://github.com/HeadyMe/headyio-core">headyio-core</a> — I/O services</li>
            <li><a href="https://github.com/HeadyMe/headybot-core">headybot-core</a> — Bot framework</li>
            <li><a href="https://github.com/HeadyMe/heady-docs">heady-docs</a> — Full documentation hub</li>
        </ul>
        <h2>Deployment</h2>
        <ul>
            <li>Runtime: Google Cloud Run</li>
            <li>Container: <code>node:20-slim</code> base</li>
            <li>Port: <code>8080</code> (Cloud Run default)</li>
            <li>Health: <code>GET /health</code></li>
            <li>CI/CD: GitHub Actions &rarr; Cloud Run</li>
        </ul>
        <footer>&copy; 2026 Heady Systems LLC.</footer>
    </div>
</body>
</html>`);
});

// ── 404 handler ─────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        service: 'HeadyMe',
        docs: `${BASE_URL}/docs`,
    });
});

// ── Error handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    const log = {
        level: 'error',
        message: err.message,
        path: req.path,
        ts: new Date().toISOString(),
    };
    process.stderr.write(JSON.stringify(log) + '\n');
    res.status(500).json({ error: 'Internal Server Error', service: 'HeadyMe' });
});

// ── Graceful shutdown ───────────────────────────────────────────────
const server = app.listen(PORT, HOST, () => {
    const msg = {
        level: 'info',
        message: `HeadyMe running on ${HOST}:${PORT}`,
        env: process.env.NODE_ENV || 'development',
        ts: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'production') {
        process.stdout.write(JSON.stringify(msg) + '\n');
    } else {
        process.stdout.write(`HeadyMe running on ${HOST}:${PORT}\n`);
    }
});

function shutdown(signal) {
    const log = { level: 'info', message: `Received ${signal}, shutting down gracefully`, ts: new Date().toISOString() };
    process.stdout.write(JSON.stringify(log) + '\n');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
