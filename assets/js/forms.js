/* Koki & Khabib Animal Aid — small bilingual multi-step form engine with drafts, uploads and review. */
(function () {
  'use strict';
  var KK = (window.KK = window.KK || {});
  var bi = function (v) { return KK.bi(v); };
  var esc = function (s) { return KK.esc(s); };

  var MSG = {
    required: { en: 'Please answer this.', hi: 'कृपया इसका जवाब दें।' },
    requiredFile: { en: 'Please add at least one file here.', hi: 'कृपया यहाँ कम से कम एक फ़ाइल जोड़ें।' },
    phone: { en: 'Enter a 10-digit Indian mobile number.', hi: '10 अंकों का भारतीय मोबाइल नंबर लिखें।' },
    email: { en: 'This email address does not look right.', hi: 'यह ईमेल पता सही नहीं लगता।' },
    pincode: { en: 'Pincode has 6 digits.', hi: 'पिनकोड 6 अंकों का होता है।' },
    upi: { en: 'A UPI ID looks like name@bank (for example 98xxxxxx@ybl).', hi: 'UPI ID ऐसा दिखता है: name@bank (जैसे 98xxxxxx@ybl)।' },
    number: { en: 'Enter a number.', hi: 'एक संख्या लिखें।' },
    tooShort: { en: 'Please write a little more.', hi: 'कृपया थोड़ा और लिखें।' },
    tooMany: { en: 'You can add up to {n} files here.', hi: 'आप यहाँ अधिकतम {n} फ़ाइलें जोड़ सकते हैं।' },
    tooBig: { en: 'This file is too large (max {n} MB).', hi: 'यह फ़ाइल बहुत बड़ी है (अधिकतम {n} MB)।' },
    badType: { en: 'This file type is not accepted.', hi: 'यह फ़ाइल प्रकार स्वीकार नहीं है।' },
    next: { en: 'Next', hi: 'आगे' }, back: { en: 'Back', hi: 'पीछे' }, submit: { en: 'Submit', hi: 'जमा करें' },
    step: { en: 'Step', hi: 'चरण' }, of: { en: 'of', hi: 'में से' },
    review: { en: 'Check and submit', hi: 'जाँचें और जमा करें' }, edit: { en: 'Edit', hi: 'बदलें' },
    restored: { en: 'We restored the answers saved on this phone.', hi: 'इस फ़ोन पर सहेजे गए आपके जवाब वापस आ गए हैं।' },
    startOver: { en: 'Start over', hi: 'फिर से शुरू करें' },
    takePhoto: { en: '📷 Take photo', hi: '📷 फ़ोटो लें' }, choose: { en: '📎 Choose files', hi: '📎 फ़ाइल चुनें' },
    preparing: { en: 'Preparing…', hi: 'तैयार हो रहा है…' }, files: { en: 'file(s)', hi: 'फ़ाइल' }, none: { en: '—', hi: '—' },
    fix: { en: 'Please fix the highlighted answers.', hi: 'कृपया लाल रंग वाले जवाब ठीक करें।' },
    yes: { en: 'Yes', hi: 'हाँ' }, no: { en: 'No', hi: 'नहीं' },
  };
  KK.MSG = MSG;
  var fill = function (m, n) { return { en: m.en.replace('{n}', n), hi: m.hi.replace('{n}', n) }; };

  var V = {
    tel: function (v) { var d = String(v || '').replace(/\D/g, ''); if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2); if (d.length === 11 && d[0] === '0') d = d.slice(1); return /^[6-9]\d{9}$/.test(d) ? null : MSG.phone; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? null : MSG.email; },
    pincode: function (v) { return /^\d{6}$/.test(String(v).trim()) ? null : MSG.pincode; },
    upi: function (v) { return /^[a-z0-9.\-_]{2,256}@[a-z][a-z0-9.\-]{1,64}$/i.test(String(v).trim()) ? null : MSG.upi; },
  };
  KK.validators = V;

  KK.Form = function (opts) {
    var F = this;
    F.o = opts;
    F.id = opts.id;
    F.data = {};
    F.files = {};
    F.step = 0;
    F.maxStep = 0;
    F.started = false;
    F.submitted = false;
    F.startedAt = Date.now();
    F.limits = Object.assign({ maxFiles: 12, imageMB: 8, pdfMB: 10, videoMB: 20 }, opts.limits || {});
    F.steps = opts.steps.slice();
    if (opts.review !== false) F.steps.push({ key: '_review', title: MSG.review, review: true });
    F.restore();
    F.render();
    document.addEventListener('kk:lang', function () { if (!F.submitted && !F.busy) F.render(true); });
    window.addEventListener('pagehide', function () {
      if (F.started && !F.submitted && opts.funnel) KK.beacon('funnel', { form: opts.funnel, outcome: 'abandoned', maxStep: String(F.maxStep + 1) });
    });
  };
  var P = KK.Form.prototype;

  /* ---------- persistence ---------- */
  P.draftKey = function () { return 'kk_draft_' + this.id; };
  P.save = function () {
    try { localStorage.setItem(this.draftKey(), JSON.stringify({ data: this.data, step: this.step, at: Date.now(), startedAt: this.startedAt })); } catch (e) { /* full or private */ }
  };
  P.restore = function () {
    var F = this;
    try {
      var d = JSON.parse(localStorage.getItem(F.draftKey()) || 'null');
      if (d && Date.now() - d.at < 7 * 864e5 && d.data && Object.keys(d.data).length) {
        F.data = d.data; F.step = Math.min(d.step || 0, F.steps.length - 1); F.maxStep = F.step; F.restored = true; F.startedAt = d.startedAt || F.startedAt;
      }
    } catch (e) { /* ignore */ }
    if (F.o.prefill) Object.keys(F.o.prefill).forEach(function (k) { if (F.data[k] === undefined) F.data[k] = F.o.prefill[k]; });
    KK.fileStore.all(F.id + ':').then(function (list) {
      list.forEach(function (x) {
        var r = x.rec; if (!r || !r.blob) return;
        var item = Object.assign({}, r.meta, { blob: r.blob, key: x.key, status: 'ready' });
        if (item.isImage) item.preview = URL.createObjectURL(r.blob);
        (F.files[r.field] = F.files[r.field] || []).push(item);
      });
      if (list.length) F.render(true);
    });
  };
  P.reset = function () {
    try { localStorage.removeItem(this.draftKey()); } catch (e) { /* ignore */ }
    KK.fileStore.clear(this.id + ':');
    this.data = {}; this.files = {}; this.step = 0; this.maxStep = 0; this.restored = false; this.startedAt = Date.now();
    if (this.o.prefill) Object.assign(this.data, this.o.prefill);
    this.render();
  };
  P.markStarted = function () {
    if (this.started) return;
    this.started = true;
    if (this.o.funnel) KK.api('funnel', { form: this.o.funnel, outcome: 'started', maxStep: '1' }, { retries: 0, timeout: 15000 }).catch(function () {});
  };

  /* ---------- helpers ---------- */
  P.visible = function (f) { return !f.show || f.show(this.data, this); };
  P.isRequired = function (f) { return typeof f.required === 'function' ? f.required(this.data, this) : !!f.required; };
  P.fieldsOf = function (s) { var F = this; return (s.fields || []).filter(function (f) { return F.visible(f); }); };

  P.validateField = function (f) {
    var v = this.data[f.name];
    if (f.type === 'note') return null;
    if (f.type === 'files') {
      var items = (this.files[f.name] || []).filter(function (i) { return i.status === 'ready'; });
      var min = typeof f.min === 'function' ? f.min(this.data) : (f.min || 0);
      if (this.isRequired(f) && items.length < Math.max(1, min)) return MSG.requiredFile;
      return null;
    }
    var empty = v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);
    if (empty) return this.isRequired(f) ? MSG.required : null;
    if (f.type === 'tel' && V.tel(v)) return V.tel(v);
    if (f.type === 'email' && V.email(v)) return V.email(v);
    if (f.kind === 'pincode' && V.pincode(v)) return V.pincode(v);
    if (f.kind === 'upi' && V.upi(v)) return V.upi(v);
    if (f.type === 'number') {
      var n = Number(v);
      if (!isFinite(n)) return MSG.number;
      if (f.min !== undefined && n < f.min) return { en: 'Minimum ' + f.min + '.', hi: 'कम से कम ' + f.min + '।' };
      if (f.max !== undefined && n > f.max) return { en: 'Maximum ' + f.max + '.', hi: 'अधिकतम ' + f.max + '।' };
    }
    if (f.minLength && String(v).trim().length < f.minLength) return MSG.tooShort;
    if (f.validate) return f.validate(v, this.data, this) || null;
    return null;
  };

  /* ---------- rendering ---------- */
  P.render = function (keepScroll) {
    var F = this, o = F.o, s = F.steps[F.step];
    var total = F.steps.length;
    var html = '';
    if (F.restored && F.step === 0 && !F.dismissedRestore) {
      html += '<div class="notice teal draft-note">' + bi(MSG.restored) + ' <button type="button" class="btn-link" data-act="reset" style="border:0;background:none;color:var(--teal);font-weight:700;cursor:pointer;text-decoration:underline">' + bi(MSG.startOver) + '</button></div>';
    }
    html += '<div class="progress" aria-hidden="true">' + F.steps.map(function (_, i) { return '<span class="' + (i < F.step ? 'done' : i === F.step ? 'now' : '') + '"></span>'; }).join('') + '</div>';
    html += '<div class="step-label">' + bi(MSG.step) + ' ' + (F.step + 1) + ' ' + bi(MSG.of) + ' ' + total + '</div>';
    html += '<h2 tabindex="-1" id="' + F.id + '-h">' + bi(s.title) + '</h2>';
    if (s.intro) html += '<div class="muted" style="margin-bottom:14px">' + (typeof s.intro === 'string' ? s.intro : '<span data-l="en">' + s.intro.en + '</span><span data-l="hi">' + s.intro.hi + '</span>') + '</div>';
    if (s.review) html += F.reviewHtml();
    else html += F.fieldsOf(s).map(function (f) { return F.fieldHtml(f); }).join('');
    html += '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">';
    html += '<div class="form-nav">' + (F.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">← ' + bi(MSG.back) + '</button>' : '<span></span>') +
      (s.review || F.step === total - 1 ? '<button type="button" class="btn btn-primary" data-act="submit">' + bi(o.submitLabel || MSG.submit) + '</button>'
        : '<button type="button" class="btn btn-primary" data-act="next">' + bi(MSG.next) + ' →</button>') + '</div>';
    html += '<div class="error" role="alert" id="' + F.id + '-err"></div>';
    o.el.innerHTML = html;
    F.bind();
    if (!keepScroll) {
      var h = document.getElementById(F.id + '-h');
      var top = o.el.getBoundingClientRect().top + window.pageYOffset - 80;
      if (window.pageYOffset > top) window.scrollTo(0, Math.max(0, top));
      if (h && F.rendered) h.focus({ preventScroll: true });
    }
    F.rendered = true;
  };

  P.fieldHtml = function (f) {
    var F = this, v = F.data[f.name], id = F.id + '-' + f.name;
    var req = F.isRequired(f);
    var lab = '<label for="' + id + '">' + bi(f.label) + (req ? '<span class="req" aria-hidden="true">*</span>' : '<span class="opt">' + bi({ en: '(optional)', hi: '(वैकल्पिक)' }) + '</span>') + '</label>';
    var help = f.help ? '<div class="help">' + (typeof f.help === 'string' ? f.help : '<span data-l="en">' + f.help.en + '</span><span data-l="hi">' + f.help.hi + '</span>') + '</div>' : '';
    var ph = f.placeholder ? ' placeholder="' + esc(KK.t(f.placeholder)) + '"' : '';
    var common = ' id="' + id + '" name="' + f.name + '" data-f="' + f.name + '"' + (req ? ' aria-required="true"' : '');
    var inner = '';
    switch (f.type) {
      case 'note':
        var htm = typeof f.html === 'function' ? f.html(F.data, F) : f.html;
        if (!htm) return '';
        return '<div class="field"><div class="notice ' + (f.tone || '') + '">' + (typeof htm === 'string' ? htm : '<span data-l="en">' + htm.en + '</span><span data-l="hi">' + htm.hi + '</span>') + '</div></div>';
      case 'textarea':
        inner = '<textarea' + common + ph + ' maxlength="' + (f.maxlength || 2000) + '">' + esc(v || '') + '</textarea>';
        break;
      case 'select':
        inner = '<select' + common + '><option value="">' + esc(KK.t({ en: 'Choose…', hi: 'चुनें…' })) + '</option>' +
          f.options.map(function (op) { return '<option value="' + esc(op.value) + '"' + (v === op.value ? ' selected' : '') + '>' + esc(KK.t(op.label)) + '</option>'; }).join('') + '</select>';
        break;
      case 'radio':
      case 'checks':
        var multi = f.type === 'checks';
        var vals = multi ? (Array.isArray(v) ? v : []) : [v];
        lab = '<div class="label" id="' + id + '-l">' + bi(f.label) + (req ? '<span class="req" aria-hidden="true">*</span>' : '<span class="opt">' + bi({ en: '(optional)', hi: '(वैकल्पिक)' }) + '</span>') + '</div>';
        inner = '<div class="choices ' + (f.cols ? 'cols' + f.cols : '') + '" role="' + (multi ? 'group' : 'radiogroup') + '" aria-labelledby="' + id + '-l">' + f.options.map(function (op, i) {
          var on = vals.indexOf(op.value) >= 0;
          return '<label class="choice' + (on ? ' on' : '') + '"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + f.name + '" value="' + esc(op.value) + '" data-f="' + f.name + '"' + (on ? ' checked' : '') + (i === 0 ? ' id="' + id + '"' : '') + '>' +
            (op.icon ? '<span class="ci" aria-hidden="true">' + op.icon + '</span>' : '') + '<span>' + bi(op.label) + (op.desc ? '<span class="cdesc">' + bi(op.desc) + '</span>' : '') + '</span></label>';
        }).join('') + '</div>';
        break;
      case 'checkbox':
        return '<div class="field" data-wrap="' + f.name + '"><label class="choice' + (v ? ' on' : '') + '"><input type="checkbox"' + common + (v ? ' checked' : '') + '><span>' + bi(f.label) +
          (req ? '<span class="req" aria-hidden="true">*</span>' : '') + (f.help ? '<span class="cdesc">' + bi(f.help) + '</span>' : '') + '</span></label><div class="error" data-err="' + f.name + '"></div></div>';
      case 'files':
        return F.filesHtml(f, lab, help);
      default:
        var t = f.type === 'number' ? 'text' : f.type;
        var im = f.inputmode || (f.type === 'tel' ? 'tel' : f.type === 'number' ? 'numeric' : f.type === 'email' ? 'email' : '');
        inner = '<input type="' + (t || 'text') + '"' + common + ph + ' value="' + esc(v === undefined ? '' : v) + '"' + (im ? ' inputmode="' + im + '"' : '') +
          (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : '') + ' maxlength="' + (f.maxlength || 200) + '"' + (f.prefix ? ' style="padding-left:30px"' : '') + '>';
        if (f.prefix) inner = '<div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);font-weight:700">' + esc(f.prefix) + '</span>' + inner + '</div>';
    }
    return '<div class="field" data-wrap="' + f.name + '">' + lab + help + inner + '<div class="error" data-err="' + f.name + '"></div></div>';
  };

  P.filesHtml = function (f, lab, help) {
    var F = this, items = F.files[f.name] || [];
    var accept = f.accept || (f.media === 'video' ? 'video/*' : f.media === 'doc' ? 'image/*,application/pdf' : 'image/*');
    var label = '<div class="label">' + bi(f.label) + (F.isRequired(f) ? '<span class="req" aria-hidden="true">*</span>' : '<span class="opt">' + bi({ en: '(optional)', hi: '(वैकल्पिक)' }) + '</span>') + '</div>';
    var thumbs = items.map(function (it, i) {
      var body = it.preview ? '<img alt="" src="' + it.preview + '">' : '<span>' + esc(it.name || '') + '<br>' + (it.size ? Math.round(it.size / 1024) + ' KB' : '') + '</span>';
      if (it.status === 'preparing') body += '<span class="busy">' + bi(MSG.preparing) + '</span>';
      if (it.status === 'error') body = '<span style="color:var(--red);padding:4px">' + bi(it.error) + '</span>';
      return '<div class="thumb">' + body + '<button type="button" data-rm="' + f.name + ':' + i + '" aria-label="Remove">✕</button></div>';
    }).join('');
    return '<div class="field" data-wrap="' + f.name + '">' + label + help +
      '<div class="upload" data-up="' + f.name + '"><div class="pick">' +
      (f.media === 'image' || !f.media ? '<label class="btn btn-ghost" style="min-height:44px;padding:8px 14px">' + bi(MSG.takePhoto) + '<input type="file" accept="image/*" capture="environment" data-file="' + f.name + '" hidden></label>' : '') +
      '<label class="btn btn-ghost" style="min-height:44px;padding:8px 14px">' + bi(MSG.choose) + '<input type="file" accept="' + accept + '"' + (f.max === 1 ? '' : ' multiple') + ' data-file="' + f.name + '" hidden></label></div>' +
      (thumbs ? '<div class="thumbs">' + thumbs + '</div>' : '') + '</div><div class="error" data-err="' + f.name + '"></div></div>';
  };

  P.reviewHtml = function () {
    var F = this;
    var out = '<div class="review">';
    F.steps.forEach(function (s, si) {
      if (s.review) return;
      var rows = F.fieldsOf(s).filter(function (f) { return f.type !== 'note' && !f.noReview; }).map(function (f) {
        var v = F.data[f.name], shown;
        if (f.type === 'files') { var n = (F.files[f.name] || []).filter(function (i) { return i.status === 'ready'; }).length; shown = n ? n + ' ' + KK.t(MSG.files) : KK.t(MSG.none); }
        else if (f.type === 'checkbox') shown = KK.t(v ? MSG.yes : MSG.no);
        else if (f.options) {
          var arr = Array.isArray(v) ? v : (v === undefined || v === '' ? [] : [v]);
          shown = arr.map(function (x) { var op = f.options.filter(function (o) { return o.value === x; })[0]; return op ? KK.t(op.label) : x; }).join(', ') || KK.t(MSG.none);
        } else shown = (v === undefined || v === '') ? KK.t(MSG.none) : (f.prefix ? f.prefix + (f.prefix.length > 1 ? ' ' : '') : '') + v;
        return '<dt>' + bi(f.reviewLabel || f.label) + '</dt><dd>' + esc(shown) + '</dd>';
      }).join('');
      if (!rows) return;
      out += '<h3>' + bi(s.title) + ' <button type="button" data-goto="' + si + '" style="border:0;background:none;color:var(--teal);font-weight:700;cursor:pointer;font-size:.9rem">' + bi(MSG.edit) + '</button></h3><dl>' + rows + '</dl>';
    });
    out += '</div>';
    if (F.o.reviewFields) out += F.o.reviewFields.filter(function (f) { return F.visible(f); }).map(function (f) { return F.fieldHtml(f); }).join('');
    return out;
  };

  /* ---------- events ---------- */
  P.bind = function () {
    var F = this, el = F.o.el;
    el.querySelectorAll('[data-f]').forEach(function (inp) {
      var name = inp.getAttribute('data-f');
      var handler = function (rerender) {
        F.markStarted();
        var all = F.allFields(), f = all.filter(function (x) { return x.name === name; })[0];
        if (!f) return;
        if (f.type === 'checks') F.data[name] = Array.prototype.map.call(el.querySelectorAll('input[data-f="' + name + '"]:checked'), function (x) { return x.value; });
        else if (f.type === 'checkbox') F.data[name] = inp.checked;
        else if (f.type === 'radio') { var c = el.querySelector('input[data-f="' + name + '"]:checked'); F.data[name] = c ? c.value : ''; }
        else F.data[name] = inp.value;
        if (f.onChange) f.onChange(F.data[name], F.data, F);
        F.save();
        var w = el.querySelector('[data-wrap="' + name + '"]');
        if (w && w.classList.contains('invalid') && !F.validateField(f)) { w.classList.remove('invalid'); var e = w.querySelector('[data-err]'); if (e) e.textContent = ''; }
        if (rerender) F.render(true);
      };
      var t = inp.type;
      if (t === 'radio' || t === 'checkbox' || inp.tagName === 'SELECT') inp.addEventListener('change', function () { handler(true); });
      else { inp.addEventListener('input', function () { handler(false); }); inp.addEventListener('blur', function () { handler(!!F.dependsOn(name)); }); }
    });
    el.querySelectorAll('[data-file]').forEach(function (inp) {
      inp.addEventListener('change', function () { F.markStarted(); F.addFiles(inp.getAttribute('data-file'), Array.prototype.slice.call(inp.files)); inp.value = ''; });
    });
    el.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-rm').split(':'), list = F.files[p[0]] || [], it = list[Number(p[1])];
        if (it && it.key) KK.fileStore.del(it.key);
        if (it && it.preview) URL.revokeObjectURL(it.preview);
        list.splice(Number(p[1]), 1);
        F.render(true);
      });
    });
    el.querySelectorAll('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { F.step = Number(b.getAttribute('data-goto')); F.save(); F.render(); }); });
    el.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-act');
        if (a === 'reset') { if (confirm(KK.t({ en: 'Clear all answers and start over?', hi: 'सभी जवाब मिटाकर फिर से शुरू करें?' }))) F.reset(); return; }
        if (a === 'back') { F.step = Math.max(0, F.step - 1); F.dismissedRestore = true; F.save(); F.render(); return; }
        if (a === 'next') { if (F.check()) { F.step++; F.maxStep = Math.max(F.maxStep, F.step); F.dismissedRestore = true; F.save(); F.render(); } return; }
        if (a === 'submit') { if (F.check(true)) F.submit(); }
      });
    });
  };
  P.allFields = function () {
    var out = [];
    this.steps.forEach(function (s) { (s.fields || []).forEach(function (f) { out.push(f); }); });
    (this.o.reviewFields || []).forEach(function (f) { out.push(f); });
    return out;
  };
  P.dependsOn = function (name) {
    var F = this;
    return F.allFields().some(function (f) { return f.deps && f.deps.indexOf(name) >= 0; });
  };

  /** Validates the current step (or everything on the review step). */
  P.check = function (all) {
    var F = this, el = F.o.el, first = null, firstStep = null;
    var steps = all ? F.steps.map(function (s, i) { return i; }) : [F.step];
    steps.forEach(function (si) {
      var s = F.steps[si];
      var fields = s.review ? (F.o.reviewFields || []).filter(function (f) { return F.visible(f); }) : F.fieldsOf(s);
      fields.forEach(function (f) {
        var err = F.validateField(f);
        if (err && firstStep === null) { firstStep = si; first = f.name; }
        if (si === F.step) {
          var w = el.querySelector('[data-wrap="' + f.name + '"]');
          if (w) { w.classList.toggle('invalid', !!err); var e = w.querySelector('[data-err]'); if (e) e.innerHTML = err ? bi(err) : ''; }
        }
      });
    });
    var box = document.getElementById(F.id + '-err');
    if (firstStep === null) { if (box) box.textContent = ''; return true; }
    if (firstStep !== F.step) { F.step = firstStep; F.render(); return F.check(); }
    if (box) box.innerHTML = bi(MSG.fix);
    var target = el.querySelector('[data-wrap="' + first + '"]');
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); var inp = target.querySelector('input,select,textarea'); if (inp) setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 300); }
    return false;
  };

  /* ---------- files ---------- */
  P.totalFiles = function () { var F = this; return Object.keys(F.files).reduce(function (n, k) { return n + F.files[k].filter(function (i) { return i.status !== 'error'; }).length; }, 0); };
  P.addFiles = function (name, list) {
    var F = this;
    var f = F.allFields().filter(function (x) { return x.name === name; })[0];
    var items = (F.files[name] = F.files[name] || []);
    var max = f.max || 5;
    list.forEach(function (file) {
      if (items.length >= max || F.totalFiles() >= F.limits.maxFiles) {
        var w = F.o.el.querySelector('[data-err="' + name + '"]'); if (w) w.innerHTML = bi(fill(MSG.tooMany, Math.min(max, F.limits.maxFiles)));
        return;
      }
      var item = { name: file.name, status: 'preparing', field: name, kind: f.kind };
      items.push(item);
      KK.prepareFile(file).then(function (p) {
        Object.assign(item, p);
        var mb = item.size / 1048576;
        var isVideo = /^video\//.test(item.mime), isPdf = item.mime === 'application/pdf', isImg = /^image\//.test(item.mime);
        var limit = isVideo ? F.limits.videoMB : isPdf ? F.limits.pdfMB : F.limits.imageMB;
        var okType = f.media === 'video' ? isVideo : f.media === 'doc' ? (isPdf || isImg) : isImg;
        if (!okType) { item.status = 'error'; item.error = MSG.badType; }
        else if (mb > limit) { item.status = 'error'; item.error = fill(MSG.tooBig, limit); }
        else {
          item.status = 'ready';
          item.key = F.id + ':' + name + ':' + Date.now() + ':' + Math.random().toString(36).slice(2, 7);
          var meta = { name: item.name, mime: item.mime, size: item.size, sha256: item.sha256, dhash: item.dhash, exifDate: item.exifDate, isImage: item.isImage, kind: f.kind };
          KK.fileStore.put(item.key, { field: name, meta: meta, blob: item.blob });
        }
        F.render(true);
      }).catch(function () { item.status = 'error'; item.error = MSG.badType; F.render(true); });
    });
    F.render(true);
  };
  /** Ready files in upload order: [{ field, kind, item }] */
  P.readyFiles = function () {
    var F = this, out = [];
    F.allFields().forEach(function (f) {
      if (f.type !== 'files' || !F.visible(f)) return;
      (F.files[f.name] || []).forEach(function (it) { if (it.status === 'ready') out.push({ field: f.name, kind: f.kind, item: it }); });
    });
    return out;
  };

  /* ---------- submit ---------- */
  P.submit = function () {
    var F = this;
    if (F.busy) return;
    F.busy = true;
    var hp = F.o.el.querySelector('input[name="website"]');
    var ui = {
      progress: function (pct, label) {
        F.o.el.innerHTML = '<div class="sending" aria-live="polite"><h2>' + bi(label) + '</h2><div class="bar"><i style="width:' + Math.round(pct) + '%"></i></div><p class="muted small">' +
          bi({ en: 'Please keep this page open.', hi: 'कृपया यह पेज खुला रखें।' }) + '</p></div>';
      },
      done: function (html) {
        F.submitted = true; F.busy = false;
        try { localStorage.removeItem(F.draftKey()); } catch (e) { /* ignore */ }
        KK.fileStore.clear(F.id + ':');
        F.o.el.innerHTML = html;
        window.scrollTo(0, Math.max(0, F.o.el.getBoundingClientRect().top + window.pageYOffset - 90));
      },
      fail: function (msg, keepForm) {
        F.busy = false;
        if (keepForm) { F.render(); var b = document.getElementById(F.id + '-err'); if (b) b.textContent = msg; return; }
        F.o.el.innerHTML = '<div class="notice red"><p>' + KK.esc(msg) + '</p></div><div class="form-nav"><button type="button" class="btn btn-primary" id="' + F.id + '-retry">' +
          bi({ en: 'Try again', hi: 'फिर कोशिश करें' }) + '</button></div>';
        document.getElementById(F.id + '-retry').onclick = function () { F.render(); };
      },
    };
    Promise.resolve(F.o.onSubmit(F.data, F.readyFiles(), ui, { hp: hp ? hp.value : '', elapsedMs: Date.now() - F.startedAt })).catch(function (e) {
      ui.fail(KK.errorText(e && e.message === 'Failed to fetch' ? 'offline' : (e && e.code) || 'offline'), false);
    });
  };

  /**
   * Uploads prepared files for a case, one at a time, with retries. Calls onProgress(i, n).
   * Returns the number of files that failed.
   */
  KK.uploadAll = function (caseId, token, files, onProgress, onUploaded) {
    var failed = 0, i = 0;
    var next = function () {
      if (i >= files.length) return Promise.resolve(failed);
      var x = files[i];
      onProgress(i, files.length);
      return KK.toBase64(x.item.blob).then(function (b64) {
        return KK.api('upload', {
          caseId: caseId, token: token, kind: x.kind, name: x.item.name, mime: x.item.mime,
          sha256: x.item.sha256 || '', dhash: x.item.dhash || '', exifDate: x.item.exifDate || '', data: b64,
        }, { retries: 2, timeout: 120000 });
      }).then(function (r) {
        if (!r || !r.ok) failed++;
        else if (onUploaded) onUploaded(x);
      }).catch(function () { failed++; }).then(function () { i++; return next(); });
    };
    return next();
  };
})();
