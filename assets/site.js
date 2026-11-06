(() => {
  'use strict';
  const P = window.Portfolio;
  const site = P.normalize(P.published());
  const main = document.getElementById('main');
  const dialog = document.getElementById('player');
  const screen = document.getElementById('film-screen');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 650px)');
  const saveData = !!navigator.connection?.saveData;
  const brand = site.seo.logoText || 'Osman Tekin';
  const collections = [
    { route: 'commercial', key: 'commercial', name: 'Commercials', label: 'Commercial' },
    { route: 'short-movies', key: 'shortMovies', name: 'Short films', label: 'Short film' },
    { route: 'short-form-video', key: 'shortFormVideo', name: 'Short-form', label: 'Short-form film' },
    { route: 'portfolio', key: 'portfolio', name: 'Portfolio', label: 'Portfolio' }
  ];
  const publicFilms = items => items.filter(item => site.seo.showSampleFootage !== false || !P.isDemo(item));
  const records = Object.fromEntries(collections.map(c => [c.route, publicFilms(site[c.key]).map(item => ({ item, group: c.label }))]));
  const stills = P.list(site.stills.sections).map(group => ({
    title: group.title || '',
    images: P.list(group.images).map(raw => {
      const match = String(raw).trim().match(/^(?:(big|huge)\s+)?(.+)$/i);
      return match && { size: (match[1] || '').toLowerCase(), url: P.assetURL(match[2]) };
    }).filter(image => image && image.url)
  })).filter(group => group.images.length);
  const artwork = ['assets/cover-orbit.svg', 'assets/cover-wave.svg', 'assets/cover-fold.svg'];
  let hero = null;
  let restoreFocus = null;
  let coverObserver = null;
  let activeRoute = '';
  let format = 'all';

  function el(tag, cls, content) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function link(href, label, cls) {
    const a = el('a', cls, label); a.href = href; return a;
  }
  function button(label, cls, run) {
    const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', run); return b;
  }
  function heading(tag, plain, italic) {
    const h = el(tag, 'display', plain + ' '); h.append(el('em', '', italic)); return h;
  }
  function section() {
    const s = el('section', 'wrap section page'); main.append(s); return s;
  }
  function unique(entries) {
    const seen = new Set();
    return entries.filter(({ item }) => {
      const key = item.title + '\n' + item.videoUrl;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  function visible(entries) { return entries.filter(({ item }) => !item.hideFromAll); }
  function art(item) {
    const title = item.title.toLowerCase();
    if (title.includes('solstice')) return artwork[0];
    if (title.includes('glass')) return artwork[2];
    let hash = 0;
    for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return artwork[hash % artwork.length];
  }
  function ratio(item) {
    const fmt = item.aspect || item.category;
    return { '16:9': 16/9, '9:16': 9/16, '4:5': 4/5, '1:1': 1, vertical: 9/16 }[fmt] || 0;
  }
  const youtubeCover = m => 'https://i.ytimg.com/vi/' + m.id + '/hqdefault.jpg';
  function coverFor(item) {
    const m = P.media(item.videoUrl);
    return P.assetURL(item.thumbnailUrl) || (m?.kind === 'youtube' ? youtubeCover(m) : art(item));
  }
  function setImage(image, url, fallback) {
    image.onerror = () => { image.onerror = null; if (fallback) image.src = fallback; };
    image.src = url;
  }
  function stopMedium(mount) {
    mount.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    mount.querySelectorAll('iframe').forEach(f => f.remove());
    mount.replaceChildren();
  }
  function iframeFor(info, preview, title) {
    const frame = el('iframe');
    frame.title = title || 'Film player'; frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    if (preview) { frame.tabIndex = -1; frame.setAttribute('aria-hidden', 'true'); }
    frame.src = P.embed(info, preview); return frame;
  }
  function playError(parent, url) {
    const msg = el('p', 'play-error', 'Playback is unavailable here.');
    if (url) { msg.append(document.createElement('br')); const a = link(url, 'Open original video ↗'); a.target = '_blank'; a.rel = 'noopener noreferrer'; msg.append(a); }
    parent.replaceChildren(msg);
  }
  function playFilm(item, group, trigger, startAt = 0) {
    const m = P.media(item.videoUrl);
    restoreFocus = trigger || document.activeElement;
    document.getElementById('film-title').textContent = item.title || 'Film';
    document.getElementById('film-type').textContent = [group, item.aspect || item.category, P.isDemo(item) ? 'Sample footage' : ''].filter(Boolean).join(' / ');
    document.getElementById('film-desc').textContent = item.description || item.subtitle || '';
    const tools = document.getElementById('film-tools');
    tools.textContent = P.list(item.tools).join(' · '); tools.hidden = !tools.textContent;
    const src = document.getElementById('film-source'); src.hidden = !m; if (m) src.href = m.url;
    stopMedium(screen);
    dialog.showModal();
    hero?.sync();
    if (!m) { playError(screen); return; }
    if (m.kind !== 'file') { screen.append(iframeFor(m, false, item.title)); return; }
    const v = el('video'); v.controls = true; v.playsInline = true; v.preload = 'auto';
    if (item.thumbnailUrl) v.poster = P.assetURL(item.thumbnailUrl);
    if (startAt > 0) v.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(v.duration)) v.currentTime = Math.min(startAt, Math.max(0, v.duration - .1));
    }, { once: true });
    v.src = m.url; screen.append(v);
    v.addEventListener('error', () => { if (screen.contains(v)) playError(screen, m.url); }, { once: true });
    v.play().catch(() => { /* Native controls remain available for manual playback. */ });
  }
  document.getElementById('player-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    stopMedium(screen); hero?.sync();
    if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true }); restoreFocus = null;
  });

  function mountHero(host) {
    const banners = publicFilms(site.hero.banners);
    if (!banners.length) {
      const s = el('div', 'wrap section'); s.append(el('h1', 'display', site.hero.headline || brand));
      if (site.hero.subheadline) s.append(el('p', 'page-intro', site.hero.subheadline));
      host.append(s); return null;
    }
    host.innerHTML = '<section class="feature" aria-label="Featured films"><div class="hero">' +
      '<div class="hero-back" aria-hidden="true"><img class="hero-picture" alt="" fetchpriority="high"><div class="hero-motion"></div></div><div class="hero-shade"></div>' +
      '<div class="hero-body"><p class="micro hero-kicker"><span class="frame-icon" aria-hidden="true"></span><span>Featured film</span></p>' +
      '<div class="hero-text"><h1 class="hero-title"></h1><p class="hero-sub"></p><button type="button" class="play-primary"><span class="triangle" aria-hidden="true"></span>Play full film</button></div></div></div>' +
      '<div class="feature-rail"><span class="micro">On the reel</span><div class="pager"><button type="button" aria-label="Previous featured film">←</button><output aria-live="polite"></output><button type="button" aria-label="Next featured film">→</button></div>' +
      '<button type="button" class="preview-toggle rail-end"></button></div></section>';
    const q = selector => host.querySelector(selector);
    const stage = q('.hero'), image = q('.hero-picture'), motion = q('.hero-motion'), h = q('h1'), sub = q('.hero-sub');
    const toggle = q('.preview-toggle'), open = q('.play-primary'), out = q('output');
    const arrows = host.querySelectorAll('.pager button');
    if (banners.length === 1) {
      for (const b of arrows) b.hidden = true;
      q('.feature-rail > .micro').textContent = 'Film format';
      out.className = 'single-format';
    }
    let index = 0, visibleNow = true, wants = !reduced.matches && !saveData, failed = false;
    let source = null, file = null, embedded = null, generation = 0, pending = false, disposed = false;
    const pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2.2"/></svg>';
    const playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 2 9 6-9 6z" fill="currentColor"/></svg>';
    function paintToggle() {
      toggle.disabled = failed || !source;
      toggle.innerHTML = wants && !failed ? pauseIcon : playIcon;
      toggle.append(document.createTextNode(failed || !source ? 'Preview unavailable' : wants ? 'Pause preview' : 'Play preview'));
    }
    function sync() {
      if (disposed || !source || failed) return;
      const active = wants && visibleNow && !document.hidden && !dialog.open;
      if (!active) {
        if (file && !file.paused) file.pause();
        if (embedded) { embedded.remove(); embedded = null; } return;
      }
      if (source.kind !== 'file') {
        if (!embedded) { embedded = iframeFor(source, true, 'Muted preview'); motion.append(embedded); }
      } else if (file && file.paused && !pending) {
        const current = generation; pending = true;
        if (!file.hasAttribute('src')) file.src = source.url;
        file.play().then(() => {
          if (current !== generation) return;
          pending = false;
          if (!wants || !visibleNow || document.hidden || dialog.open) file.pause();
        }).catch(error => {
          if (current !== generation) return;
          pending = false;
          if (error.name === 'NotAllowedError') { wants = false; paintToggle(); }
        });
      }
    }
    function show(i) {
      const item = banners[i]; index = i; generation++; pending = false; failed = false;
      stopMedium(motion); file = null; embedded = null;
      const useTeaser = !!item.previewUrl && !(compact.matches && ratio(item) < 1 && ratio(item) > 0);
      source = P.media(useTeaser ? item.previewUrl : item.videoUrl);
      const ar = useTeaser ? 16/9 : (ratio(item) || (source?.short ? 9/16 : 16/9));
      stage.dataset.tall = String(ar <= 1); motion.style.setProperty('--ar', ar);
      setImage(image, coverFor(item), art(item));
      q('.hero-kicker span:last-child').textContent = P.isDemo(item) ? 'Featured film / Sample footage' : 'AI video & filmmaking / Featured film';
      h.textContent = item.title || 'Untitled film'; h.classList.toggle('long', h.textContent.length > 23);
      sub.textContent = item.subtitle || ''; sub.hidden = !sub.textContent;
      out.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(banners.length).padStart(2, '0');
      if (banners.length === 1) out.textContent = item.aspect || (source?.short ? '9:16' : 'Original');
      open.disabled = !P.media(item.videoUrl);
      if (source?.kind === 'file') {
        const v = el('video'); file = v; v.playsInline = true; v.defaultMuted = true; v.muted = true; v.loop = true; v.preload = 'none'; v.hidden = true;
        v.addEventListener('playing', () => { if (v === file) v.hidden = false; });
        v.addEventListener('loadedmetadata', () => {
          if (v === file && !useTeaser && !ratio(item) && v.videoHeight) stage.dataset.tall = String(v.videoWidth / v.videoHeight <= 1);
        });
        v.addEventListener('error', () => { if (v !== file || !v.hasAttribute('src')) return; v.hidden = true; failed = true; paintToggle(); });
        motion.append(v);
      }
      paintToggle(); sync();
    }
    open.addEventListener('click', () => playFilm(banners[index], 'Featured film', open));
    arrows[0].addEventListener('click', () => show((index + banners.length - 1) % banners.length));
    arrows[1].addEventListener('click', () => show((index + 1) % banners.length));
    toggle.addEventListener('click', () => { wants = !wants; paintToggle(); sync(); });
    const observer = new IntersectionObserver(entries => { visibleNow = entries[0].isIntersecting; sync(); }, { threshold: .05 });
    observer.observe(stage);
    const size = new ResizeObserver(() => {
      stage.style.setProperty('--hero-width', stage.clientWidth + 'px'); stage.style.setProperty('--hero-height', stage.clientHeight + 'px');
    });
    size.observe(stage);
    const resize = () => show(index);
    const preference = () => { wants = !reduced.matches && !saveData; paintToggle(); sync(); };
    compact.addEventListener('change', resize); reduced.addEventListener('change', preference);
    document.addEventListener('visibilitychange', sync);
    show(0);
    return { sync, dispose() {
      disposed = true; generation++; observer.disconnect(); size.disconnect(); stopMedium(motion);
      compact.removeEventListener('change', resize); reduced.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', sync);
    } };
  }

  function addCard(entry, grid) {
    const { item, group } = entry;
    const card = el('article', 'film-card'), b = button('', 'card-button', () => playFilm(item, group, b));
    b.setAttribute('aria-label', 'Watch ' + item.title);
    const frame = el('span', 'card-frame'), artImg = el('img');
    artImg.alt = ''; artImg.loading = 'lazy'; setImage(artImg, coverFor(item), art(item)); frame.append(artImg);
    const badge = el('span', 'card-play'); badge.setAttribute('aria-hidden', 'true'); badge.append(el('span', 'triangle'));
    const name = el('span', 'card-meta'); name.append(el('span', 'card-name', item.title || 'Untitled film'));
    let aspect = item.aspect || item.category || '';
    if (aspect === 'ugc') aspect = 'UGC';
    if (aspect) name.append(el('span', 'card-format', aspect));
    const year = /^\d{4}/.exec(item.createdAt || '')?.[0];
    const desc = [group, P.isDemo(item) ? 'Sample footage' : '', year].filter(Boolean).join(' / ');
    frame.append(badge); b.append(frame, name, el('span', 'card-caption', desc)); card.append(b); grid.append(card);

    const m = P.media(item.videoUrl);
    if (!m) return;
    const poster = P.assetURL(item.thumbnailUrl);
    if (!poster && !P.isDemo(item) && m.kind !== 'youtube') {
      frame.prepareCover = () => {
        if (m.kind === 'vimeo') {
          fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(m.url)).then(r => r.ok ? r.json() : null)
            .then(data => { const u = data && P.assetURL(data.thumbnail_url); if (u && frame.isConnected) setImage(artImg, u, art(item)); }).catch(() => {});
        } else if (!saveData) {
          const still = el('video'); still.muted = true; still.playsInline = true; still.preload = 'metadata';
          still.setAttribute('aria-hidden', 'true'); still.hidden = true;
          still.addEventListener('loadeddata', () => { still.hidden = false; }, { once: true });
          const u = new URL(m.url); if (!u.hash) u.hash = 't=0.08'; still.src = u.href;
          frame.insertBefore(still, badge);
        }
      };
      coverObserver.observe(frame);
    }
    const preview = P.media(item.previewUrl || item.videoUrl);
    if (!preview || preview.kind !== 'file' || saveData || reduced.matches) return;
    let hoverVideo = null;
    function end() {
      if (!hoverVideo) return;
      hoverVideo.pause(); hoverVideo.removeAttribute('src'); hoverVideo.load(); hoverVideo.remove(); hoverVideo = null;
    }
    b.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || hoverVideo || dialog.open) return;
      const v = el('video'); hoverVideo = v; v.muted = true; v.playsInline = true; v.loop = true; v.hidden = true;
      v.addEventListener('playing', () => { v.hidden = false; }, { once: true }); v.addEventListener('error', end, { once: true });
      v.src = preview.url; frame.insertBefore(v, badge); v.play().catch(() => {});
    });
    b.addEventListener('pointerleave', end); b.addEventListener('click', end);
  }

  function gridOf(entries, parent, cls = '') {
    const grid = el('div', 'film-grid ' + cls); parent.append(grid);
    if (!entries.length) { parent.append(el('p', 'empty', 'There are no films in this selection yet.')); return; }
    for (const entry of entries) addCard(entry, grid);
  }
  function sceneGrid(entry, parent) {
    const grid = el('div', 'film-grid home-grid'); parent.append(grid);
    for (const shot of entry.item.chapters) {
      const time = Number(shot.time) || 0;
      const stamp = Math.floor(time / 60) + ':' + String(Math.floor(time % 60)).padStart(2, '0');
      const card = el('article', 'film-card');
      const b = button('', 'card-button', () => playFilm(entry.item, entry.group, b, time));
      b.setAttribute('aria-label', 'Watch ' + shot.title + ' from ' + stamp);
      const frame = el('span', 'card-frame'), img = el('img'); img.loading = 'lazy'; img.alt = '';
      setImage(img, P.assetURL(shot.thumbnailUrl) || coverFor(entry.item), art(entry.item));
      const badge = el('span', 'card-play'); badge.setAttribute('aria-hidden', 'true'); badge.append(el('span', 'triangle'));
      frame.append(img, badge);
      const meta = el('span', 'card-meta');
      meta.append(el('span', 'card-name', shot.title), el('span', 'card-format', stamp));
      b.append(frame, meta, el('span', 'card-caption', entry.item.title + ' / ' + entry.group));
      card.append(b); grid.append(card);
    }
  }
  function invite() {
    const wrap = el('div', 'wrap'), band = el('div', 'cta-band');
    band.append(el('p', '', 'Got a brief?'), link('#contact', 'Let’s talk ↗')); wrap.append(band); main.append(wrap);
  }
  function home() {
    const host = el('div'); main.append(host); hero = mountHero(host);
    const ordered = ['commercial', 'short-movies', 'portfolio', 'short-form-video'].map(key => visible(records[key]));
    const firstFromEach = ordered.map(items => items[0]).filter(Boolean);
    const candidates = unique([...firstFromEach, ...ordered.flat()]);
    const entries = [...candidates.filter(e => !P.isDemo(e.item)), ...candidates.filter(e => P.isDemo(e.item))].slice(0, 3);
    if (entries.length) {
      const s = el('section', 'section wrap'), head = el('div', 'section-head');
      const singleFilm = entries.length === 1 && P.media(entries[0].item.videoUrl)?.kind === 'file' && P.list(entries[0].item.chapters).length > 1;
      head.append(singleFilm ? heading('h2', 'Inside the', 'cut.') : heading('h2', 'Selected', 'work.'), link('#work', 'All work ↗', 'text-link'));
      s.append(head);
      if (singleFilm) sceneGrid(entries[0], s); else gridOf(entries, s, 'home-grid');
      main.append(s);
    }
    invite();
  }
  function archiveNav(page) {
    const nav = el('nav', 'archive-nav'); nav.setAttribute('aria-label', 'Film collections');
    const items = [{ route: 'work', name: 'All films' }, ...collections.filter(c => records[c.route].length || c.route === page)];
    if (stills.length || page === 'imagery') items.push({ route: 'imagery', name: site.stills.title || 'Stills' });
    items.forEach(c => { const a = link('#' + c.route, c.name); if (page === c.route) a.setAttribute('aria-current', 'page'); nav.append(a); });
    return nav;
  }
  function work(page) {
    const s = section();
    s.append(heading('h1', 'Work', 'archive.'), archiveNav(page));
    const root = el('div'); let items;
    if (page === 'work') items = visible(unique(collections.flatMap(c => records[c.route])));
    else items = records[page] || [];
    if (page === 'portfolio' && items.length) {
      const bar = el('div', 'filter-nav'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Film format'); s.append(bar);
      const filters = [{ value: 'all', label: 'All formats' }, ...site.filters];
      filters.forEach(f => {
        const b = button(f.label, '', () => {
          format = f.value;
          bar.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === b)));
          paint();
        });
        b.setAttribute('aria-pressed', String(format === f.value)); bar.append(b);
      });
    }
    s.append(root);
    function paint() {
      root.querySelectorAll('.card-frame').forEach(f => coverObserver.unobserve(f));
      root.replaceChildren();
      const filtered = page === 'portfolio' && format !== 'all' ? items.filter(e => e.item.category === format) : visible(items);
      gridOf(filtered, root);
    }
    paint(); invite();
  }
  function imagery() {
    const s = section(); s.append(el('h1', 'display', site.stills.title || 'Stills'), archiveNav('imagery'));
    if (!stills.length) s.append(el('p', 'empty', 'There are no stills in this collection yet.'));
    for (const group of stills) {
      if (group.title) s.append(el('h2', 'stills-title', group.title));
      const grid = el('div', 'stills-grid'); s.append(grid);
      group.images.forEach((info, i) => {
        const img = el('img', info.size); img.alt = (group.title || 'Film still') + ' — ' + (i + 1);
        img.loading = 'lazy'; img.src = info.url; grid.append(img);
      });
    }
  }
  function about() {
    const s = section(), split = el('div', 'split'), intro = el('div'), bio = el('div', 'bio-copy');
    intro.append(heading('h1', 'Behind the', 'cut.'), el('p', 'page-intro', 'Osman Onur Tekin / Istanbul'));
    String(site.about.content || '').split(/\n\s*\n/).filter(Boolean).forEach(p => bio.append(el('p', '', p)));
    split.append(intro, bio); s.append(split);
    if (site.about.workflow.length) {
      s.append(heading('h2', 'The', 'process.')); const ol = el('ol', 'process'); s.append(ol);
      site.about.workflow.forEach(step => { const row = el('li'); row.append(el('h3', '', step.title || ''), el('p', '', step.text || '')); ol.append(row); });
    }
    invite();
  }
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function contactRoute() {
    let ep = (site.seo.formspreeEndpoint || '').trim(), email = (site.seo.email || '').trim();
    if (/^[a-z\d]{6,}$/i.test(ep)) ep = 'https://formspree.io/f/' + ep;
    if (/^https:\/\/formspree\.io\/f\/[a-z\d]+$/i.test(ep)) return { url: ep };
    if (emailPattern.test(email)) return { url: 'https://formsubmit.co/ajax/' + encodeURIComponent(email), formsubmit: true };
    return null;
  }
  function contact() {
    const s = section(), split = el('div', 'split'), left = el('div'), right = el('div');
    left.append(heading('h1', 'Got a', 'brief?'), el('p', 'page-intro', 'A storyboard, a deadline or a half-formed idea. All three are welcome.'));
    const email = (site.seo.email || '').trim(); if (emailPattern.test(email)) left.append(link('mailto:' + email, email + ' ↗', 'email-link'));
    split.append(left, right); s.append(split);
    const route = contactRoute();
    if (!route) { right.append(el('p', 'notice', 'The enquiry form is currently offline.')); return; }
    const form = el('form', 'contact-form');
    form.innerHTML = '<label>Your name<input name="name" autocomplete="name" maxlength="100" required></label>' +
      '<label>Email address<input name="email" type="email" autocomplete="email" maxlength="180" required></label>' +
      '<label>The project<textarea name="message" rows="5" maxlength="5500" required></textarea></label>' +
      '<label class="check"><input type="checkbox" name="collab" checked> This is a project enquiry</label>' +
      '<label hidden>Leave blank<input name="gotcha" tabindex="-1" autocomplete="off"></label>' +
      '<button type="submit">Send enquiry ↗</button><p class="form-status" role="status"></p>';
    right.append(form);
    form.addEventListener('submit', async e => {
      e.preventDefault(); const f = new FormData(form), status = form.querySelector('.form-status'), send = form.querySelector('button');
      if (f.get('gotcha')) { status.textContent = 'Thanks for getting in touch.'; return; }
      const name = f.get('name').trim(), message = f.get('message').trim();
      if (!name || !message) { status.textContent = 'Please add your name and a short message.'; return; }
      const body = { name, email: f.get('email').trim(), message, wants_to_work: f.has('collab') ? 'Yes' : 'No', _subject: 'Portfolio enquiry from ' + name };
      if (route.formsubmit) Object.assign(body, { _captcha: 'false', _template: 'table' });
      send.disabled = true; status.textContent = 'Sending…';
      try {
        const res = await fetch(route.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
        const payload = await res.json();
        if (!res.ok || payload.errors?.length || String(payload.success) === 'false') throw Error();
        form.reset(); status.textContent = 'Message sent. Thanks for the brief.';
      } catch { status.textContent = 'Your message could not be sent. Try again' + (emailPattern.test(email) ? ' or email ' + email : ' in a moment') + '.'; }
      finally { send.disabled = false; }
    });
  }
  function render() {
    const slug = (location.hash.slice(1) || location.pathname.split('/').filter(Boolean).pop() || 'home').toLowerCase();
    const known = ['home', 'work', 'about', 'contact', 'imagery', ...collections.map(c => c.route)];
    const next = known.includes(slug) ? slug : 'home';
    const navigating = !!activeRoute;
    if (dialog.open) dialog.close();
    hero?.dispose(); hero = null; coverObserver?.disconnect();
    coverObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { coverObserver.unobserve(entry.target); entry.target.prepareCover?.(); } });
    }, { rootMargin: '180px' });
    main.replaceChildren(); activeRoute = next; format = 'all';
    const inWork = ['work', 'imagery', ...collections.map(c => c.route)].includes(next);
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === (inWork ? 'work' : next)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = (next === 'home' ? '' : (collections.find(c => c.route === next)?.name || next[0].toUpperCase() + next.slice(1)) + ' — ') + (site.seo.siteTitle || brand);
    if (next === 'home') home(); else if (next === 'about') about(); else if (next === 'contact') contact(); else if (next === 'imagery') imagery(); else work(next);
    if (navigating) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }
  document.querySelectorAll('[data-brand]').forEach(n => { n.textContent = brand; });
  if (site.seo.metaDescription) document.querySelector('meta[name="description"]').content = site.seo.metaDescription;
  const social = document.getElementById('social');
  for (const [key, title] of Object.entries({ youtube: 'YouTube', instagram: 'Instagram', linkedin: 'LinkedIn' })) {
    const raw = String(site.social[key] || ''); if (!/^https?:\/\//i.test(raw)) continue;
    try { const u = new URL(raw); if (!u.pathname.replace(/\//g, '') && !u.search) continue; } catch { continue; }
    const a = link(raw, title + ' ↗'); a.target = '_blank'; a.rel = 'noopener noreferrer'; social.append(a);
  }
  if (emailPattern.test(site.seo.email)) social.append(link('mailto:' + site.seo.email, 'Email ↗'));
  document.getElementById('skip').addEventListener('click', e => { e.preventDefault(); main.focus(); });
  document.getElementById('back-top').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }); document.querySelector('.signature').focus({ preventScroll: true }); });
  window.addEventListener('hashchange', render);
  window.addEventListener('storage', e => { if (e.key === P.PUBLISHED_KEY) location.reload(); });
  render();
})();
