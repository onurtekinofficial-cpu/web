/**
 * middleware.js — Vercel Edge Middleware (project root, next to index.html / admin.html / data.js)
 *
 * One file, three jobs, all running on Vercel's edge:
 *
 *   1. /admin.html (also /admin, /admin/)  → HTTP Basic Auth. Nobody gets the page without ADMIN_USER / ADMIN_PASSWORD.
 *   2. POST /api/publish                   → the admin panel's "Publish" button sends the site data here.
 *                                            Same Basic Auth. The data is saved in a small Redis database (Upstash).
 *   3. GET  /data.js                       → serves the LAST PUBLISHED data to every visitor. If nothing has been published
 *                                            yet (or the database is unreachable) it falls through to the static data.js file,
 *                                            so the site can never break.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *     ADMIN_USER, ADMIN_PASSWORD                       — you choose these
 *     KV_REST_API_URL, KV_REST_API_TOKEN               — added automatically when you connect an Upstash Redis database
 *       (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — also supported)
 * After adding or changing variables, REDEPLOY (they only apply to new deployments).
 */

export const config = {
  matcher: ['/admin.html', '/admin', '/admin/', '/api/publish', '/data.js'],
};

const DATA_KEY = 'portfolio:site-data';
const BACKUP_KEY = 'portfolio:site-data:previous';      // the version before the latest Publish (safety net)
const MAX_BYTES = 900_000;                              // Upstash free plan accepts ~1 MB per request
const ALLOWED_KEYS = ['hero', 'about', 'seo', 'social', 'filters', 'categoryLabel', 'portfolio', 'stills'];
const encoder = new TextEncoder();

/* ------------------------------------------------------------------ helpers */

const noStore = { 'Cache-Control': 'no-store' };
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...noStore } });

/** "Continue to the static file" — exactly what next() from @vercel/edge returns, so no dependency / package.json is needed. */
const next = (headers = {}) => new Response(null, { headers: { 'x-middleware-next': '1', ...headers } });

/** Compare two strings without leaking where they differ (hash both to a fixed length, then XOR every byte). */
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** "Authorization: Basic base64(user:password)" — the password may itself contain ":" (split on the first one only). */
function parseBasicAuth(header) {
  if (!header || !/^Basic\s+/i.test(header)) return null;
  try {
    const binary = atob(header.replace(/^Basic\s+/i, '').trim());
    const text = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));   // UTF-8 safe
    const i = text.indexOf(':');
    return i < 0 ? null : { user: text.slice(0, i), password: text.slice(i + 1) };
  } catch {
    return null;
  }
}

function unauthorized() {
  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"', 'Content-Type': 'text/plain; charset=utf-8', ...noStore },
  });
}

/** Returns null when the request is authorized, otherwise the Response to send back. Fails CLOSED if the variables are missing. */
async function authorize(request) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return new Response('Admin area is not configured. Set ADMIN_USER and ADMIN_PASSWORD in the Vercel project settings, then redeploy.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...noStore },
    });
  }
  const creds = parseBasicAuth(request.headers.get('authorization'));
  if (!creds) return unauthorized();
  const [userOk, passOk] = await Promise.all([safeEqual(creds.user, expectedUser), safeEqual(creds.password, expectedPassword)]);
  return userOk && passOk ? null : unauthorized();
}

/* ------------------------------------------------------------------ Redis (Upstash REST — plain fetch, no package) */

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** Run one Redis command, e.g. ["GET", key]. Resolves to the command's result; throws on any problem. */
async function redis(command) {
  const conf = redisConfig();
  if (!conf) throw new Error('storage_not_configured');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(conf.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + conf.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) throw new Error(body.error || 'redis_http_' + res.status);
    return body.result;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ POST /api/publish */

async function handlePublish(request) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const denied = await authorize(request);
  if (denied) return denied;
  if (!redisConfig()) return json({ error: 'storage_not_configured' }, 503);

  const text = await request.text();
  if (encoder.encode(text).length > MAX_BYTES) return json({ error: 'too_large' }, 413);

  let data;
  try { data = JSON.parse(text); } catch { return json({ error: 'invalid_json' }, 400); }
  const valid = data && typeof data === 'object' && data.hero && Array.isArray(data.hero.banners)
    && Array.isArray(data.portfolio) && Array.isArray(data.filters) && data.about && data.categoryLabel;
  if (!valid) return json({ error: 'invalid_data' }, 400);

  const clean = {};
  for (const k of ALLOWED_KEYS) if (data[k] !== undefined) clean[k] = data[k];
  clean.publishedAt = Date.now();                       // server clock is the authority for "which version is newer"

  try {
    const previous = await redis(['GET', DATA_KEY]).catch(() => null);
    if (previous) await redis(['SET', BACKUP_KEY, previous]).catch(() => {});
    await redis(['SET', DATA_KEY, JSON.stringify(clean)]);
  } catch (e) {
    return json({ error: 'storage_error', detail: String(e && e.message || e) }, 502);
  }
  mem = { at: 0, body: null };                          // this edge node serves the new version immediately
  return json({ ok: true, publishedAt: clean.publishedAt });
}

/* ------------------------------------------------------------------ GET /data.js */

let mem = { at: 0, body: null };                        // tiny per-node cache so a traffic spike doesn't hammer the database
const MEM_TTL_MS = 3000;

function toScript(jsonText) {
  const safe = jsonText.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return [
    '// Live data — served from the Vercel database (last Publish from the admin panel).',
    'window.SITE_DATA = ' + safe + ';',
    'const HERO = window.SITE_DATA.hero;',
    'const ABOUT = window.SITE_DATA.about;',
    'const FILTERS = window.SITE_DATA.filters;',
    'const CATEGORY_LABEL = window.SITE_DATA.categoryLabel;',
    'const PORTFOLIO = window.SITE_DATA.portfolio;',
    '',
  ].join('\n');
}

async function handleData(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  if (!redisConfig()) return next();                    // nothing connected yet → static data.js
  try {
    const now = Date.now();
    if (!mem.body || now - mem.at > MEM_TTL_MS) {
      const stored = await redis(['GET', DATA_KEY]);
      mem = { at: now, body: stored ? toScript(String(stored)) : '' };
    }
    if (!mem.body) return next();                       // never published → static data.js
    return new Response(request.method === 'HEAD' ? null : mem.body, {
      headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch {
    return next();                                      // database hiccup → static data.js, the site keeps working
  }
}

/* ------------------------------------------------------------------ entry point */

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  if (pathname === '/data.js') return handleData(request);
  if (pathname === '/api/publish') return handlePublish(request);

  // /admin.html, /admin, /admin/
  const denied = await authorize(request);
  if (denied) return denied;
  return next({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' });
}
