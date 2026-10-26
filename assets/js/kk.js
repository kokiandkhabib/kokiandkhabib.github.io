/* Koki & Khabib Animal Aid — core site script: language, menu, API client, small helpers. */
(function () {
  'use strict';
  var KK = (window.KK = window.KK || {});
  var CFG = window.KK_CONFIG || {};

  /* ---------- language ---------- */
  KK.lang = function () { return document.documentElement.lang === 'hi' ? 'hi' : 'en'; };
  KK.setLang = function (l) {
    l = l === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = l;
    try { localStorage.setItem('kk_lang', l); } catch (e) { /* private mode */ }
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.textContent = l === 'hi' ? 'English' : 'हिंदी';
      b.setAttribute('aria-label', l === 'hi' ? 'Switch to English' : 'हिंदी में देखें');
    });
    document.dispatchEvent(new CustomEvent('kk:lang', { detail: l }));
  };
  /** Picks the right language from an {en, hi} object (or returns a plain string). */
  KK.t = function (v) { if (v === null || v === undefined) return ''; if (typeof v === 'string') return v; return v[KK.lang()] || v.en || ''; };
  /** Renders bilingual inline HTML: both languages present, CSS shows one. */
  KK.bi = function (v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return KK.esc(v);
    return '<span data-l="en">' + KK.esc(v.en) + '</span><span data-l="hi">' + KK.esc(v.hi || v.en) + '</span>';
  };
  KK.esc = function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  KK.inr = function (n) {
    var x = Math.round(Number(n) || 0), s = String(Math.abs(x)), last3 = s.slice(-3), rest = s.slice(0, -3);
    if (rest) last3 = ',' + last3;
    return (x < 0 ? '-' : '') + '₹' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3;
  };
  KK.qs = function (name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };

  /* ---------- test mode (founder only: ?test=<key> once per tab) ---------- */
  try {
    var tk = KK.qs('test');
    if (tk) sessionStorage.setItem('kk_test', tk);
    KK.testKey = sessionStorage.getItem('kk_test') || '';
  } catch (e) { KK.testKey = ''; }

  /* ---------- API ---------- */
  KK.apiReady = function () { return !!CFG.apiUrl; };
  KK.api = function (action, payload, opts) {
    opts = opts || {};
    var body = Object.assign({ action: action, lang: KK.lang() }, payload || {});
    if (KK.testKey) body.testKey = KK.testKey;
    if (!CFG.apiUrl) return Promise.reject(new Error('offline'));
    var attempt = 0, max = opts.retries === undefined ? 1 : opts.retries;
    var once = function () {
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, opts.timeout || 60000) : null;
      return fetch(CFG.apiUrl, { method: 'POST', body: JSON.stringify(body), redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); })
        .then(function (j) { if (timer) clearTimeout(timer); return j; })
        .catch(function (e) {
          if (timer) clearTimeout(timer);
          if (attempt++ < max) return new Promise(function (res) { setTimeout(res, 1500 * attempt); }).then(once);
          throw e;
        });
    };
    return once();
  };
  /** Fire-and-forget (used when the page is closing). */
  KK.beacon = function (action, payload) {
    if (!CFG.apiUrl || !navigator.sendBeacon) return;
    var body = Object.assign({ action: action, lang: KK.lang() }, payload || {});
    if (KK.testKey) body.testKey = KK.testKey;
    try { navigator.sendBeacon(CFG.apiUrl, new Blob([JSON.stringify(body)], { type: 'text/plain' })); } catch (e) { /* ignore */ }
  };

  /** Intake status shared by pages (cached for this tab for 2 minutes). */
  KK.config = function () {
    try {
      var c = JSON.parse(sessionStorage.getItem('kk_cfg') || 'null');
      if (c && Date.now() - c.at < 120000 && !KK.testKey) return Promise.resolve(c.v);
    } catch (e) { /* ignore */ }
    return KK.api('config', {}, { retries: 1, timeout: 20000 }).then(function (v) {
      try { sessionStorage.setItem('kk_cfg', JSON.stringify({ at: Date.now(), v: v })); } catch (e) { /* ignore */ }
      return v;
    });
  };

  KK.errorText = function (code) {
    var m = {
      offline: { en: "We couldn't reach our server. Your answers are saved on this phone — please try again in a few minutes.", hi: 'हमारे सर्वर से संपर्क नहीं हो पाया। आपके जवाब इस फ़ोन पर सुरक्षित हैं — कृपया कुछ मिनट बाद फिर कोशिश करें।' },
      busy: { en: 'We are receiving many requests right now. Please try again in an hour.', hi: 'अभी बहुत सारे अनुरोध आ रहे हैं। कृपया एक घंटे बाद फिर कोशिश करें।' },
      rate_phone: { en: 'This phone number has sent several requests today. Please try again tomorrow, or message us on Instagram.', hi: 'इस फ़ोन नंबर से आज कई अनुरोध आ चुके हैं। कृपया कल फिर कोशिश करें, या Instagram पर संदेश भेजें।' },
      too_fast: { en: 'That was very quick! Please check your answers and press submit again.', hi: 'यह बहुत जल्दी हो गया! कृपया अपने जवाब जाँचें और फिर से सबमिट करें।' },
      paused: { en: 'New applications are paused right now.', hi: 'अभी नए आवेदन रुके हुए हैं।' },
      emergency_paused: { en: 'The emergency lane is paused right now. Please contact one of the 24-hour hospitals listed on this page.', hi: 'आपातकालीन सेवा अभी रुकी हुई है। कृपया इस पेज पर दिए 24 घंटे वाले अस्पतालों से संपर्क करें।' },
      storage: { en: 'We cannot accept uploads right now. Please try again later.', hi: 'अभी हम अपलोड स्वीकार नहीं कर पा रहे हैं। कृपया बाद में कोशिश करें।' },
      not_found: { en: "We couldn't find that case. Check the Case ID and the last 4 digits of your phone number.", hi: 'यह केस नहीं मिला। केस ID और अपने फ़ोन नंबर के आख़िरी 4 अंक जाँचें।' },
      locked: { en: 'Too many attempts. Please try again in an hour.', hi: 'बहुत ज़्यादा प्रयास हो गए। कृपया एक घंटे बाद कोशिश करें।' },
      invalid: { en: 'Some answers need another look.', hi: 'कुछ जवाबों को फिर से देखने की ज़रूरत है।' },
      server_error: { en: 'Something went wrong on our side. Please try again.', hi: 'हमारी तरफ़ कुछ गड़बड़ हुई। कृपया फिर कोशिश करें।' },
    };
    return KK.t(m[code] || m.server_error);
  };

  /* ---------- page chrome ---------- */
  function initChrome() {
    var stored = 'en';
    try { stored = localStorage.getItem('kk_lang') || 'en'; } catch (e) { /* ignore */ }
    var q = KK.qs('lang');
    KK.setLang(q === 'hi' || q === 'en' ? q : stored);
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.addEventListener('click', function () { KK.setLang(KK.lang() === 'hi' ? 'en' : 'hi'); });
    });
    var mb = document.querySelector('.menu-btn'), mn = document.querySelector('.mobile-nav');
    if (mb && mn) mb.addEventListener('click', function () { var open = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .mobile-nav a').forEach(function (a) { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
    document.querySelectorAll('[data-ig]').forEach(function (a) { a.href = 'https://instagram.com/' + (CFG.instagram || 'kokiandkhabib'); });
    document.querySelectorAll('[data-ig-text]').forEach(function (s) { s.textContent = '@' + (CFG.instagram || 'kokiandkhabib'); });
    document.querySelectorAll('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });
    if (document.querySelector('[data-status]')) KK.paintStatus();
    if (KK.testKey) {
      var b = document.createElement('div');
      b.textContent = 'TEST MODE — submissions are tagged as tests';
      b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#b42318;color:#fff;text-align:center;font:600 13px sans-serif;padding:4px;z-index:99';
      document.body.appendChild(b);
    }
  }

  /** Shows Open / Limited / Paused on any element with [data-status]. */
  KK.paintStatus = function () {
    var els = document.querySelectorAll('[data-status]');
    if (!els.length) return Promise.resolve(null);
    return KK.config().then(function (c) {
      var map = {
        open: { en: 'Applications open', hi: 'आवेदन खुले हैं' },
        limited: { en: 'Applications open — limited funds this month', hi: 'आवेदन खुले हैं — इस महीने सीमित राशि' },
        paused: { en: 'New applications paused', hi: 'नए आवेदन अभी रुके हैं' },
      };
      els.forEach(function (el) {
        el.className = 'status ' + (c.intake || 'unknown');
        var extra = c.intake === 'paused' && c.reopen ? { en: ' · reopening ' + KK.niceDate(c.reopen, 'en'), hi: ' · ' + KK.niceDate(c.reopen, 'hi') + ' से फिर खुलेंगे' } : { en: '', hi: '' };
        el.innerHTML = '<span data-l="en">' + KK.esc(map[c.intake].en + extra.en) + '</span><span data-l="hi">' + KK.esc(map[c.intake].hi + extra.hi) + '</span>';
      });
      var n = document.querySelector('[data-notice]');
      if (n && c.notice && (c.notice.en || c.notice.hi)) {
        n.innerHTML = KK.bi({ en: c.notice.en || c.notice.hi, hi: c.notice.hi || c.notice.en });
        n.classList.remove('hidden');
      }
      return c;
    }).catch(function () { return null; });
  };

  KK.niceDate = function (iso, lang) {
    var d = new Date(String(iso).length === 10 ? iso + 'T12:00:00+05:30' : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initChrome); else initChrome();
})();
