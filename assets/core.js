/* Shared by the public site and its editor. The five film lists stay independent. */
(() => {
  'use strict';
  const PUBLISHED_KEY = 'siteData';
  const DRAFT_KEY = 'aivp_admin_data_v2';
  const labels = { '9:16': '9:16', '16:9': '16:9', ugc: 'UGC' };
  const copy = value => JSON.parse(JSON.stringify(value));
  const list = value => Array.isArray(value) ? value : [];
  const valid = value => !!(value && value.hero && typeof value.hero === 'object' && Array.isArray(value.portfolio));

  function read(key) {
    try {
      const state = JSON.parse(localStorage.getItem(key));
      return valid(state) ? state : null;
    } catch { return null; }
  }

  function published() {
    const server = window.SITE_DATA;
    const local = read(PUBLISHED_KEY);
    if (local && (!valid(server) || !server.publishedAt || Number(local.publishedAt) > Number(server.publishedAt))) return local;
    return valid(server) ? server : {};
  }

  function normalizedFilms(value) {
    const films = list(value).filter(item => item && typeof item === 'object');
    const seen = new Set();
    let next = films.reduce((max, item) => Math.max(max, Number.isSafeInteger(+item.id) ? +item.id : 0), 0) + 1;
    return films.map(item => {
      let id = Number(item.id);
      if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) id = next++;
      seen.add(id);
      return { ...item, id, title: String(item.title || ''), videoUrl: String(item.videoUrl || ''),
        subtitle: String(item.subtitle || ''), description: String(item.description || ''), tools: list(item.tools).map(String) };
    });
  }

  function normalize(raw) {
    const s = copy(raw || {});
    s.hero = s.hero || {};
    s.portfolio = normalizedFilms(s.portfolio);
    for (const item of s.portfolio) {
      if (!Object.hasOwn(labels, item.category)) item.category = item.category === 'vertical' ? '9:16' : '16:9';
    }
    if (!Array.isArray(s.hero.banners)) {
      s.hero.banners = list(s.hero.featuredVideoIds).map(id => s.portfolio.find(item => item.id === Number(id))).filter(Boolean).map(copy);
    }
    delete s.hero.featuredVideoIds;
    s.hero.banners = normalizedFilms(s.hero.banners);
    s.commercial = normalizedFilms(Array.isArray(s.commercial) ? s.commercial : s.archive);
    delete s.archive;
    s.shortMovies = normalizedFilms(s.shortMovies);
    s.shortFormVideo = normalizedFilms(s.shortFormVideo);
    s.categoryLabel = { ...labels };
    s.filters = Object.entries(labels).map(([value, label]) => ({ value, label }));
    s.about = { content: '', workflow: [], ...s.about };
    s.about.workflow = list(s.about.workflow);
    s.seo = { siteTitle: '', metaDescription: '', logoText: '', email: '', formspreeEndpoint: '', ...s.seo };
    s.social = { instagram: '', linkedin: '', youtube: '', ...s.social };
    if (!s.stills || !Array.isArray(s.stills.sections)) s.stills = { title: '', sections: [] };
    return s;
  }

  function assetURL(raw) {
    const text = String(raw || '').trim();
    if (!text || /[\u0000-\u001f\\<>]/.test(text)) return '';
    try {
      const url = new URL(text, document.baseURI);
      if (['http:', 'https:'].includes(url.protocol)) return url.href;
      if (location.protocol === 'file:' && url.protocol === 'file:' && !/^[a-z][\w+.-]*:|^\/\//i.test(text)) return url.href;
    } catch { /* Invalid URL. */ }
    return '';
  }

  function media(raw) {
    const url = assetURL(raw);
    if (!url) return null;
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
    const parts = u.pathname.split('/').filter(Boolean);
    if (['youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) {
      let id = host === 'youtu.be' ? parts[0] : u.searchParams.get('v');
      if (!id && ['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1];
      return /^[\w-]{11}$/.test(id || '') ? { kind: 'youtube', id, url, short: parts[0] === 'shorts' } : null;
    }
    if (['vimeo.com', 'player.vimeo.com'].includes(host) && !/progressive_redirect|\/external\/|\.(mp4|m4v|mov|webm)(\/|$)/i.test(u.pathname)) {
      const match = u.pathname.match(/\/video\/(\d+)(?:\/([a-z\d]+))?/i) || u.pathname.match(/\/(\d+)(?:\/([a-z\d]+))?\/?$/i);
      if (!match) return null;
      return { kind: 'vimeo', id: match[1], hash: u.searchParams.get('h') || match[2] || '', url };
    }
    return { kind: 'file', url };
  }

  function embed(m, preview) {
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1', controls: preview ? '0' : '1' });
    if (m.kind === 'youtube') {
      params.set('mute', preview ? '1' : '0'); params.set('rel', '0');
      if (preview) { params.set('loop', '1'); params.set('playlist', m.id); }
      if (/^https?:$/.test(location.protocol)) params.set('origin', location.origin);
      return 'https://www.youtube-nocookie.com/embed/' + m.id + '?' + params;
    }
    if (m.hash) params.set('h', m.hash);
    params.set('dnt', '1'); params.set('title', '0'); params.set('byline', '0'); params.set('portrait', '0');
    if (preview) { params.set('muted', '1'); params.set('background', '1'); params.set('loop', '1'); }
    return 'https://player.vimeo.com/video/' + m.id + '?' + params;
  }

  const isDemo = item => /^https?:\/\/storage\.googleapis\.com\/gtv-videos-bucket\/sample\//i.test(item.videoUrl || '');
  window.Portfolio = { PUBLISHED_KEY, DRAFT_KEY, copy, list, valid, read, published, normalize, assetURL, media, embed, isDemo };
})();
