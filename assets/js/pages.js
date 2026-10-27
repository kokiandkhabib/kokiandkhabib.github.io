/* Koki & Khabib Animal Aid: track, follow-up and partner pages (plus the emergency form, currently switched off). */
(function () {
  'use strict';
  var KK = window.KK;
  var bi = KK.bi;

  /* ---------- emergency fast-track ---------- */
  KK.bootEmergency = function () {
    var el = document.getElementById('emergency-form');
    if (!el) return;
    var steps = [{
      key: 'em', title: { en: 'Emergency fast-track', hi: 'आपातकालीन जल्दी मदद' },
      intro: { en: 'For animals already at (or on the way to) a vet. We call the clinic and can pay them directly, up to ₹2,000 before documents.', hi: 'उन जानवरों के लिए जो डॉक्टर के पास हैं (या ले जाए जा रहे हैं)। हम क्लिनिक को फ़ोन करके सीधे उन्हें भुगतान कर सकते हैं, दस्तावेज़ों से पहले ₹2,000 तक।' },
      fields: [
        { name: 'name', type: 'text', required: true, maxlength: 80, autocomplete: 'name', label: { en: 'Your name', hi: 'आपका नाम' } },
        { name: 'phone', type: 'tel', required: true, prefix: '+91', maxlength: 15, autocomplete: 'tel-national', label: { en: 'Your mobile number', hi: 'आपका मोबाइल नंबर' } },
        { name: 'species', type: 'radio', required: true, cols: 3, label: { en: 'Animal', hi: 'जानवर' }, options: [
          { value: 'dog', icon: '🐕', label: { en: 'Dog', hi: 'कुत्ता' } }, { value: 'cat', icon: '🐈', label: { en: 'Cat', hi: 'बिल्ली' } },
          { value: 'cow', icon: '🐄', label: { en: 'Cow', hi: 'गाय' } }, { value: 'bird', icon: '🐦', label: { en: 'Bird', hi: 'पक्षी' } },
          { value: 'goat', icon: '🐐', label: { en: 'Goat', hi: 'बकरी' } }, { value: 'other', icon: '➕', label: { en: 'Other', hi: 'अन्य' } }] },
        { name: 'speciesOther', type: 'text', required: true, maxlength: 60, show: function (d) { return d.species === 'other'; }, label: { en: 'Which animal?', hi: 'कौन-सा जानवर?' } },
        { name: 'conditions', type: 'checks', cols: 2, label: { en: 'What happened?', hi: 'क्या हुआ?' }, options: [
          { value: 'hit_vehicle', label: { en: 'Hit by a vehicle', hi: 'गाड़ी से टक्कर' } }, { value: 'bleeding', label: { en: 'Heavy bleeding', hi: 'ज़्यादा खून बहना' } },
          { value: 'cannot_stand', label: { en: "Can't stand / collapsed", hi: 'खड़ा नहीं हो पा रहा / गिर गया' } }, { value: 'breathing', label: { en: 'Breathing difficulty', hi: 'साँस लेने में तकलीफ़' } },
          { value: 'maggots', label: { en: 'Maggot wound', hi: 'घाव में कीड़े' } }, { value: 'poisoning', label: { en: 'Suspected poisoning', hi: 'ज़हर का शक' } },
          { value: 'seizures', label: { en: 'Seizures', hi: 'दौरे' } }, { value: 'fracture', label: { en: 'Broken bone', hi: 'हड्डी टूटी' } },
          { value: 'birth_difficulty', label: { en: 'Difficult birth', hi: 'प्रसव में तकलीफ़' } }, { value: 'burns', label: { en: 'Burns', hi: 'जलना' } },
          { value: 'other', label: { en: 'Other', hi: 'अन्य' } }] },
        { name: 'animalDesc', type: 'textarea', required: true, minLength: 5, maxlength: 1000, label: { en: 'In a few words: what happened and how is the animal now?', hi: 'कुछ शब्दों में: क्या हुआ और जानवर अभी कैसा है?' } },
        { name: 'area', type: 'text', required: true, maxlength: 120, label: { en: 'Area in Mumbai', hi: 'मुंबई में इलाका' } },
        { name: 'pincode', type: 'text', kind: 'pincode', inputmode: 'numeric', maxlength: 6, label: { en: 'Pincode', hi: 'पिनकोड' } },
        { name: 'clinicName', type: 'text', required: true, maxlength: 120, label: { en: 'Clinic / hospital name', hi: 'क्लिनिक / अस्पताल का नाम' } },
        { name: 'clinicPhone', type: 'text', required: true, inputmode: 'tel', maxlength: 16, label: { en: 'Clinic phone number', hi: 'क्लिनिक का फ़ोन नंबर' },
          help: { en: 'We call this number to confirm before paying.', hi: 'भुगतान से पहले पुष्टि के लिए हम इस नंबर पर फ़ोन करते हैं।' },
          validate: function (v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 8 && d.length <= 13 ? null : { en: 'Enter the clinic phone number.', hi: 'क्लिनिक का फ़ोन नंबर लिखें।' }; } },
        { name: 'amount', type: 'number', required: true, min: 1, max: 500000, prefix: '₹', maxlength: 7, label: { en: 'Amount needed now', hi: 'अभी कितनी राशि चाहिए' } },
        { name: 'payeeUPI', type: 'text', kind: 'upi', maxlength: 80, label: { en: "Clinic's UPI ID, if you know it", hi: 'क्लिनिक का UPI ID, अगर पता हो' } },
        { name: 'f_photo', type: 'files', kind: 'animal_photo', media: 'image', required: true, max: 3, label: { en: 'Photo of the animal', hi: 'जानवर की फ़ोटो' } },
        { name: 'f_estimate', type: 'files', kind: 'estimate', media: 'doc', max: 2, label: { en: 'Estimate or bill (if you have it)', hi: 'एस्टिमेट या बिल (अगर हो)' } },
      ],
    }];
    var start = function (limits) {
      new KK.Form({ el: el, id: 'emergency', funnel: 'emergency', steps: steps, reviewFields: KK.CONSENT_FIELDS.slice(0, 2), limits: limits,
        submitLabel: { en: 'Send emergency request', hi: 'आपातकालीन अनुरोध भेजें' },
        onSubmit: function (data, files, ui, meta) {
          var d = Object.assign({}, data, { payeeType: 'clinic', payeeName: data.clinicName, clinicInvolved: 'yes', category: 'vet_treatment', urgency: 'today',
            ifNotFunded: 'cannot_start', partialHelps: 'Y', otherFunding: 'N', animalStatus: 'injured_unknown', role: 'citizen' });
          return KK.submitCase('Emergency', d, files, ui, meta, 'emergency');
        } });
    };
    KK.resumePending('emergency', el).then(function (resumed) {
      if (resumed) return;
      if (!KK.apiReady()) return start();
      KK.config().then(function (c) {
        if (c && c.emergency === 'paused' && !KK.testKey) {
          el.innerHTML = '<div class="notice red"><p>' + KK.esc(KK.errorText('emergency_paused')) + '</p></div>';
          return;
        }
        start(c && c.limits);
      }).catch(function () { start(); });
    });
  };

  /* ---------- status meanings ---------- */
  var STATUS = {
    received: { tone: '', t: { en: 'Received, under review', hi: 'मिल गया, समीक्षा जारी है' }, d: { en: 'We review requests every evening. We will WhatsApp you if we need anything.', hi: 'हम हर शाम अनुरोधों की समीक्षा करते हैं। कुछ चाहिए होगा तो हम WhatsApp करेंगे।' } },
    info_needed: { tone: 'warn', t: { en: 'We need a little more information', hi: 'हमें थोड़ी और जानकारी चाहिए' }, d: { en: 'Please add the items below. If we do not hear back within 7 days, the request closes (you can reopen it).', hi: 'कृपया नीचे दी गई चीज़ें जोड़ें। 7 दिन में जवाब न मिलने पर अनुरोध बंद हो जाएगा (आप इसे फिर खोल सकते हैं)।' } },
    verifying: { tone: 'warn', t: { en: 'Being verified', hi: 'जाँच चल रही है' }, d: { en: 'We are checking a few details and may call the clinic. This is routine.', hi: 'हम कुछ जानकारी जाँच रहे हैं और क्लिनिक को फ़ोन कर सकते हैं। यह सामान्य है।' } },
    approved: { tone: '', t: { en: 'Approved: payment being arranged', hi: 'मंज़ूर: भुगतान की व्यवस्था हो रही है' }, d: { en: 'We pay the clinic, pharmacy or supplier directly and will send you the reference.', hi: 'हम सीधे क्लिनिक, फ़ार्मेसी या सप्लायर को भुगतान करते हैं और आपको रेफ़रेंस भेजेंगे।' } },
    paid: { tone: '', t: { en: 'Paid', hi: 'भुगतान हो गया' }, d: { en: 'Thank you for helping this animal.', hi: 'इस जानवर की मदद के लिए धन्यवाद।' } },
    followup_due: { tone: 'warn', t: { en: 'Paid: please share the bill and an update', hi: 'भुगतान हो गया: कृपया बिल और अपडेट भेजें' }, d: { en: 'Upload the final bill and a recent photo of the animal.', hi: 'अंतिम बिल और जानवर की हाल की फ़ोटो अपलोड करें।' } },
    closed: { tone: '', t: { en: 'Closed', hi: 'बंद' }, d: { en: 'This request is complete. Thank you.', hi: 'यह अनुरोध पूरा हो गया है। धन्यवाद।' } },
    not_funded: { tone: 'bad', t: { en: "We weren't able to support this request", hi: 'हम इस अनुरोध में मदद नहीं कर पाए' }, d: { en: "This isn't a judgement on you or the animal. We are a very small initiative with strict limits. You can apply again for a new need or next month.", hi: 'यह आप पर या जानवर पर कोई टिप्पणी नहीं है। हम सख़्त सीमाओं वाली एक बहुत छोटी पहल हैं। आप किसी नई ज़रूरत के लिए या अगले महीने फिर आवेदन कर सकते हैं।' } },
    withdrawn: { tone: 'bad', t: { en: 'Withdrawn', hi: 'वापस लिया गया' }, d: { en: 'This request was withdrawn.', hi: 'यह अनुरोध वापस ले लिया गया।' } },
  };
  KK.statusHtml = function (caseId, s) {
    var m = STATUS[s.code] || STATUS.received;
    var miss = (s.missing || []).filter(function (x) { return KK.DOC_LABELS[x]; });
    return '<div class="card status-card ' + m.tone + '"><div class="small muted">' + KK.esc(caseId) + (s.lane === 'Emergency' ? ' · ' + bi({ en: 'Emergency', hi: 'आपातकाल' }) : '') + '</div>' +
      '<h2 style="margin:.2em 0 .4em">' + bi(m.t) + '</h2><p>' + bi(m.d) + '</p>' +
      (s.followUpDue ? '<p><b>' + bi({ en: 'Due by ', hi: 'अंतिम तारीख़: ' }) + KK.esc(s.followUpDue) + '</b></p>' : '') +
      (miss.length ? '<ul class="list-plain">' + miss.map(function (x) { return '<li>' + bi(KK.DOC_LABELS[x]) + '</li>'; }).join('') + '</ul>' : '') +
      (/info_needed|followup_due|paid|received|verifying|approved/.test(s.code) ? '<a class="btn btn-primary" href="followup.html?case=' + encodeURIComponent(caseId) + '">' + bi({ en: 'Add documents or photos', hi: 'दस्तावेज़ या फ़ोटो जोड़ें' }) + '</a>' : '') + '</div>';
  };

  function verifyForm(el, onOk, action, submitText) {
    var pre = KK.qs('case');
    el.innerHTML = '<div class="form-shell"><div class="field"><label for="v-case">' + bi({ en: 'Case ID', hi: 'केस ID' }) + '</label><input type="text" id="v-case" maxlength="12" placeholder="KK-2611-0007" value="' + KK.esc(pre) + '" autocapitalize="characters"></div>' +
      '<div class="field"><label for="v-last4">' + bi({ en: 'Last 4 digits of your phone number', hi: 'आपके फ़ोन नंबर के आख़िरी 4 अंक' }) + '</label><input type="text" id="v-last4" inputmode="numeric" maxlength="4" autocomplete="off"></div>' +
      '<button class="btn btn-primary" id="v-go">' + bi(submitText) + '</button><div class="error" id="v-err" role="alert"></div></div><div id="v-out" style="margin-top:16px"></div>';
    document.getElementById('v-go').onclick = function () {
      var btn = this, caseId = document.getElementById('v-case').value.trim().toUpperCase(), last4 = document.getElementById('v-last4').value.trim();
      var err = document.getElementById('v-err');
      if (!/^KK-\d{4}-\d{4}$/.test(caseId) || !/^\d{4}$/.test(last4)) { err.textContent = KK.errorText('not_found'); return; }
      err.textContent = ''; btn.disabled = true;
      KK.api(action, { caseId: caseId, last4: last4 }, { retries: 1, timeout: 30000 }).then(function (r) {
        btn.disabled = false;
        if (!r.ok) { err.textContent = KK.errorText(r.error); return; }
        onOk(r, caseId);
      }).catch(function () { btn.disabled = false; err.textContent = KK.errorText('offline'); });
    };
  }

  KK.bootTrack = function () {
    var el = document.getElementById('track');
    if (!el) return;
    verifyForm(el, function (r, caseId) { document.getElementById('v-out').innerHTML = KK.statusHtml(caseId, r.status); }, 'status', { en: 'Check status', hi: 'स्थिति देखें' });
  };

  /* ---------- follow-up uploads ---------- */
  KK.bootFollowup = function () {
    var el = document.getElementById('followup');
    if (!el) return;
    verifyForm(el, function (r, caseId) {
      var s = r.status, miss = s.missing || [];
      var wantDocs = s.code === 'info_needed';
      var afterPay = s.code === 'paid' || s.code === 'followup_due';
      document.getElementById('v-out').innerHTML = KK.statusHtml(caseId, s).replace(/<a class="btn btn-primary"[^>]*>[\s\S]*?<\/a>/, '') + '<div class="form-shell" id="fu-form"></div>';
      var has = function (code) { return miss.indexOf(code) >= 0; };
      var fields = [
        { name: 'f_fu_photo', type: 'files', kind: afterPay ? 'followup_photo' : 'animal_photo', media: 'image', max: 5, required: afterPay || has('photo'),
          label: afterPay ? { en: 'A recent photo of the animal', hi: 'जानवर की हाल की फ़ोटो' } : { en: 'Photos of the animal', hi: 'जानवर की फ़ोटो' } },
        { name: 'f_fu_bill', type: 'files', kind: afterPay ? 'followup_bill' : 'bill', media: 'doc', max: 4, required: afterPay || has('bill'),
          label: afterPay ? { en: 'Final bill / receipt', hi: 'अंतिम बिल / रसीद' } : { en: 'Bills or invoices', hi: 'बिल या इनवॉइस' } },
        { name: 'f_fu_presc', type: 'files', kind: 'prescription', media: 'doc', max: 3, show: function () { return !afterPay; }, label: { en: "Vet's prescription", hi: 'डॉक्टर का पर्चा' } },
        { name: 'f_fu_est', type: 'files', kind: 'estimate', media: 'doc', max: 3, show: function () { return !afterPay; }, required: has('itemised') || has('quote'),
          label: { en: 'Estimate or quotation', hi: 'एस्टिमेट या कोटेशन' } },
        { name: 'f_fu_proof', type: 'files', kind: 'payment_proof', media: 'doc', max: 3, show: function () { return !afterPay; }, required: has('payment_proof'),
          label: { en: 'Proof of your payment', hi: 'आपके भुगतान का सबूत' } },
        { name: 'f_fu_other', type: 'files', kind: 'other_doc', media: 'doc', max: 3, label: { en: 'Anything else', hi: 'कुछ और' } },
        { name: 'note', type: 'textarea', maxlength: 1000, required: has('clinic_contact') || has('payee_details'),
          label: wantDocs && (has('clinic_contact') || has('payee_details'))
            ? { en: 'Clinic name & phone, or who to pay (name + UPI ID)', hi: 'क्लिनिक का नाम और फ़ोन, या किसे भुगतान करना है (नाम + UPI ID)' }
            : { en: 'A short update or message', hi: 'छोटा-सा अपडेट या संदेश' } },
      ];
      new KK.Form({ el: document.getElementById('fu-form'), id: 'followup-' + caseId, funnel: 'followup', review: false,
        steps: [{ key: 'fu', title: { en: 'Add documents & photos', hi: 'दस्तावेज़ और फ़ोटो जोड़ें' }, fields: fields }],
        submitLabel: { en: 'Send', hi: 'भेजें' },
        onSubmit: function (data, files, ui) {
          if (!files.length && !String(data.note || '').trim()) return ui.fail(KK.t({ en: 'Add at least one file or a message.', hi: 'कम से कम एक फ़ाइल या संदेश जोड़ें।' }), true);
          ui.progress(5, { en: 'Sending…', hi: 'भेजा जा रहा है…' });
          return KK.uploadAll(caseId, r.token, files, function (i, n) {
            ui.progress(10 + 80 * i / Math.max(1, n), { en: 'Uploading file ' + (i + 1) + ' of ' + n + '…', hi: 'फ़ाइल ' + (i + 1) + '/' + n + ' अपलोड हो रही है…' });
          }).then(function (failed) {
            return KK.api('followup_finalize', { caseId: caseId, token: r.token, note: data.note || '' }, { retries: 2 }).then(function (fin) {
              if (!fin.ok) return ui.fail(KK.errorText(fin.error), false);
              ui.done('<div class="done-box"><div style="font-size:44px" aria-hidden="true">🐾</div><h2>' + bi({ en: 'Thank you, received', hi: 'धन्यवाद, मिल गया' }) + '</h2>' +
                (failed ? '<p class="notice red">' + bi({ en: failed + ' file(s) failed. Please try again.', hi: failed + ' फ़ाइल अपलोड नहीं हुईं। कृपया फिर कोशिश करें।' }) + '</p>' : '') + '</div>' + KK.statusHtml(caseId, fin.status).replace(/<a class="btn btn-primary"[^>]*>[\s\S]*?<\/a>/, ''));
            });
          });
        } });
    }, 'followup_start', { en: 'Continue', hi: 'आगे बढ़ें' });
  };

  /* ---------- partner interest ---------- */
  KK.bootPartners = function () {
    var el = document.getElementById('partner-form');
    if (!el) return;
    new KK.Form({ el: el, id: 'partner', funnel: 'partner', review: false, submitLabel: { en: 'Send', hi: 'भेजें' },
      steps: [{ key: 'p', title: { en: 'Become a referral partner', hi: 'रेफ़रल पार्टनर बनें' }, fields: [
        { name: 'type', type: 'radio', required: true, cols: 3, label: { en: 'You are a…', hi: 'आप हैं…' }, options: [
          { value: 'vet', label: { en: 'Vet', hi: 'डॉक्टर' } }, { value: 'clinic', label: { en: 'Clinic / hospital', hi: 'क्लिनिक / अस्पताल' } },
          { value: 'rescuer', label: { en: 'Rescuer', hi: 'रेस्क्यूअर' } }, { value: 'feeder', label: { en: 'Feeder', hi: 'फ़ीडर' } },
          { value: 'ngo', label: { en: 'NGO / shelter', hi: 'NGO / शेल्टर' } }, { value: 'foster', label: { en: 'Foster', hi: 'फ़ॉस्टर' } }] },
        { name: 'name', type: 'text', required: true, maxlength: 80, label: { en: 'Your name', hi: 'आपका नाम' } },
        { name: 'organisation', type: 'text', maxlength: 120, label: { en: 'Clinic / organisation', hi: 'क्लिनिक / संस्था' } },
        { name: 'area', type: 'text', required: true, maxlength: 120, label: { en: 'Area', hi: 'इलाका' } },
        { name: 'phone', type: 'tel', required: true, prefix: '+91', maxlength: 15, label: { en: 'Mobile (WhatsApp)', hi: 'मोबाइल (WhatsApp)' } },
        { name: 'email', type: 'email', maxlength: 120, label: { en: 'Email', hi: 'ईमेल' } },
        { name: 'upi', type: 'text', kind: 'upi', maxlength: 80, show: function (d) { return d.type === 'vet' || d.type === 'clinic'; }, label: { en: 'Clinic UPI ID for direct payments', hi: 'सीधे भुगतान के लिए क्लिनिक का UPI ID' } },
        { name: 'regNo', type: 'text', maxlength: 40, show: function (d) { return d.type === 'vet'; }, label: { en: 'Veterinary council registration no.', hi: 'पशु चिकित्सा परिषद पंजीकरण संख्या' } },
        { name: 'message', type: 'textarea', maxlength: 1500, label: { en: 'Anything you would like us to know', hi: 'कुछ और जो आप बताना चाहें' } },
        { name: 'consent', type: 'checkbox', required: true, label: { en: 'You may contact me about referrals and verification.', hi: 'आप रेफ़रल और जाँच के बारे में मुझसे संपर्क कर सकते हैं।' } },
      ] }],
      onSubmit: function (data, files, ui, meta) {
        ui.progress(30, { en: 'Sending…', hi: 'भेजा जा रहा है…' });
        return KK.api('partner_interest', { form: data, hp: meta.hp, elapsedMs: meta.elapsedMs }, { retries: 1 }).then(function (r) {
          if (!r.ok) return ui.fail(KK.errorText(r.error), r.error === 'invalid' || r.error === 'too_fast');
          ui.done('<div class="done-box"><div style="font-size:44px">🤝</div><h2>' + bi({ en: 'Thank you!', hi: 'धन्यवाद!' }) + '</h2><p>' +
            bi({ en: 'We will WhatsApp you within a few days to say hello and share how referrals work.', hi: 'हम कुछ दिनों में आपको WhatsApp करेंगे और बताएँगे कि रेफ़रल कैसे काम करते हैं।' }) + '</p></div>');
        });
      } });
  };
})();
