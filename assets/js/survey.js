/* Koki & Khabib Animal Aid — professional research survey (vets, rescuers, feeders, fosters, NGOs). About 6 minutes. */
(function () {
  'use strict';
  var KK = window.KK;
  var o = function (value, en, hi) { return { value: value, label: { en: en, hi: hi } }; };
  var isVet = function (d) { return d.Role === 'vet'; };
  var notFeeder = function (d) { return d.Role && d.Role !== 'feeder'; };
  var band = function (name, en, hi, opts, show) {
    return { name: name, type: 'select', show: show || notFeeder, label: { en: en, hi: hi }, options: opts.map(function (x) { return o(x[0], x[1], x[2] || x[1]); }).concat([o('dk', "Don't know", 'पता नहीं')]) };
  };
  var EXP = [
    o('consult', 'Vet consultation', 'डॉक्टर की फ़ीस'), o('medicines', 'Medicines', 'दवाइयाँ'), o('diagnostics', 'Tests / X-ray / scans', 'जाँच / एक्स-रे / स्कैन'),
    o('wound', 'Wound care & dressings', 'घाव की देखभाल और ड्रेसिंग'), o('surgery', 'Surgery', 'ऑपरेशन'), o('boarding', 'Hospitalisation / boarding', 'भर्ती / रखने की जगह'),
    o('aftercare', 'Follow-up & recovery care', 'आगे का इलाज और रिकवरी'), o('food', 'Food', 'खाना'), o('transport', 'Transport / ambulance', 'किराया / एम्बुलेंस'),
    o('sterilisation', 'Sterilisation', 'नसबंदी'), o('vaccination', 'Vaccination', 'टीकाकरण'), o('emergency_fees', 'After-hours emergency fees', 'रात/आपातकालीन फ़ीस'),
  ];

  var STEPS = [
    {
      key: 'you', title: { en: 'About you', hi: 'आपके बारे में' },
      intro: { en: 'Thank you for helping us design this fairly. About 6 minutes; most questions are tap-to-answer. Your answers stay private.', hi: 'इसे सही ढंग से बनाने में मदद के लिए धन्यवाद। लगभग 6 मिनट; ज़्यादातर सवाल बस चुनकर जवाब देने वाले हैं। आपके जवाब निजी रहेंगे।' },
      fields: [
        { name: 'Role', type: 'radio', required: true, cols: 2, label: { en: 'Your main role', hi: 'आपकी मुख्य भूमिका' }, options: [
          o('vet', 'Vet / clinic / hospital', 'डॉक्टर / क्लिनिक / अस्पताल'), o('rescuer', 'Independent rescuer', 'स्वतंत्र रेस्क्यूअर'),
          o('feeder', 'Community feeder / caretaker', 'सामुदायिक फ़ीडर / देखभालकर्ता'), o('foster', 'Foster caregiver / coordinator', 'फ़ॉस्टर देखभालकर्ता / समन्वयक'),
          o('ngo', 'NGO / shelter', 'NGO / शेल्टर')] },
        { name: 'Name', type: 'text', required: true, maxlength: 80, label: { en: 'Your name', hi: 'आपका नाम' } },
        { name: 'Organisation', type: 'text', maxlength: 120, label: { en: 'Clinic / organisation (if any)', hi: 'क्लिनिक / संस्था (अगर हो)' } },
        { name: 'Area', type: 'text', required: true, maxlength: 120, label: { en: 'Area(s) of Mumbai you work in', hi: 'मुंबई के किन इलाकों में आप काम करते हैं' } },
        { name: 'Experience', type: 'radio', required: true, cols: 3, label: { en: 'Years of experience with animal welfare', hi: 'पशु कल्याण में कितने साल का अनुभव' }, options: [
          o('lt1', 'Under 1', '1 से कम'), o('1-3', '1–3', '1–3'), o('3-5', '3–5', '3–5'), o('5-10', '5–10', '5–10'), o('10+', '10+', '10+')] },
        { name: 'CasesPerMonth', type: 'radio', required: true, cols: 3, label: { en: 'In a typical month, how many animals do you see where money is the main obstacle?', hi: 'एक सामान्य महीने में, आप ऐसे कितने जानवर देखते हैं जिनके इलाज/देखभाल में पैसा मुख्य रुकावट है?' }, options: [
          o('0-2', '0–2', '0–2'), o('3-5', '3–5', '3–5'), o('6-10', '6–10', '6–10'), o('11-20', '11–20', '11–20'), o('20+', 'More than 20', '20 से ज़्यादा')] },
      ],
    },
    {
      key: 'gaps', title: { en: 'Where money runs short', hi: 'पैसा कहाँ कम पड़ता है' },
      fields: [
        { name: 'ShortfallFreq', type: 'radio', required: true, label: { en: 'How often does a shortfall delay or stop care?', hi: 'पैसे की कमी से कितनी बार इलाज/देखभाल में देरी होती है या रुक जाती है?' }, options: [
          o('rarely', 'Rarely', 'कभी-कभार'), o('monthly', 'About once a month', 'महीने में लगभग एक बार'), o('weekly', 'About once a week', 'हफ़्ते में लगभग एक बार'),
          o('several_week', 'Several times a week', 'हफ़्ते में कई बार'), o('daily', 'Almost daily', 'लगभग रोज़')] },
        { name: 'UnfundedExpenses', type: 'checks', required: true, cols: 2, label: { en: 'Which expenses most often go unfunded? (tick all)', hi: 'कौन-से खर्च सबसे ज़्यादा बिना पैसे के रह जाते हैं? (सब चुनें)' }, options: EXP },
        { name: 'HesitationCauses', type: 'checks', required: true, cols: 2, label: { en: 'What makes ordinary people hesitate to help an animal?', hi: 'आम लोग किसी जानवर की मदद करने से क्यों हिचकिचाते हैं?' }, options: [
          o('unknown_cost', "Not knowing what it will cost", 'पता नहीं कि कितना खर्च होगा'), o('upfront', 'Paying upfront at the clinic', 'क्लिनिक में पहले पैसे देना'),
          o('transport', 'Getting the animal to a vet', 'जानवर को डॉक्टर तक ले जाना'), o('ongoing', 'Ongoing costs after the first visit', 'पहली बार के बाद लगातार खर्च'),
          o('responsibility', 'Fear of being left responsible', 'ज़िम्मेदारी में फँस जाने का डर'), o('time', 'Time off work', 'काम से छुट्टी'),
          o('knowledge', "Not knowing where to go", 'पता नहीं कहाँ जाएँ'), o('other', 'Something else', 'कुछ और')] },
        { name: 'Bottleneck1', type: 'select', required: true, label: { en: 'The #1 funding bottleneck', hi: 'पैसे की सबसे बड़ी रुकावट (#1)' }, options: EXP },
        { name: 'Bottleneck2', type: 'select', label: { en: '#2', hi: '#2' }, options: EXP },
        { name: 'Bottleneck3', type: 'select', label: { en: '#3', hi: '#3' }, options: EXP },
      ],
    },
    {
      key: 'costs', title: { en: 'Typical costs in Mumbai', hi: 'मुंबई में आम खर्च' },
      intro: { en: 'Rough ranges are perfect — we use them to spot unusual estimates.', hi: 'मोटा-मोटा अंदाज़ा काफ़ी है — इससे हम असामान्य एस्टिमेट पहचान पाते हैं।' },
      fields: [
        band('CostConsult', 'Vet consultation (private clinic)', 'डॉक्टर की फ़ीस (प्राइवेट क्लिनिक)', [['lt300', 'Under ₹300', '₹300 से कम'], ['300-600', '₹300–600'], ['600-1000', '₹600–1,000'], ['1000-2000', '₹1,000–2,000'], ['gt2000', 'Above ₹2,000', '₹2,000 से ज़्यादा']], function (d) { return !!d.Role; }),
        band('CostMeds', 'Medicines for a one-week course', 'एक हफ़्ते की दवाइयाँ', [['lt300', 'Under ₹300', '₹300 से कम'], ['300-700', '₹300–700'], ['700-1500', '₹700–1,500'], ['1500-3000', '₹1,500–3,000'], ['gt3000', 'Above ₹3,000', '₹3,000 से ज़्यादा']]),
        band('CostDiagnostics', 'Basic tests (blood test + X-ray)', 'बुनियादी जाँच (ब्लड टेस्ट + एक्स-रे)', [['lt1000', 'Under ₹1,000', '₹1,000 से कम'], ['1000-2500', '₹1,000–2,500'], ['2500-5000', '₹2,500–5,000'], ['gt5000', 'Above ₹5,000', '₹5,000 से ज़्यादा']]),
        band('CostWound', 'One wound dressing', 'एक बार की ड्रेसिंग', [['lt200', 'Under ₹200', '₹200 से कम'], ['200-500', '₹200–500'], ['500-1000', '₹500–1,000'], ['gt1000', 'Above ₹1,000', '₹1,000 से ज़्यादा']]),
        band('CostSurgeryMinor', 'Minor surgery', 'छोटा ऑपरेशन', [['lt3000', 'Under ₹3,000', '₹3,000 से कम'], ['3000-6000', '₹3,000–6,000'], ['6000-12000', '₹6,000–12,000'], ['gt12000', 'Above ₹12,000', '₹12,000 से ज़्यादा']]),
        band('CostSurgeryMajor', 'Major surgery (e.g. fracture)', 'बड़ा ऑपरेशन (जैसे हड्डी टूटना)', [['lt10000', 'Under ₹10,000', '₹10,000 से कम'], ['10000-20000', '₹10,000–20,000'], ['20000-40000', '₹20,000–40,000'], ['gt40000', 'Above ₹40,000', '₹40,000 से ज़्यादा']]),
        band('CostSterilisation', 'Sterilisation (private clinic)', 'नसबंदी (प्राइवेट क्लिनिक)', [['lt1500', 'Under ₹1,500', '₹1,500 से कम'], ['1500-3000', '₹1,500–3,000'], ['3000-6000', '₹3,000–6,000'], ['gt6000', 'Above ₹6,000', '₹6,000 से ज़्यादा']]),
        band('CostBoardingDay', 'Medical boarding / hospital stay, per day', 'इलाज के दौरान रखना / भर्ती, प्रति दिन', [['lt300', 'Under ₹300', '₹300 से कम'], ['300-700', '₹300–700'], ['700-1500', '₹700–1,500'], ['gt1500', 'Above ₹1,500', '₹1,500 से ज़्यादा']]),
        band('CostFoodMonth', 'Feeding one community animal for a month', 'एक सामुदायिक जानवर को एक महीने खिलाना', [['lt300', 'Under ₹300', '₹300 से कम'], ['300-600', '₹300–600'], ['600-1000', '₹600–1,000'], ['gt1000', 'Above ₹1,000', '₹1,000 से ज़्यादा']], function (d) { return !!d.Role; }),
        band('CostTransport', 'One trip to a vet (auto / taxi / ambulance)', 'डॉक्टर तक एक बार जाना (ऑटो / टैक्सी / एम्बुलेंस)', [['lt200', 'Under ₹200', '₹200 से कम'], ['200-500', '₹200–500'], ['500-1000', '₹500–1,000'], ['gt1000', 'Above ₹1,000', '₹1,000 से ज़्यादा']], function (d) { return !!d.Role; }),
      ],
    },
    {
      key: 'funding', title: { en: 'Using limited money well', hi: 'सीमित पैसे का सही उपयोग' },
      fields: [
        { name: 'HighImpactUses', type: 'checks', required: true, cols: 2, label: { en: 'Where does a small amount (₹500–₹2,000) make the biggest difference? (up to 3)', hi: 'छोटी राशि (₹500–₹2,000) सबसे ज़्यादा फ़र्क़ कहाँ डालती है? (अधिकतम 3)' }, options: EXP,
          validate: function (v) { return v.length > 3 ? { en: 'Please choose up to 3.', hi: 'कृपया अधिकतम 3 चुनें।' } : null; } },
        { name: 'RecurringNeeds', type: 'checks', cols: 2, label: { en: 'Which needs keep coming back month after month?', hi: 'कौन-सी ज़रूरतें हर महीने बार-बार आती हैं?' }, options: [
          o('food', 'Food', 'खाना'), o('chronic_meds', 'Medicines for long-term illness', 'लंबी बीमारी की दवाइयाँ'), o('dressings', 'Series of dressings', 'लगातार ड्रेसिंग'),
          o('boarding', 'Boarding / recovery space', 'रखने / रिकवरी की जगह'), o('none', 'Mostly one-time needs', 'ज़्यादातर एक बार की ज़रूरतें')] },
        { name: 'PartialVsFull', type: 'radio', required: true, label: { en: 'With a fixed budget, which is better?', hi: 'तय बजट में क्या बेहतर है?' }, options: [
          o('partial_many', 'Partial help for more animals', 'ज़्यादा जानवरों की आंशिक मदद'), o('full_few', 'Full help for fewer animals', 'कम जानवरों की पूरी मदद'),
          o('depends', 'Depends on the case', 'केस पर निर्भर है')] },
        { name: 'MinEvidence', type: 'checks', required: true, cols: 2, label: { en: 'What is a reasonable minimum proof to ask for?', hi: 'कम से कम कौन-सा सबूत माँगना उचित है?' }, options: [
          o('photo', 'Photo of the animal', 'जानवर की फ़ोटो'), o('video', 'Short video', 'छोटा वीडियो'), o('prescription', 'Vet prescription', 'डॉक्टर का पर्चा'),
          o('estimate', 'Written estimate', 'लिखित एस्टिमेट'), o('bill', 'Bill / invoice', 'बिल / इनवॉइस'), o('clinic_call', 'A call to the clinic', 'क्लिनिक को फ़ोन'),
          o('followup', 'Follow-up photo after treatment', 'इलाज के बाद फ़ॉलो-अप फ़ोटो')] },
        { name: 'DocsClinicsProvide', type: 'checks', cols: 2, show: isVet, label: { en: 'What can your clinic usually provide?', hi: 'आपका क्लिनिक आमतौर पर क्या दे सकता है?' }, options: [
          o('prescription', 'Written prescription', 'लिखित पर्चा'), o('itemised_estimate', 'Itemised estimate', 'विस्तृत एस्टिमेट'), o('bill', 'Bill / receipt', 'बिल / रसीद'),
          o('letterhead', 'Letter on letterhead / stamp', 'लेटरहेड / मुहर वाला पत्र'), o('whatsapp', 'WhatsApp confirmation', 'WhatsApp पर पुष्टि'), o('phone', 'Phone confirmation', 'फ़ोन पर पुष्टि')] },
        { name: 'BurdensomeChecks', type: 'checks', cols: 2, label: { en: 'Which checks would be too much of a burden in practice?', hi: 'असल में कौन-सी जाँचें बहुत बोझ बन जाएँगी?' }, options: [
          o('original_bills_first', 'Original bills before any payment', 'भुगतान से पहले मूल बिल'), o('letterhead', 'Estimate on letterhead', 'लेटरहेड पर एस्टिमेट'),
          o('video', 'A video', 'वीडियो'), o('id_proof', 'ID proof of the applicant', 'आवेदक का पहचान पत्र'), o('followup_photos', 'Follow-up photos', 'फ़ॉलो-अप फ़ोटो'),
          o('clinic_calls', 'Calls to the clinic', 'क्लिनिक को फ़ोन'), o('none', 'None of these', 'इनमें से कोई नहीं')] },
      ],
    },
    {
      key: 'risks', title: { en: 'Risks & payments', hi: 'जोखिम और भुगतान' },
      fields: [
        { name: 'FraudPatterns', type: 'checks', required: true, cols: 2, label: { en: 'Misuse you have seen or heard of', hi: 'आपने कौन-सा दुरुपयोग देखा या सुना है' }, options: [
          o('reused_photos', 'Same photos reused for many appeals', 'कई अपीलों में वही फ़ोटो'), o('inflated', 'Inflated estimates', 'बढ़ा-चढ़ाकर बताए गए एस्टिमेट'),
          o('fake_bills', 'Fake or edited bills', 'नकली या बदले हुए बिल'), o('multi_donor', 'Collecting from many donors for one case', 'एक केस के लिए कई लोगों से पैसे लेना'),
          o('no_animal', 'Animal not real / not present', 'जानवर असली नहीं / मौजूद नहीं'), o('diverted', 'Money used for something else', 'पैसा किसी और काम में लगाना'),
          o('none_seen', "I haven't seen misuse", 'मैंने दुरुपयोग नहीं देखा')] },
        { name: 'PaymentMethods', type: 'checks', required: true, cols: 2, label: { en: 'Practical ways to pay clinics and suppliers', hi: 'क्लिनिक और सप्लायर को भुगतान के व्यावहारिक तरीके' }, options: [
          o('upi', 'UPI', 'UPI'), o('bank', 'Bank transfer', 'बैंक ट्रांसफ़र'), o('card', 'Card', 'कार्ड'), o('cash', 'Cash only', 'केवल नकद')] },
        { name: 'DirectPayComfort', type: 'radio', required: true, cols: 3,
          label: { en: 'Would direct payment to the clinic (instead of to the person) work?', hi: 'क्या व्यक्ति की जगह सीधे क्लिनिक को भुगतान ठीक रहेगा?' }, options: [
            o('yes', 'Yes', 'हाँ'), o('maybe', 'Sometimes', 'कभी-कभी'), o('no', 'No', 'नहीं')] },
        { name: 'VerificationLimits', type: 'textarea', maxlength: 1000, label: { en: 'What can not realistically be verified?', hi: 'क्या चीज़ें असल में जाँची नहीं जा सकतीं?' } },
        { name: 'ShouldExclude', type: 'textarea', maxlength: 1000, label: { en: 'What should a small fund NOT pay for?', hi: 'एक छोटे फ़ंड को किन चीज़ों का खर्च नहीं उठाना चाहिए?' } },
        { name: 'BiggestRisks', type: 'textarea', maxlength: 1000, label: { en: 'The biggest risk in running a fund like this', hi: 'ऐसा फ़ंड चलाने में सबसे बड़ा जोखिम' } },
        { name: 'MistakesToAvoid', type: 'textarea', maxlength: 1000, label: { en: 'Mistakes a small initiative should avoid', hi: 'छोटी पहल को किन ग़लतियों से बचना चाहिए' } },
      ],
    },
    {
      key: 'last', title: { en: 'Last few', hi: 'आख़िरी कुछ सवाल' },
      fields: [
        { name: 'TrustSuggestions', type: 'textarea', maxlength: 1000, label: { en: 'How could we earn trust and work faster?', hi: 'हम भरोसा कैसे बना सकते हैं और तेज़ी से काम कैसे कर सकते हैं?' } },
        { name: 'PartnerWilling', type: 'radio', required: true, cols: 3, label: { en: 'Would you be willing to refer cases or help verify them?', hi: 'क्या आप केस भेजने या उनकी जाँच में मदद करना चाहेंगे?' }, options: [
          o('yes', 'Yes', 'हाँ'), o('maybe', 'Maybe', 'शायद'), o('no', 'No', 'नहीं')] },
        { name: 'Phone', type: 'tel', prefix: '+91', maxlength: 15, required: function (d) { return d.PartnerWilling === 'yes'; }, label: { en: 'Mobile (WhatsApp)', hi: 'मोबाइल (WhatsApp)' } },
        { name: 'Email', type: 'email', maxlength: 120, label: { en: 'Email', hi: 'ईमेल' } },
        { name: 'Feedback', type: 'textarea', maxlength: 1500, label: { en: 'Anything else?', hi: 'कुछ और?' } },
      ],
    },
  ];

  KK.bootSurvey = function () {
    var el = document.getElementById('survey-form');
    if (!el) return;
    new KK.Form({ el: el, id: 'survey', funnel: 'survey', steps: STEPS, submitLabel: { en: 'Send my answers', hi: 'मेरे जवाब भेजें' },
      onSubmit: function (data, files, ui, meta) {
        ui.progress(40, { en: 'Sending…', hi: 'भेजा जा रहा है…' });
        var answers = {};
        Object.keys(data).forEach(function (k) { if (/^[A-Z]/.test(k)) answers[k] = data[k]; });
        return KK.api('survey', { answers: answers, hp: meta.hp, elapsedMs: meta.elapsedMs }, { retries: 1 }).then(function (r) {
          if (!r.ok) return ui.fail(KK.errorText(r.error), r.error === 'invalid' || r.error === 'too_fast');
          ui.done('<div class="done-box"><div style="font-size:44px">🙏</div><h2>' + KK.bi({ en: 'Thank you!', hi: 'धन्यवाद!' }) + '</h2><p>' +
            KK.bi({ en: 'Your answers will directly shape how this initiative decides and pays. If you said you would like to be a partner, we will be in touch.', hi: 'आपके जवाब सीधे तय करेंगे कि यह पहल कैसे फ़ैसले लेती है और भुगतान करती है। अगर आपने पार्टनर बनने के लिए हाँ कहा है, तो हम संपर्क करेंगे।' }) + '</p></div>');
        });
      } });
  };
})();
